const fs = require("fs");
const path = require("path");

module.exports = async function handler(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const memoryPath = path.join(__dirname, "../memory", `user_${userId}.json`);
  if (req.method === "GET") {
    if (!fs.existsSync(memoryPath)) return res.json({});
    return res.json(JSON.parse(fs.readFileSync(memoryPath, "utf-8")));
  }
  if (req.method === "POST") {
    fs.writeFileSync(memoryPath, JSON.stringify(req.body, null, 2));
    return res.json({ ok: true });
  }
  if (req.method === "DELETE") {
    if (fs.existsSync(memoryPath)) fs.unlinkSync(memoryPath);
    return res.json({ ok: true });
  }
  res.status(405).json({ error: "Method not allowed" });
}; 