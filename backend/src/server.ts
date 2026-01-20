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
// Uses FRONTEND_URL from environment variables (defaults to localhost for development)
const env = getEnv();
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.get("/cors-test", (req, res) => {
  res.json({ ok: true });
});


app.use("/api", router);

const PORT = env.PORT;

// Connect to MongoDB and start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`MindEase backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
