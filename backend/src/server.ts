import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import connectDB from "./config/db";

dotenv.config();

const app: Application = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`MindEase backend running on port ${PORT}`);
});
