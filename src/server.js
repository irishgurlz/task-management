import "dotenv/config";
import express from "express";

import userRouter from "./routes/user.router.js";
import projectRouter from "./routes/project.router.js";
import taskRouter from "./routes/task.router.js";
import prisma from "./lib/prisma.js";
// import redisClient from "./lib/redis.js";

const app = express();
const port = 3000;

app.use(express.json());

// Test
app.get("/", (req, res) => {
  res.send("API running");
});

// Routes
app.use("/auth", userRouter);
app.use("/projects", projectRouter);
app.use("/tasks", taskRouter);


app.listen(port, () => {
  console.log(`App berjalan di port: ${port}`);
});
// async function start() {
//   await prisma.$connect();
//   console.log("Berhasil terhubung ke PostgreSQL");

//   await redisClient.connect();
//   console.log("Berhasil terhubung ke Redis");

//   app.listen(port, () => {
//     console.log(`App berjalan di port: ${port}`);
//   });
// }

// start();