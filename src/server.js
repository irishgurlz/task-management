import "dotenv/config";
import express from "express";

import userRouter from "./routes/user.router.js";

const app = express();
const port = 3000;

app.use(express.json());

// Test
app.get("/", (req, res) => {
  res.send("API running");
});

// Routes
app.use("/auth", userRouter);

app.listen(port, () => {
  console.log(`App berjalan di port: ${port}`);
});