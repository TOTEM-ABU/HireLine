import express from "express";
import cors from "cors";
import { serve } from "inngest/express";
import { ENV } from "./lib/env.js";
import { inngest, functions } from "./lib/inngest.js";
import path from "path";

const app = express();
const __dirname = path.resolve();

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));

app.post("/debug-clerk", (req, res) => {
  console.log("🔥 RAW CLERK WEBHOOK KELDI!");
  console.log("Headers:", req.headers);
  console.log("Raw Body:", req.rawBody.toString("utf8"));
  console.log("Parsed Body:", req.body);
  res.json({ received: true, timestamp: new Date().toISOString() });
});

app.use("/api/inngest", (req, res, next) => {
  console.log("🔥 INNGEST ENDPOINT CHAQRALDI:", req.method, req.url);
  console.log(
    "Raw Body (Inngest):",
    req.rawBody ? req.rawBody.toString("utf8") : "No raw"
  );
  serve({ client: inngest, functions })(req, res, next);
});

app.get("/books", (req, res) => res.status(200).send("List of books"));
app.get("/foods", (req, res) => res.status(200).send("List of foods"));

if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () =>
      console.log("Server running on port:", ENV.PORT)
    );
  } catch (error) {
    console.error("💥 Server error", error);
  }
};
startServer();
