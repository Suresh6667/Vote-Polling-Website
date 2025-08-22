import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pollRoutes } from "./routes/polls.js";
import { initDatabase } from "./database/init.js";
import { pollService } from "./services/pollService.js";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : [process.env.CLIENT_URL || "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : [process.env.CLIENT_URL || "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static(join(__dirname, "../dist")));

// Initialize database
await initDatabase();

// Poll cleanup every minute
setInterval(() => {
  pollService.cleanupExpiredPolls();
}, 60000);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinPoll", (pollId) => {
    socket.join(`poll_${pollId}`);
    console.log(`User ${socket.id} joined poll ${pollId}`);
  });

  socket.on("leavePoll", (pollId) => {
    socket.leave(`poll_${pollId}`);
    console.log(`User ${socket.id} left poll ${pollId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
app.use("/api", pollRoutes);

// Serve React app
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
