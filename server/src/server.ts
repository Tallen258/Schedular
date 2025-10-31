import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API on http://localhost:${port}`));
