import React, { useState } from "react";

const moods = [
  { value: "happy", label: "😊 Happy" },
  { value: "motivated", label: "💪 Motivated" },
  { value: "neutral", label: "😐 Neutral" },
  { value: "stressed", label: "😰 Stressed" },
  { value: "sad", label: "😢 Sad" },
];

export default function MoodCheck({ value = "", onCheck }) {
  const [mood, setMood] = useState(value);

  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-xl shadow p-4 flex flex-col items-center">
      <label className="mb-2 font-semibold text-blue-700">How are you feeling today?</label>
      <select
        className="w-full border rounded-full px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={mood}
        onChange={e => setMood(e.target.value)}
      >
        <option value="">Select mood</option>
        {moods.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
      <button
        className="bg-blue-400 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-500 transition"
        onClick={() => onCheck?.(mood)}
        disabled={!mood}
      >
        Submit
      </button>
    </div>
  );
} 