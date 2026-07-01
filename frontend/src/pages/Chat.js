import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const [chatId, setChatId] = useState(null);

  return (
    <div className="flex h-screen">
      <Sidebar setChatId={setChatId} activeChatId={chatId} />
      <ChatWindow chatId={chatId} setChatId={setChatId} />
    </div>
  );
}
