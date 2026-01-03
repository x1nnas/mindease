import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import router from "./routes";
import connectDB from "./config/db";
import { validateEnv, getEnv } from "./config/env";

dotenv.config({ path: path.join(process.cwd(), ".env") });

validateEnv();

const app: Application = express();

// CORS configuration - must be before other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow requests from frontend
  if (origin === 'http://localhost:5173') {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Use cors middleware as additional layer
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use("/api", router);

const env = getEnv();
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
