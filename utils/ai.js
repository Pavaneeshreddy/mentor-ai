const fetch = require("node-fetch");

const GEMINI_API_KEY = "AIzaSyBGwR23XqqfN9IM1qIKiLgwVlctsZ8q-1E";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY;

function buildPrompt(user, message, mood) {
  return `You are Mentor AI, a friendly, emotionally intelligent career mentor.\nUser: ${user.name}\nGoal: ${user.goal}\nMood: ${mood}\nMessage: ${message}\nGive actionable, motivational advice in a lovable tone. Only answer questions related to career mentoring, learning, emotional support, and mock tests. Do not answer anything outside this app's scope.`;
}

async function getGeminiReply(prompt) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
    return data.candidates[0].content.parts.map(p => p.text).join("\n");
  }
  return "Sorry, I couldn't generate a response right now.";
}

module.exports = { buildPrompt, getGeminiReply }; 