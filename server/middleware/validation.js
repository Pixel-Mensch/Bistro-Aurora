// server/middleware/validation.js
const Joi = require("joi");

/**
 * Validation Schema für Order Creation
 */
const createOrderSchema = Joi.object({
  mode: Joi.string().valid("pickup", "delivery").required().messages({
    "any.required": "Liefermodus ist erforderlich",
    "any.only": 'Liefermodus muss "pickup" oder "delivery" sein',
  }),

  customer: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      "string.min": "Name muss mindestens 2 Zeichen lang sein",
      "string.max": "Name darf maximal 100 Zeichen lang sein",
      "any.required": "Kundenname ist erforderlich",
    }),

    email: Joi.string().email().required().messages({
      "string.email": "Ungültige E-Mail-Adresse",
      "any.required": "E-Mail-Adresse ist erforderlich",
    }),

    phone: Joi.string()
      .pattern(/^[0-9+\s()-]+$/)
      .optional()
      .allow("")
      .messages({
        "string.pattern.base": "Ungültige Telefonnummer",
      }),

    address: Joi.string().when("$mode", {
      is: "delivery",
      then: Joi.required().messages({
        "any.required": "Adresse ist bei Lieferung erforderlich",
      }),
      otherwise: Joi.optional().allow(""),
    }),

    note: Joi.string().max(500).optional().allow("").messages({
      "string.max": "Notiz darf maximal 500 Zeichen lang sein",
    }),
  }).required(),

  items: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required().messages({
          "any.required": "Artikel-ID ist erforderlich",
        }),
        name: Joi.string().required().messages({
          "any.required": "Artikelname ist erforderlich",
        }),
        unit_amount: Joi.number().positive().required().messages({
          "number.positive": "Preis muss positiv sein",
          "any.required": "Preis ist erforderlich",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "number.min": "Menge muss mindestens 1 sein",
          "any.required": "Menge ist erforderlich",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Mindestens ein Artikel muss im Warenkorb sein",
      "any.required": "Warenkorb-Artikel sind erforderlich",
    }),

  summary: Joi.object({
    subtotal: Joi.number().min(0).required().messages({
      "number.min": "Zwischensumme darf nicht negativ sein",
      "any.required": "Zwischensumme ist erforderlich",
    }),
    deliveryFee: Joi.number().min(0).required().messages({
      "number.min": "Liefergebühr darf nicht negativ sein",
      "any.required": "Liefergebühr ist erforderlich",
    }),
    total: Joi.number().min(0).required().messages({
      "number.min": "Gesamtsumme darf nicht negativ sein",
      "any.required": "Gesamtsumme ist erforderlich",
    }),
  }).required(),
});

/**
 * Validation Schema für Order Capture
 */
const captureOrderSchema = Joi.object({
  orderID: Joi.string().required().messages({
    "any.required": "PayPal Order-ID ist erforderlich",
    "string.empty": "PayPal Order-ID darf nicht leer sein",
  }),
});

/**
 * Middleware-Factory für Validation
 */
function validate(schema, property = "body") {
  return (req, res, next) => {
    const context = property === "body" ? { mode: req.body.mode } : {};
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      context,
    });

    if (error) {
      error.isJoi = true;
      return next(error);
    }

    // Ersetze req[property] mit validiertem & bereinigtem Wert
    req[property] = value;
    next();
  };
}

module.exports = {
  createOrderSchema,
  captureOrderSchema,
  validate,
};
