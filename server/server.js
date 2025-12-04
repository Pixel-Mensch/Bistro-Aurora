// server/server.js
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const ordersRouter = require("./routes/orders");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers
app.use(helmet());

// Rate Limiting für API-Routen
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // max 100 Requests pro IP
  message: {
    error: "Zu viele Anfragen von dieser IP. Bitte versuche es später erneut.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);

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

// Error Handler muss als LETZTES registriert werden
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Bistro Aurora Backend läuft auf Port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});
