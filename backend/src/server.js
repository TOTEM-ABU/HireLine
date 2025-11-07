import express from "express";
import { ENV } from "./lib/env.js";

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

app.listen(ENV.PORT, () => {
  console.log(`Server is listening on port ${ENV.PORT}`);
});
