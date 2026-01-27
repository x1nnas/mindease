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
      
      // Allow localhost for development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow Vercel domains (any *.vercel.app) - for production frontend
      if (origin.includes('.vercel.app')) {
        return callback(null, true);
      }
      
      // Allow configured FRONTEND_URL
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
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
    // Start server first, then connect to DB
    // This ensures the server is accessible even if DB connection takes time
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ MindEase backend running on port ${PORT}`);
      console.log(`🌐 Server accessible at http://0.0.0.0:${PORT}`);
      console.log(`📡 Health check available at http://0.0.0.0:${PORT}/health`);
    });

    // Connect to MongoDB (non-blocking)
    // Server will still respond to health checks even if DB is connecting
    connectDB().catch((error) => {
      console.error("⚠️  MongoDB connection failed:", error);
      console.error("💡 Server is running but database features may be unavailable");
      console.error("💡 Check your MONGO_URI environment variable");
      // Don't exit - allow server to run for health checks
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
