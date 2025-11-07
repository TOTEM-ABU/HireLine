import express from "express";
import path from "path";

import { ENV } from "./lib/env.js";

const app = express();

const __dirname = path.resolve();

app.get("/books", (req, res) => {
  res.status(200).send("List of books");
});

app.get("/foods", (req, res) => {
  res.status(200).send("List of foods");
});

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(ENV.PORT, () => {
  console.log(`Server is listening on port ${ENV.PORT}`);
});
