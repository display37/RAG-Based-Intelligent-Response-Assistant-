import { useEffect, useState } from "react";
import API from "../api";

export default function Sidebar({ setChatId }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      const res = await API.get("/rag/chats");
      setChats(res.data);
    };

    fetchChats();
  }, []);

  return (
    <div className="w-64 bg-sidebar flex flex-col p-3">

      <button
        onClick={() => setChatId(null)}
        className="bg-card p-3 rounded-md mb-4"
      >
        + New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.chat_id}
            onClick={() => setChatId(chat.chat_id)}
            className="p-2 rounded hover:bg-gray-700 cursor-pointer"
          >
            {chat.chat_id.slice(0, 8)}
          </div>
        ))}
      </div>

    </div>
  );
}