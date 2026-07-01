from rag.retrieval import search
from rag.gemini import generate_answer

def route_query(query: str):
    if "summarize" in query.lower():
        return "summarize"
    return "qa"

def answer_query(query: str, user_id: str):
    route = route_query(query)

    docs = search(query, user_id)
    context = "\n".join(docs)

    if route == "summarize":
        prompt = f"Summarize the following:\n{context}"
    else:
        prompt = f"""
        Answer ONLY from context.
        If not found, say "I don't know".

        Context:
        {context}

        Question: {query}
        """

    return generate_answer(prompt)