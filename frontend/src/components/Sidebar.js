import { useEffect, useState, useCallback } from "react";
import API from "../api";

export default function Sidebar({ setChatId, activeChatId }) {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      const res = await API.get("/rag/chats");
      setChats(res.data);
    } catch {
      setChats([]);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [activeChatId, fetchChats]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const deleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await API.delete(`/rag/chat/${chatId}`);
      setChats((prev) => prev.filter((c) => c.chat_id !== chatId));
      if (activeChatId === chatId) setChatId(null);
    } catch {
      alert("Failed to delete chat");
    }
  };

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.email[0].toUpperCase()
    : "?";

  return (
    <div className="w-64 bg-[#202123] flex flex-col h-screen relative">

      {/* Top */}
      <div className="p-3">
        <button
          onClick={() => { setChatId(null); fetchChats(); }}
          className="w-full bg-[#40414f] hover:bg-[#4a4b59] text-white p-3 rounded-md transition text-sm"
        >
          + New Chat
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {chats.length === 0 && (
          <p className="text-gray-600 text-xs text-center mt-4">No chats yet</p>
        )}
        {chats.map((chat) => (
          <div
            key={chat.chat_id}
            onClick={() => setChatId(chat.chat_id)}
            className={`group flex items-center justify-between p-2 rounded cursor-pointer text-sm text-gray-300 hover:bg-[#40414f] transition ${
              activeChatId === chat.chat_id ? "bg-[#40414f]" : ""
            }`}
          >
            <span className="truncate flex-1">
              {chat.title || `Chat ${chat.chat_id.slice(0, 8)}...`}
            </span>
            <button
              onClick={(e) => deleteChat(e, chat.chat_id)}
              className="ml-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs shrink-0"
              title="Delete chat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Profile popup */}
      {showProfile && user && (
        <div className="absolute bottom-16 left-3 right-3 bg-[#2a2b32] border border-gray-700 rounded-xl p-4 shadow-xl z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#10a37f] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          </div>

          {user.company && (
            <div className="mb-3 pb-3 border-b border-gray-700">
              <p className="text-gray-500 text-xs">Company</p>
              <p className="text-gray-300 text-sm">{user.company}</p>
            </div>
          )}

          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className="w-full text-left text-red-400 hover:text-red-300 text-sm transition py-1"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Bottom user bar */}
      <div
        onClick={() => setShowProfile((p) => !p)}
        className="p-3 border-t border-gray-700 flex items-center gap-3 cursor-pointer hover:bg-[#2a2b32] transition"
      >
        <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-white font-bold text-xs shrink-0">
          {initials}
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-white text-sm font-medium truncate">
            {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
          </p>
          <p className="text-gray-500 text-xs truncate">{user?.email || ""}</p>
        </div>
        <span className="text-gray-500 text-xs">{showProfile ? "▼" : "▲"}</span>
      </div>

    </div>
  );
}
