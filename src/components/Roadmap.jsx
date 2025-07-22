import React from "react";

export default function Roadmap({ weeks = [], currentWeek = 0 }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-bold mb-4 text-purple-700">Career Roadmap</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {weeks.map((week, i) => (
          <div
            key={i}
            className={`flex-shrink-0 w-48 p-4 rounded-lg border-2 ${i === currentWeek ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-gray-50"}`}
          >
            <div className="font-semibold mb-2">{week.title}</div>
            <ul className="list-disc ml-4 text-sm">
              {week.tasks.map((task, j) => (
                <li key={j} className="mb-1">{task}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 