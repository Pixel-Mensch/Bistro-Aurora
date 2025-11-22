// server/server.js
const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const ordersRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS (bei Bedarf anpassen, wenn Frontend auf anderem Host läuft)
app.use(
  cors({
    origin: true,
    credentials: false,
  })
);

app.use(express.json());

// API-Routen
app.use("/api/orders", ordersRouter);

// Statische Dateien (Frontend)
// Annahme: server/ liegt neben deinen HTML/CSS/JS-Dateien
const publicDir = path.join(__dirname, "..");
app.use(express.static(publicDir));

// Fallback: immer index.html (optional, bei SPA; hier eher 404/Index)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Bistro Aurora Backend läuft auf Port ${PORT}`);
});
