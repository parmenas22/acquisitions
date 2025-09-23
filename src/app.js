import express from "express";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Hello from acquisitions API!!");
});

export default app;
