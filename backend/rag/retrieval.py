from qdrant_client.http.models import Filter, FieldCondition, MatchValue
from rag.qdrant_client import client, COLLECTION_NAME
from rag.embeddings import embed

def search(query: str, user_id: str):
    query_vector = embed([query])[0]

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=Filter(
            must=[FieldCondition(key="user", match=MatchValue(value=user_id))]
        ),
        limit=5,
        with_payload=True,
    )

    points = results.points
    return [p.payload["text"] for p in points if p.payload.get("text")]
