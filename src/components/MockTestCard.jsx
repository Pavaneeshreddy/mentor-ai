import React from "react";

export default function MockTestCard({ category, onStart, lastScore }) {
  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-xl shadow p-4 flex flex-col items-center">
      <div className="text-lg font-bold text-green-700 mb-2">{category}</div>
      <div className="mb-2 text-gray-600">Last Score: {lastScore ?? "-"}</div>
      <button
        className="bg-green-400 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-500 transition"
        onClick={onStart}
      >
        Start Test
      </button>
    </div>
  );
} 