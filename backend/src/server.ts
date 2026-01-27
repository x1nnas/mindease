import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import router from "./routes";
import connectDB from "./config/db";
import { validateEnv, getEnv } from "./config/env";
// Import models to ensure Mongoose registers them before queries
import "./models/User";
import "./models/MoodCheckIn";
import "./models/JournalEntry";


dotenv.config({ path: path.join(process.cwd(), ".env") });

validateEnv();

const app: Application = express();

// Trust proxy for accurate IP detection (important for rate limiting)
app.set('trust proxy', 1);

// CORS configuration - must be before all other middleware
// Allows both dev server (5173) and preview server (4173) for local development
const env = getEnv();
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173', // Vite dev server
  'http://localhost:4173', // Vite preview server
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint for Render/deployment monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    service: "MindEase API",
    timestamp: new Date().toISOString()
  });
});

app.get("/cors-test", (req, res) => {
  res.json({ ok: true });
});


app.use("/api", router);

const PORT = env.PORT;

// Connect to MongoDB and start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    // Listen on 0.0.0.0 for Render/deployment compatibility
    // Render requires binding to 0.0.0.0, not just localhost
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`MindEase backend running on port ${PORT}`);
      console.log(`Server accessible at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
