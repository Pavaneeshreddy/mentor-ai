const fs = require("fs");
const path = require("path");

const dummyTests = {
  DevOps: [
    { q: "What is CI/CD?", options: ["A", "B", "C", "D"], answer: 0 },
    { q: "What is Docker?", options: ["A", "B", "C", "D"], answer: 1 },
    // ...more
  ],
  AWS: [
    { q: "What is S3?", options: ["A", "B", "C", "D"], answer: 2 },
    // ...more
  ],
  ML: [
    { q: "What is supervised learning?", options: ["A", "B", "C", "D"], answer: 0 },
    // ...more
  ],
  DSA: [
    { q: "What is a binary tree?", options: ["A", "B", "C", "D"], answer: 1 },
    // ...more
  ],
};

module.exports = async function handler(req, res) {
  const { userId, category } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const memoryPath = path.join(__dirname, "../memory", `user_${userId}.json`);
  let memory = {};
  if (fs.existsSync(memoryPath)) memory = JSON.parse(fs.readFileSync(memoryPath, "utf-8"));
  if (req.method === "GET") {
    if (!category || !dummyTests[category]) return res.status(400).json({ error: "Invalid category" });
    return res.json({ questions: dummyTests[category].map(({ answer, ...q }) => q) });
  }
  if (req.method === "POST") {
    const { answers, category } = req.body;
    if (!category || !dummyTests[category]) return res.status(400).json({ error: "Invalid category" });
    const questions = dummyTests[category];
    let score = 0;
    let feedback = [];
    answers.forEach((ans, i) => {
      if (ans === questions[i].answer) score++;
      else feedback.push({ q: questions[i].q, correct: questions[i].options[questions[i].answer] });
    });
    memory.tests = memory.tests || {};
    memory.tests[category] = memory.tests[category] || [];
    memory.tests[category].push({ score, date: Date.now() });
    fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
    return res.json({ score, feedback });
  }
  res.status(405).json({ error: "Method not allowed" });
}; 