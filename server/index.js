import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- API ROUTES -----

// Access token route
app.post("/api/token", async (req, res) => {
  try {
    const params = new URLSearchParams();
    params.append("client_id", process.env.CLIENT_ID);
    params.append("client_secret", process.env.CLIENT_SECRET);
    params.append("scope", "https://tapi.dvsa.gov.uk/.default");
    params.append("grant_type", "client_credentials");

    const response = await fetch(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Token request failed:", data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Vehicle data route
app.get("/api/vehicle/:reg", async (req, res) => {
  try {
    const registration = req.params.reg;

    // Step 1: Get access token
    const params = new URLSearchParams();
    params.append("client_id", process.env.CLIENT_ID);
    params.append("client_secret", process.env.CLIENT_SECRET);
    params.append("scope", "https://tapi.dvsa.gov.uk/.default");
    params.append("grant_type", "client_credentials");

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

    // Step 2: Fetch MOT data
    const motRes = await fetch(
      `https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${registration}`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "x-api-key": process.env.API_KEY,
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
    console.error("Vehicle data fetch failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check
app.get("/api/ping", (req, res) => {
  res.send("✅ Backend is up!");
});

// ----- SERVE FRONTEND -----

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "dist");
const indexHtmlPath = path.join(distPath, "index.html");

if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  console.warn("⚠️ dist/index.html not found. React frontend won't be served.");
}

// ----- START SERVER -----

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
