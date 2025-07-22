import React from "react";

export default function TaskTracker({ tasks = [], onToggle }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-bold mb-2 text-purple-700">Task Checklist</h3>
      <ul className="space-y-2">
        {tasks.length === 0 ? (
          <li className="text-gray-400">No tasks yet.</li>
        ) : (
          tasks.map((task, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => onToggle?.(i)}
                className="accent-purple-500 w-5 h-5 rounded"
              />
              <span className={task.done ? "line-through text-gray-400" : "text-gray-700"}>{task.text}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
} 