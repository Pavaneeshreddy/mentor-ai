import React, { useState } from "react";
import MoodCheck from "../components/MoodCheck";

export default function Profile() {
  const [mood, setMood] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState({ name: "", goal: "" });
  const handleCheck = (m) => {
    setMood(m);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const handleProfileSave = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Profile & Settings</h2>
      <div className="mb-4 w-full max-w-xs">
        <label className="block font-semibold mb-1">Name</label>
        <input name="name" value={profile.name} onChange={handleProfileChange} className="w-full border rounded-full px-4 py-2 mb-2" />
        <label className="block font-semibold mb-1">Goal</label>
        <input name="goal" value={profile.goal} onChange={handleProfileChange} className="w-full border rounded-full px-4 py-2 mb-2" />
        <button onClick={handleProfileSave} className="bg-green-400 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-500 transition w-full">Save Profile</button>
      </div>
      <MoodCheck value={mood} onCheck={handleCheck} />
      {submitted && <div className="mt-4 text-green-600 font-semibold">Saved!</div>}
      <div className="text-gray-500 mt-8">Profile settings and memory export/reset coming soon...</div>
    </div>
  );
} 