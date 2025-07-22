import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Tests from "./pages/Tests";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <nav className="flex justify-center gap-6 p-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-b-xl shadow-md">
        <Link to="/" className="font-semibold hover:text-blue-600">Home</Link>
        <Link to="/chat" className="font-semibold hover:text-blue-600">Chat</Link>
        <Link to="/dashboard" className="font-semibold hover:text-blue-600">Dashboard</Link>
        <Link to="/tests" className="font-semibold hover:text-blue-600">Tests</Link>
        <Link to="/profile" className="font-semibold hover:text-blue-600">Profile</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
