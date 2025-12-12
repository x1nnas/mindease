import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import connectDB from "./config/db";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET environment variable is required");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI environment variable is required");
  process.exit(1);
}

const app: Application = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", router);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`MindEase backend running on port ${PORT}`);
  });
}

export default app;
