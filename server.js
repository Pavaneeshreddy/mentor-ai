const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API routes
app.post("/api/chat", require("./api/chat"));
app.all("/api/memory", require("./api/memory"));
app.all("/api/tests", require("./api/tests"));

// Serve static files (optional, for production)
// app.use(express.static(path.join(__dirname, "build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Mentor AI backend running on port ${PORT}`)); 