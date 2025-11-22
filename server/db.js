// server/db.js
const fs = require("fs");
const path = require("path");

const ORDERS_FILE = path.join(__dirname, "orders.json");

function ensureFile() {
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
  }
}

function readOrders() {
  ensureFile();
  const raw = fs.readFileSync(ORDERS_FILE, "utf8");
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (e) {
    console.error("Fehler beim Lesen von orders.json:", e);
    return [];
  }
}

function writeOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
  } catch (e) {
    console.error("Fehler beim Schreiben in orders.json:", e);
  }
}

function addOrder(order) {
  const orders = readOrders();
  orders.push(order);
  writeOrders(orders);
}

module.exports = {
  readOrders,
  addOrder,
};
