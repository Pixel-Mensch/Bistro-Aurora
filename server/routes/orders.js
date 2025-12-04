// server/routes/orders.js
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { createOrder, captureOrder } = require("../paypal");
const { addOrder } = require("../db");
const nodemailer = require("nodemailer");
const {
  createOrderSchema,
  captureOrderSchema,
  validate,
} = require("../middleware/validation");

const router = express.Router();

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
  MAIL_TO_RESTAURANT,
} = process.env;

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS && MAIL_FROM) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  console.warn(
    "[Mail] SMTP-Konfiguration unvollständig – E-Mails werden nicht versendet."
  );
}

async function sendMail(to, subject, text) {
  if (!transporter) {
    console.warn(
      "[Mail] Kein Transporter konfiguriert. Mail wird übersprungen."
    );
    return;
  }
  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("Fehler beim Senden der E-Mail:", error);
  }
}

router.post("/create", validate(createOrderSchema), async (req, res, next) => {
  try {
    const payload = req.body;

    const order = await createOrder(payload);

    // Temporäre Order-Daten, um sie bei Capture wieder verfügbar zu haben
    // (In echtem System: DB mit Status "pending")
    const internalOrder = {
      id: uuidv4(),
      paypalOrderId: order.id,
      status: "created",
      createdAt: new Date().toISOString(),
      payload,
    };
    addOrder(internalOrder);

    res.json({ orderID: order.id });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/capture",
  validate(captureOrderSchema),
  async (req, res, next) => {
    try {
      const { orderID } = req.body;

      const captureResult = await captureOrder(orderID);

      const purchaseUnit = captureResult.purchase_units?.[0];
      const capture = purchaseUnit?.payments?.captures?.[0];

      const status = capture?.status || captureResult.status;
      const amount = capture?.amount?.value || purchaseUnit?.amount?.value;

      const orderRecord = {
        id: uuidv4(),
        paypalOrderId: orderID,
        status,
        amount,
        currency: "EUR",
        capturedAt: new Date().toISOString(),
        raw: captureResult,
      };

      addOrder(orderRecord);

      // E-Mail-Benachrichtigungen (einfacher Text)
      try {
        const customerEmail =
          captureResult.payer?.email_address || "kunde@unbekannt.de";
        const customerName = captureResult.payer?.name?.given_name || "Gast";

        const subjectCustomer = "Deine Bestellung im Bistro Aurora";
        const textCustomer =
          `Hallo ${customerName},\n\n` +
          `vielen Dank für deine Bestellung im Bistro Aurora.\n` +
          `Wir haben deine Zahlung über PayPal erhalten (Bestellnummer: ${orderID}, Betrag: ${amount} EUR).\n\n` +
          `Bis bald im Aurora oder guten Appetit zuhause!\n` +
          `\nBistro Aurora\n`;

        await sendMail(customerEmail, subjectCustomer, textCustomer);

        if (MAIL_TO_RESTAURANT) {
          const subjectRest = `Neue Online-Bestellung: ${amount} EUR (PayPal)`;
          const textRest =
            `Es ist eine neue Online-Bestellung eingegangen.\n\n` +
            `PayPal Order ID: ${orderID}\n` +
            `Status: ${status}\n` +
            `Betrag: ${amount} EUR\n\n` +
            `Bitte im Backend / in der Mail des Kunden Details prüfen.\n`;

          await sendMail(MAIL_TO_RESTAURANT, subjectRest, textRest);
        }
      } catch (e) {
        console.error("Fehler beim Senden der Bestell-E-Mails:", e);
      }

      res.json({ status, captureResult });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
