// server/paypal.js
const axios = require("axios");
require("dotenv").config();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  console.warn(
    "[PayPal] PAYPAL_CLIENT_ID oder PAYPAL_CLIENT_SECRET fehlen. Bitte .env prüfen."
  );
}

const PAYPAL_API_BASE =
  PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios({
    url: `${PAYPAL_API_BASE}/v1/oauth2/token`,
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    data: "grant_type=client_credentials",
  });

  return response.data.access_token;
}

/**
 * payload:
 * {
 *   mode: "pickup" | "delivery",
 *   customer: { name, email, address, phone, note },
 *   items: [{ id, name, unit_amount, quantity }],
 *   summary: { subtotal, deliveryFee, total }
 * }
 */
async function createOrder(payload) {
  const accessToken = await getAccessToken();

  const items = payload.items.map((item) => ({
    name: item.name,
    unit_amount: {
      currency_code: "EUR",
      value: item.unit_amount.toFixed(2),
    },
    quantity: String(item.quantity),
  }));

  const purchaseUnits = [
    {
      amount: {
        currency_code: "EUR",
        value: payload.summary.total.toFixed(2),
        breakdown: {
          item_total: {
            currency_code: "EUR",
            value: payload.summary.subtotal.toFixed(2),
          },
          shipping: {
            currency_code: "EUR",
            value: payload.summary.deliveryFee.toFixed(2),
          },
        },
      },
      items,
    },
  ];

  const body = {
    intent: "CAPTURE",
    purchase_units: purchaseUnits,
    application_context: {
      brand_name: "Bistro Aurora",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
    },
  };

  const response = await axios({
    url: `${PAYPAL_API_BASE}/v2/checkout/orders`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    data: body,
  });

  return response.data;
}

async function captureOrder(orderID) {
  const accessToken = await getAccessToken();

  const response = await axios({
    url: `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

module.exports = {
  createOrder,
  captureOrder,
};
