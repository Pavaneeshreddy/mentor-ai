import React, { useState } from "react";
import MockTestCard from "../components/MockTestCard";

const dummyQuestions = {
  DevOps: [
    { q: "What is CI/CD?", options: ["A", "B", "C", "D"], answer: 0 },
    { q: "What is Docker?", options: ["A", "B", "C", "D"], answer: 1 },
  ],
  AWS: [
    { q: "What is S3?", options: ["A", "B", "C", "D"], answer: 2 },
  ],
  ML: [
    { q: "What is supervised learning?", options: ["A", "B", "C", "D"], answer: 0 },
  ],
  DSA: [
    { q: "What is a binary tree?", options: ["A", "B", "C", "D"], answer: 1 },
  ],
};

const categories = ["DevOps", "AWS", "ML", "DSA"];

export default function Tests() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleStart = (category) => {
    setLoading(true);
    setTimeout(() => {
      setQuiz({ category, questions: dummyQuestions[category] });
      setAnswers(Array(dummyQuestions[category].length).fill(null));
      setResult(null);
      setLoading(false);
    }, 500);
  };
  const handleAnswer = (i, val) => {
    setAnswers(ans => ans.map((a, idx) => idx === i ? val : a));
  };
  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      const questions = quiz.questions;
      let score = 0;
      let feedback = [];
      answers.forEach((ans, i) => {
        if (ans === questions[i].answer) score++;
        else feedback.push({ q: questions[i].q, correct: questions[i].options[questions[i].answer] });
      });
      setResult({ score, feedback });
      setLoading(false);
    }, 500);
  };
  if (quiz) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 rounded-xl shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-green-700">{quiz.category} Quiz</h2>
        {quiz.questions.map((q, i) => (
          <div key={i} className="mb-4 w-full max-w-lg">
            <div className="font-semibold mb-2">{q.q}</div>
            <div className="flex gap-2 flex-wrap">
              {q.options.map((opt, j) => (
                <button key={j} onClick={() => handleAnswer(i, j)} className={`px-4 py-2 rounded-full border ${answers[i] === j ? "bg-green-400 text-white" : "bg-gray-100"}`}>{opt}</button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={handleSubmit} className="bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition mt-4">Submit</button>
        {loading && <div className="mt-2 text-green-600">Checking answers...</div>}
        {result && (
          <div className="mt-6">
            <div className="text-xl font-bold">Score: {result.score}</div>
            {result.feedback && result.feedback.length > 0 && (
              <div className="mt-2 text-red-600">
                <div>Feedback:</div>
                <ul className="list-disc ml-6">
                  {result.feedback.map((f, i) => (
                    <li key={i}>{f.q} (Correct: {f.correct})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Mock Tests</h2>
      <div className="flex flex-wrap gap-6 justify-center">
        {categories.map(cat => (
          <MockTestCard key={cat} category={cat} lastScore={null} onStart={() => handleStart(cat)} />
        ))}
      </div>
      {loading && <div className="mt-4 text-green-600">Loading questions...</div>}
    </div>
  );
} 