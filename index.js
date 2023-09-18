import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import userRouter from "./routes/userRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import listRouter from "./routes/listRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection successful!!!"));

// Body parser
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Welcome!!! 🙂");
});

app.use("/users", userRouter);
app.use("/tasks", taskRouter);
app.use("/lists", listRouter);

app.listen(PORT, () =>
  console.log(`The server is connected to port: ${PORT} ☕☕`)
);

// export { client };
