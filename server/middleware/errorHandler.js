// server/middleware/errorHandler.js

/**
 * Zentrale Error-Handler-Middleware
 * Muss als LETZTES Middleware in server.js registriert werden
 */
function errorHandler(err, req, res, next) {
  // Log für Debugging
  console.error("❌ Error:", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  // Joi Validierungsfehler
  if (err.isJoi) {
    return res.status(400).json({
      error: "Validierungsfehler",
      details: err.details.map((d) => ({
        field: d.path.join("."),
        message: d.message,
      })),
    });
  }

  // PayPal API Fehler
  if (err.response && err.response.data) {
    const status = err.response.status || 500;
    return res.status(status).json({
      error: "PayPal Fehler",
      message: err.response.data.message || "Zahlung fehlgeschlagen",
      ...(process.env.NODE_ENV === "development" && {
        details: err.response.data,
      }),
    });
  }

  // Custom Fehler mit statusCode
  const statusCode = err.statusCode || 500;
  const message = err.message || "Interner Serverfehler";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = errorHandler;
