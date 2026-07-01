from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from auth.routes import router as auth_router
from rag.routes import router as rag_router

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(rag_router, prefix="/rag", tags=["RAG"])

@app.on_event("startup")
def startup():
    try:
        from rag.qdrant_client import init_qdrant
        init_qdrant()
    except Exception as e:
        print(f"[WARNING] Qdrant not available: {e}")
    try:
        from db.mongo import create_indexes
        create_indexes()
    except Exception as e:
        print(f"[WARNING] MongoDB index creation failed: {e}")

@app.get("/")
def root():
    return {"message": "AI RAG SaaS Running 🚀"}
