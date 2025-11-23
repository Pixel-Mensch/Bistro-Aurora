// Datei: backend/server.js
import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// einfache Validierung
function isValidOrderPayload(body) {
  if (!body || typeof body !== "object") return false;
  const { customer, cart } = body;

  if (!customer || !cart) return false;
  if (!Array.isArray(cart.items) || cart.items.length === 0) return false;
  if (!customer.name || !customer.phone) return false;

  return true;
}

app.post("/api/orders", (req, res) => {
  if (!isValidOrderPayload(req.body)) {
    return res
      .status(400)
      .json({ message: "Ungültige Bestellung. Pflichtfelder fehlen." });
  }

  const order = req.body;

  // TODO: echte Verarbeitung:
  // - E-Mail versenden
  // - in Datenbank speichern
  // - o.ä.
  console.log("Neue Bestellung eingegangen:");
  console.dir(order, { depth: null });

  return res.status(201).json({ message: "Bestellung angenommen" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Order-API läuft auf Port ${PORT}`);
});
