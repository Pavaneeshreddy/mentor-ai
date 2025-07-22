import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl shadow-lg p-8 mt-8">
      <h1 className="text-4xl font-bold mb-4 text-purple-700">Welcome to Mentor AI</h1>
      <p className="text-lg mb-6 text-gray-700">Your friendly, emotionally intelligent career mentor. Let's achieve your dreams together! 🚀</p>
      <div className="flex gap-4">
        <Link to="/chat" className="px-6 py-2 bg-blue-400 text-white rounded-full font-semibold shadow hover:bg-blue-500 transition">Chat with Mentor</Link>
        <Link to="/dashboard" className="px-6 py-2 bg-purple-400 text-white rounded-full font-semibold shadow hover:bg-purple-500 transition">View Dashboard</Link>
        <Link to="/profile" className="px-6 py-2 bg-green-400 text-white rounded-full font-semibold shadow hover:bg-green-500 transition">Profile</Link>
      </div>
    </div>
  );
} 