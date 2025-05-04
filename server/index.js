import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ──────────────────────────────────────────────────────────────
// Environment & App setup
// ──────────────────────────────────────────────────────────────
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────────────────────

// 1) Token endpoint
app.post("/api/token", async (req, res) => {
  try {
    const params = new URLSearchParams({
      client_id:     process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      scope:         "https://tapi.dvsa.gov.uk/.default",
      grant_type:    "client_credentials",
    });

    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      }
    );

    const data = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Token request failed:", data);
      return res.status(tokenRes.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error("Token error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2) Vehicle lookup
app.get("/api/vehicle/:reg", async (req, res) => {
  try {
    const registration = req.params.reg;

    // 2a) fetch a token
    const params = new URLSearchParams({
      client_id:     process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      scope:         "https://tapi.dvsa.gov.uk/.default",
      grant_type:    "client_credentials",
    });

    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      }
    );
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(500).json({ error: "Failed to obtain access token" });
    }

    // 2b) call the MOT API
    const motRes = await fetch(
      `https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${registration}`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "x-api-key":   process.env.API_KEY,
        },
      }
    );
    const motData = await motRes.json();
    if (!motRes.ok) {
      console.error("MOT API error:", motData);
      return res.status(motRes.status).json(motData);
    }
    res.json(motData);

  } catch (err) {
    console.error("Vehicle data fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3) Simple health check
app.get("/api/ping", (req, res) => {
  res.send("✅ Backend is up!");
});


// ──────────────────────────────────────────────────────────────
// Static / SPA fallback
// ──────────────────────────────────────────────────────────────
const __dirname    = path.dirname(fileURLToPath(import.meta.url));
const distPath     = path.join(__dirname, "..", "dist");
const indexHtml    = path.join(distPath, "index.html");

if (fs.existsSync(indexHtml)) {
  // Serve all the static assets
  app.use(express.static(distPath));

  // Fallback for client-side routes — no path-to-regexp used here
  app.use((req, res, next) => {
    // if this is a GET for something that isn't /api and doesn't look like a file…
    if (
      req.method === "GET" &&
      !req.path.startsWith("/api") &&
      path.extname(req.path) === ""
    ) {
      return res.sendFile(indexHtml);
    }
    next();
  });
} else {
  console.warn("⚠️  dist/index.html not found — frontend won’t be served.");
}


// ──────────────────────────────────────────────────────────────
// Start!
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
