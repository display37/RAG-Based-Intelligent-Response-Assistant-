from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client.http.models import PointStruct
from rag.qdrant_client import client, COLLECTION_NAME
from rag.embeddings import embed
import uuid

def process_document(text: str, user_id: str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    vectors = embed(chunks)

    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=vec,
            payload={"text": chunks[i], "user": user_id}
        )
        for i, vec in enumerate(vectors)
    ]

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )