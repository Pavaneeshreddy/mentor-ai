import React, { useState } from "react";

export default function ChatUI({ messages = [], onSend }) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend?.(input);
      setInput("");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow p-4 flex flex-col min-h-[400px]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center mt-16">Start the conversation!</div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`p-2 rounded-lg max-w-[80%] ${msg.role === "user" ? "bg-blue-100 self-end" : "bg-purple-100 self-start"}`}>
              <span className="block text-sm text-gray-700">{msg.text}</span>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
} 