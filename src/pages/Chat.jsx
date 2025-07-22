import React, { useState } from "react";
import ChatUI from "../components/ChatUI";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleSend = async (text) => {
    setMessages(msgs => [...msgs, { role: "user", text }]);
    setLoading(true);
    setTimeout(() => {
      setMessages(msgs => [...msgs, { role: "mentor", text: "This is a demo mentor reply!" }]);
      setLoading(false);
    }, 1000);
  };
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Mentor Chat</h2>
      <ChatUI messages={messages} onSend={handleSend} />
      {loading && <div className="mt-2 text-blue-500">Mentor is typing...</div>}
    </div>
  );
} 