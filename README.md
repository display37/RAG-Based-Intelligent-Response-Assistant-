# RAG-Based Intelligent Response Assistant

A full-stack SaaS application that lets users upload documents (PDF/TXT) and chat with them using AI, powered by a Retrieval-Augmented Generation (RAG) pipeline.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square) ![Stack](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square) ![Stack](https://img.shields.io/badge/LLM-Groq%20%28LLaMA%203.3%29-F55036?style=flat-square) ![Stack](https://img.shields.io/badge/VectorDB-Qdrant-DC244C?style=flat-square) ![Stack](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square)

---

## Features

- **Document Upload** — Upload PDF or TXT files and index them for retrieval
- **RAG Chat** — Ask questions about your documents; answers are grounded in your content
- **Streaming Responses** — Real-time token-by-token streaming via Server-Sent Events
- **Chat History** — All conversations are saved and resumable per user
- **Authentication** — JWT-based register/login with bcrypt password hashing
- **Per-user Isolation** — Each user's documents and chats are fully isolated
- **Markdown Rendering** — Responses render with full markdown + syntax-highlighted code blocks

---

## Architecture

```
React Frontend
     │
     ▼
FastAPI Backend
     ├── Auth (JWT + bcrypt)         → MongoDB (users)
     ├── RAG Pipeline                → Qdrant (vectors)
     │     ├── Embeddings (MiniLM)
     │     ├── Retrieval (cosine similarity)
     │     └── Generation (Groq / LLaMA 3.3 70B)
     └── Chat History                → MongoDB (chats)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS, React Router, Axios |
| Backend | FastAPI, Python 3.13 |
| LLM | Groq API — `llama-3.3-70b-versatile` |
| Embeddings | `sentence-transformers` — `all-MiniLM-L6-v2` (384-dim) |
| Vector DB | Qdrant (cosine similarity) |
| Database | MongoDB Atlas |
| Auth | JWT (`python-jose`) + bcrypt (`passlib`) |

---

## Project Structure

```
AI_RAG_SAAS/
├── backend/
│   ├── auth/
│   │   ├── routes.py        # Register, login, /me endpoints
│   │   └── utils.py         # JWT create/verify
│   ├── db/
│   │   └── mongo.py         # MongoDB connection + collections
│   ├── rag/
│   │   ├── pipeline.py      # Text splitting + Qdrant upsert
│   │   ├── embeddings.py    # SentenceTransformer embeddings
│   │   ├── retrieval.py     # Vector search (per-user filtered)
│   │   ├── gemini.py        # Groq LLM client (generate + stream)
│   │   ├── agent.py         # Query routing + prompt building
│   │   ├── qdrant_client.py # Qdrant client + collection init
│   │   └── routes.py        # /upload, /stream, /chats, /chat CRUD
│   ├── main.py              # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.js  # Message list, file upload, streaming
│   │   │   ├── Message.js     # Markdown + syntax highlight renderer
│   │   │   └── Sidebar.js     # Chat history, user profile, logout
│   │   ├── pages/
│   │   │   ├── Chat.js        # Main chat layout
│   │   │   └── Login.js       # Login + Register forms
│   │   ├── api.js             # Axios instance with JWT interceptor
│   │   └── App.js             # Routes + protected route guard
│   └── package.json
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker (for Qdrant)
- MongoDB Atlas account (or local MongoDB)
- [Groq API key](https://console.groq.com/)

### 1. Clone the repo

```bash
git clone https://github.com/display37/RAG-Based-Intelligent-Response-Assistant-.git
cd RAG-Based-Intelligent-Response-Assistant-
```

### 2. Start Qdrant

```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 3. Backend setup

```bash
cd backend
pip install -r requirements.txt
pip install sentence-transformers pypdf langchain-text-splitters
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/
SECRET_KEY=your_jwt_secret_key
GROQ_API=your_groq_api_key
```

Start the server:

```bash
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`

### 4. Frontend setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Login and receive JWT |
| GET | `/auth/me` | Get current user profile |

### RAG

| Method | Endpoint | Description |
|---|---|---|
| POST | `/rag/upload` | Upload a PDF or TXT file |
| POST | `/rag/stream?q=...` | Stream an AI response |
| GET | `/rag/chats` | List all chats for current user |
| GET | `/rag/chat/{chat_id}` | Get messages for a chat |
| DELETE | `/rag/chat/{chat_id}` | Delete a chat |

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `SECRET_KEY` | Secret key for JWT signing |
| `GROQ_API` | Groq API key |

---

## License

MIT
