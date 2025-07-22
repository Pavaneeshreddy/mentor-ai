import React, { useState } from "react";
import Roadmap from "../components/Roadmap";
import TaskTracker from "../components/TaskTracker";

const dummyWeeks = [
  { title: "Week 1: Foundations", tasks: ["Set your goal", "Complete onboarding", "Intro to roadmap"] },
  { title: "Week 2: Skills", tasks: ["Learn basics", "Watch 2 videos", "Complete 1 project"] },
  { title: "Week 3: Practice", tasks: ["Take mock test", "Review feedback", "Update progress"] },
];
const dummyTasks = [
  { text: "Set your goal", done: true },
  { text: "Complete onboarding", done: false },
  { text: "Intro to roadmap", done: false },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState(dummyTasks);
  const handleToggle = (i) => {
    setTasks(tasks => tasks.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
  };
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-100 rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-purple-700">Your Dashboard</h2>
      <Roadmap weeks={dummyWeeks} currentWeek={0} />
      <div className="my-6" />
      <TaskTracker tasks={tasks} onToggle={handleToggle} />
    </div>
  );
} 