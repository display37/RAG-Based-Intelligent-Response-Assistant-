import { useState, useEffect, useRef } from "react";
import Message from "./Message";
import API from "../api";

export default function ChatWindow({ chatId, setChatId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef();
  const fileRef = useRef();

  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) { setMessages([]); return; }
      setChatLoading(true);
      try {
        const res = await API.get(`/rag/chat/${chatId}`);
        setMessages(res.data);
      } catch {
        setMessages([]);
      } finally {
        setChatLoading(false);
      }
    };
    loadChat();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(file.type)) {
      setUploadStatus("Only PDF and TXT files are supported.");
      return;
    }

    setUploading(true);
    setUploadStatus(`Uploading "${file.name}"...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/rag/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus(`✓ ${res.data.message}`);
    } catch (err) {
      setUploadStatus(`✗ ${err.response?.data?.detail || "Upload failed"}`);
    } finally {
      setUploading(false);
      fileRef.current.value = "";
      setTimeout(() => setUploadStatus(""), 6000);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const token = localStorage.getItem("token");
    const userInput = input;
    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userInput },
      { role: "assistant", text: "" },
    ]);

    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";
    const url = chatId
      ? `${API_BASE}/rag/stream?q=${encodeURIComponent(userInput)}&chat_id=${chatId}`
      : `${API_BASE}/rag/stream?q=${encodeURIComponent(userInput)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", text: "Failed to get a response. Please try again." };
        return updated;
      });
      return;
    }

    const newChatId = response.headers.get("X-Chat-Id");
    if (newChatId && !chatId) setChatId(newChatId);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const readChunk = async () => {
      const { done, value } = await reader.read();
      if (done) return;
      const chunk = decoder.decode(value);
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (!last || last.role !== "assistant") return prev;
        updated[updated.length - 1] = { role: "assistant", text: (last.text || "") + chunk };
        return updated;
      });
      await readChunk();
    };

    await readChunk();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#343541]">
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto py-6">
          {chatLoading ? (
            <div className="flex items-center justify-center mt-20">
              <svg className="w-6 h-6 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center mt-20">
              <p className="text-gray-400 text-2xl font-semibold mb-2">How can I help you today?</p>
              <p className="text-gray-600 text-sm">You can also upload a PDF or TXT file to chat with your documents.</p>
            </div>
          ) : null}
          {!chatLoading && messages.map((msg, i) => (
            <Message key={i} {...msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Upload toast notification */}
      {uploadStatus && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all
          ${
            uploadStatus.startsWith("✓")
              ? "bg-[#10a37f] text-white"
              : uploadStatus.startsWith("✗")
              ? "bg-red-500 text-white"
              : "bg-[#40414f] text-gray-200"
          }`}
        >
          {uploading && (
            <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {uploadStatus}
        </div>
      )}

      <div className="p-4 border-t border-gray-700">
        <div className="max-w-3xl mx-auto flex bg-[#40414f] rounded-xl p-3 gap-2 items-center">

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Upload button */}
          <button
            onClick={() => fileRef.current.click()}
            disabled={uploading}
            title="Upload PDF or TXT"
            className="text-gray-400 hover:text-white transition disabled:opacity-40 shrink-0"
          >
            {uploading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-transparent outline-none text-white px-2 placeholder-gray-400 text-sm"
            placeholder="Send a message or upload a file..."
          />
          <button
            onClick={sendMessage}
            className="bg-[#10a37f] hover:bg-[#0e8f6f] text-white px-4 py-2 rounded-lg transition text-sm shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
