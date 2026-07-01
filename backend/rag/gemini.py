import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API"))

MODEL = "llama-3.3-70b-versatile"

def generate_answer(prompt: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content

def stream_answer(prompt: str):
    stream = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
