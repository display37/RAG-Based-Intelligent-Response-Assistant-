import { useState, useEffect, useRef } from "react";
import Message from "./Message";
import API from "../api";

export default function ChatWindow({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) {
        setMessages([]);
        return;
      }

      const res = await API.get(`/rag/chat/${chatId}`);
      setMessages(res.data);
    };

    loadChat();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input) return;

    const token = localStorage.getItem("token");

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages([...newMessages, { role: "assistant", text: "" }]);

    const userInput = input;
    setInput("");

    const response = await fetch(
      `http://localhost:8000/rag/stream?chat_id=${chatId || ""}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ q: userInput })
      }
    );

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let responseText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      aiText += chunk;

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = aiText;
        return updated;
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-darkBg">

      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto py-6">
          {messages.map((msg, i) => (
            <Message key={i} {...msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="max-w-3xl mx-auto flex bg-card rounded-xl p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-transparent outline-none px-2"
            placeholder="Send a message..."
          />
          <button onClick={sendMessage} className="bg-primary px-4 py-2 rounded-lg">
            Send
          </button>
        </div>
      </div>

    </div>
  );
}