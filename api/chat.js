const fs = require("fs");
const path = require("path");
const { buildPrompt, getGeminiReply } = require("../utils/ai");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { userId, message, mood } = req.body;
  if (!userId || !message) return res.status(400).json({ error: "Missing userId or message" });
  const memoryPath = path.join(__dirname, "../memory", `user_${userId}.json`);
  let memory = {};
  if (fs.existsSync(memoryPath)) {
    memory = JSON.parse(fs.readFileSync(memoryPath, "utf-8"));
  }
  // Get user profile for prompt
  const user = memory.profile || { name: "User", goal: "" };
  const prompt = buildPrompt(user, message, mood);
  let reply = await getGeminiReply(prompt);
  memory.chats = memory.chats || [];
  memory.chats.push({ role: "user", text: message, mood });
  memory.chats.push({ role: "mentor", text: reply });
  fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
  res.json({ reply, memory });
}; 