from fastapi import APIRouter, Depends, Header, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from auth.utils import verify_token
from rag.pipeline import process_document
from rag.retrieval import search
from rag.gemini import stream_answer
from db.mongo import chats_collection
import uuid
import io

try:
    import pypdf
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

router = APIRouter()

def get_current_user(authorization: str = Header(...)):
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["user_id"]

@router.post("/upload")
async def upload(background_tasks: BackgroundTasks, file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    content = await file.read()
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        if not HAS_PYPDF:
            raise HTTPException(status_code=500, detail="pypdf not installed")
        reader = pypdf.PdfReader(io.BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    elif filename.endswith(".txt"):
        text = content.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    background_tasks.add_task(process_document, text, user_id)
    return {"message": f"'{file.filename}' received and indexing in background"}

@router.post("/stream")
def stream(q: str, chat_id: str = None, user_id: str = Depends(get_current_user)):

    is_new_chat = not chat_id
    if is_new_chat:
        chat_id = str(uuid.uuid4())
        # Use first 40 chars of question as chat title
        title = q[:40] + ("..." if len(q) > 40 else "")
        chats_collection.insert_one({
            "chat_id": chat_id,
            "user_id": user_id,
            "title": title,
            "messages": []
        })

    try:
        docs = search(q, user_id)
        context = "\n".join(docs) if docs else ""
    except Exception:
        context = ""

    prompt = f"""You are a helpful AI assistant. The user has uploaded a document.
Use the following extracted content from the document to answer the question accurately.
If the answer is not found in the document, say: "I couldn't find that information in the uploaded document."

Document content:
{context}

Question: {q}

Answer based on the document content above.""" if context else f"""You are a helpful AI assistant.
Answer the following question. If you are unsure, say so clearly.

Question: {q}"""

    def generate():
        ai_response = ""
        try:
            for chunk in stream_answer(prompt):
                ai_response += chunk
                yield chunk
        except Exception as e:
            yield f"\n[Error generating response: {str(e)}]"
            return

        try:
            chats_collection.update_one(
                {"chat_id": chat_id},
                {
                    "$push": {
                        "messages": {
                            "$each": [
                                {"role": "user", "text": q},
                                {"role": "assistant", "text": ai_response}
                            ]
                        }
                    }
                }
            )
        except Exception as e:
            print(f"[WARNING] Failed to save chat to MongoDB: {e}")

    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={
            "X-Chat-Id": chat_id,
            "Access-Control-Expose-Headers": "X-Chat-Id",
        }
    )

@router.get("/chats")
def get_chats(user_id: str = Depends(get_current_user)):
    chats = list(chats_collection.find({"user_id": user_id}, sort=[("_id", -1)]))
    return [{"chat_id": c["chat_id"], "title": c.get("title", c["chat_id"][:8])} for c in chats]

@router.get("/chat/{chat_id}")
def get_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    chat = chats_collection.find_one({"chat_id": chat_id, "user_id": user_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat["messages"]

@router.delete("/chat/{chat_id}")
def delete_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    result = chats_collection.delete_one({"chat_id": chat_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"message": "Chat deleted"}
