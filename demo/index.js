import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { generateChallenge, validateChallenge } from "@devcap/core";
import express from "express";
import { transform } from "lightningcss";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SECRET = process.env.CAP_SECRET || randomBytes(32).toString("hex");

const redeemed = new Map();
const nonces = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of redeemed) if (v <= now) redeemed.delete(k);
  for (const [k, v] of nonces) if (v <= now) nonces.delete(k);
}, 60_000).unref();

const consumeNonce = async (sigHex, ttlMs) => {
  if (nonces.has(sigHex)) return false;
  nonces.set(sigHex, Date.now() + ttlMs);
  return true;
};

const processCSS = async () => {
  const raw = await fs.readFile(path.join(__dirname, "../widget/src/src/cap.css"), "utf-8");
  const { code } = transform({
    filename: "cap.css",
    code: Buffer.from(raw),
    minify: true,
    targets: {
      chrome: 90 << 16,
      firefox: 90 << 16,
      safari: 14 << 16,
    },
  });
  return code.toString();
};

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/cap.js", async (req, res) => {
  try {
    const main = await fs.readFile(path.join(__dirname, "../widget/src/src/cap.js"), "utf-8");
    const worker = await fs.readFile(path.join(__dirname, "../widget/src/src/worker.js"), "utf-8");
    const css = await processCSS();

    const bundle = main
      .replace("%%workerScript%%", JSON.stringify(worker))
      .replace("%%capCSS%%", css);

    res.setHeader("Content-Type", "application/javascript");
    res.send(bundle);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/cap-floating.js", (req, res) => {
  res.sendFile(path.join(__dirname, "../widget/src/src/cap-floating.js"));
});

app.get("/cap.css", async (req, res) => {
  try {
    const css = await processCSS();
    res.setHeader("Content-Type", "text/css");
    res.send(css);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/challenge", async (req, res) => {
  try {
    const challenge = await generateChallenge(SECRET, {
      instrumentation: true,
    });
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/redeem", async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ success: false, reason: "invalid_body" });
  }

  try {
    const result = await validateChallenge(SECRET, body, { consumeNonce });

    if (result.success) {
      redeemed.set(result.tokenKey, result.expires);
      console.log("redeemed:", {
        tokenKey: result.tokenKey,
        expires: new Date(result.expires).toISOString(),
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/validate", async (req, res) => {
  const body = req.body;
  if (!body?.token) {
    return res.status(400).json({ success: false });
  }
  const [id, secret] = String(body.token).split(":");
  if (!id || !secret) return res.json({ success: false });

  const { createHash } = await import("node:crypto");
  const tokenKey = `${id}:${createHash("sha256").update(secret).digest("hex")}`;

  const expires = redeemed.get(tokenKey);
  if (!expires || expires < Date.now()) return res.json({ success: false });

  res.json({ success: true, expires });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
