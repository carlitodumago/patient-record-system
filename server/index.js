import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create HTTP server and Socket.IO for realtime updates
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

// Expose IO instance to routes
app.set("io", io);

// In-memory stores (shared via app.locals)
app.locals.patients = app.locals.patients || [];
app.locals.users = app.locals.users || [];
app.locals.activities = app.locals.activities || [];

// Serve static files from the Vue app build directory in production
if (process.env.NODE_ENV === "production") {
  const distPath = join(__dirname, "../dist");
  app.use(express.static(distPath));
}

// Import routes
import patientRoutes from "./routes/patients.js";
import userRoutes from "./routes/users.js";
import notificationRoutes from "./routes/notifications.js";

// Use routes
app.use("/api/patients", patientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Recent activity endpoint
app.get("/api/activity", (req, res) => {
  const activities = req.app.locals.activities || [];
  const limit = parseInt(req.query.limit || "50", 10);
  // Return newest first
  res.status(200).json(activities.slice(-limit).reverse());
});

// Simple metrics endpoint (derived from in-memory stores)
app.get("/api/metrics", (req, res) => {
  const patients = req.app.locals.patients || [];
  const users = req.app.locals.users || [];

  const totalPatients = patients.length;
  const totalRecords = patients.length; // Using patients as records in this mock
  const staffMembers = users.filter(
    (u) => u.role && u.role !== "patient"
  ).length;
  const pendingReviews = patients.filter((p) => p.status === "pending").length;

  res
    .status(200)
    .json({ totalRecords, totalPatients, staffMembers, pendingReviews });
});

// Catch-all route to return the Vue app in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "../dist/index.html"));
  });
}

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
