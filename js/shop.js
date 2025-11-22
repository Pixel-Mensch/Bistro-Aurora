// js/shop.js

document.addEventListener("DOMContentLoaded", () => {
  const CART_STORAGE_KEY = "bistro-aurora-cart-v1";

  const products = document.querySelectorAll(".menu-item-product");
  const cartItemsContainer = document.querySelector("[data-cart-items]");
  const cartSubtotalEl = document.querySelector("[data-cart-subtotal]");
  const cartDeliveryFeeEl = document.querySelector("[data-cart-delivery-fee]");
  const cartTotalEl = document.querySelector("[data-cart-total]");
  const cartErrorEl = document.querySelector("[data-cart-error]");
  const deliveryFields = document.querySelector("[data-delivery-fields]");
  const modeInputs = document.querySelectorAll('input[name="orderMode"]');

  const nameInput = document.querySelector('input[name="customerName"]');
  const emailInput = document.querySelector('input[name="customerEmail"]');
  const addressInput = document.querySelector('input[name="deliveryAddress"]');
  const phoneInput = document.querySelector('input[name="phone"]');
  const noteInput = document.querySelector('textarea[name="customerNote"]');

  let cart = loadCart();
  let orderMode = "pickup"; // "pickup" oder "delivery"

  function loadCart() {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (e) {
      console.error("Konnte Warenkorb nicht laden:", e);
      return [];
    }
  }

  function saveCart() {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Konnte Warenkorb nicht speichern:", e);
    }
  }

  function formatPrice(value) {
    return value.toFixed(2).replace(".", ",") + " €";
  }

  function calculateSummary() {
    let subtotal = 0;
    cart.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    let deliveryFee = 0;
    const minDelivery = 25;

    if (orderMode === "delivery") {
      if (subtotal === 0) {
        deliveryFee = 0;
      } else if (subtotal < minDelivery) {
        // Mindestbestellwert wird im Frontend angezeigt, aber Fee bleibt z. B. 3,50 €
        deliveryFee = 3.5;
      } else {
        deliveryFee = 3.5;
      }
    }

    const total = subtotal + deliveryFee;

    if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);
    if (cartDeliveryFeeEl)
      cartDeliveryFeeEl.textContent = formatPrice(deliveryFee);
    if (cartTotalEl) cartTotalEl.textContent = formatPrice(total);

    return { subtotal, deliveryFee, total, minDelivery };
  }

  function renderCart() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
      const p = document.createElement("p");
      p.className = "menu-cart-empty";
      p.textContent = "Dein Warenkorb ist noch leer.";
      cartItemsContainer.appendChild(p);
      calculateSummary();
      return;
    }

    const list = document.createElement("ul");
    list.className = "menu-cart-list";

    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "menu-cart-item";
      li.dataset.id = item.id;

      const info = document.createElement("div");
      info.className = "menu-cart-item-info";

      const nameEl = document.createElement("div");
      nameEl.className = "menu-cart-item-name";
      nameEl.textContent = item.name;

      const metaEl = document.createElement("div");
      metaEl.className = "menu-cart-item-meta";
      metaEl.textContent = formatPrice(item.price);

      info.appendChild(nameEl);
      info.appendChild(metaEl);

      const controls = document.createElement("div");
      controls.className = "menu-cart-item-controls";

      const qtyWrapper = document.createElement("div");
      qtyWrapper.className = "menu-cart-qty";

      const btnMinus = document.createElement("button");
      btnMinus.type = "button";
      btnMinus.className = "menu-cart-qty-btn";
      btnMinus.textContent = "−";

      const qtyDisplay = document.createElement("span");
      qtyDisplay.className = "menu-cart-qty-value";
      qtyDisplay.textContent = String(item.quantity);

      const btnPlus = document.createElement("button");
      btnPlus.type = "button";
      btnPlus.className = "menu-cart-qty-btn";
      btnPlus.textContent = "+";

      qtyWrapper.appendChild(btnMinus);
      qtyWrapper.appendChild(qtyDisplay);
      qtyWrapper.appendChild(btnPlus);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "menu-cart-remove";
      removeBtn.textContent = "Entfernen";

      controls.appendChild(qtyWrapper);
      controls.appendChild(removeBtn);

      li.appendChild(info);
      li.appendChild(controls);
      list.appendChild(li);

      btnMinus.addEventListener("click", () => {
        updateItemQuantity(item.id, item.quantity - 1);
      });

      btnPlus.addEventListener("click", () => {
        updateItemQuantity(item.id, item.quantity + 1);
      });

      removeBtn.addEventListener("click", () => {
        removeItem(item.id);
      });
    });

    cartItemsContainer.appendChild(list);
    calculateSummary();
  }

  function updateItemQuantity(id, quantity) {
    const index = cart.findIndex((i) => i.id === id);
    if (index === -1) return;
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    saveCart();
    renderCart();
  }

  function removeItem(id) {
    cart = cart.filter((i) => i.id !== id);
    saveCart();
    renderCart();
  }

  function addToCartFromElement(el) {
    const id = el.getAttribute("data-id");
    const name = el.getAttribute("data-name");
    const priceStr = el.getAttribute("data-price");

    if (!id || !name || !priceStr) return;

    const price = parseFloat(priceStr.replace(",", "."));
    if (isNaN(price)) return;

    const existing = cart.find((i) => i.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price,
        quantity: 1,
      });
    }
    saveCart();
    renderCart();
  }

  // Event-Listener für "In den Warenkorb"
  products.forEach((product) => {
    const btn = product.querySelector(".add-to-cart");
    if (!btn) return;
    btn.addEventListener("click", () => addToCartFromElement(product));
  });

  // Abholung / Lieferung Umschalten
  function updateOrderMode(nextMode) {
    orderMode = nextMode;
    if (!deliveryFields) return;

    if (orderMode === "delivery") {
      deliveryFields.hidden = false;
      deliveryFields.classList.add("menu-cart-delivery-visible");
    } else {
      deliveryFields.hidden = true;
      deliveryFields.classList.remove("menu-cart-delivery-visible");
    }
    calculateSummary();
  }

  modeInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        updateOrderMode(input.value === "delivery" ? "delivery" : "pickup");
      }
    });
  });

  updateOrderMode(orderMode);
  renderCart();

  // Fehleranzeige
  function showError(message) {
    if (!cartErrorEl) return;
    cartErrorEl.textContent = message;
    cartErrorEl.hidden = false;
  }

  function clearError() {
    if (!cartErrorEl) return;
    cartErrorEl.hidden = true;
    cartErrorEl.textContent = "";
  }

  // Payload für Backend / PayPal erstellen
  function buildOrderPayload() {
    const { subtotal, deliveryFee, total, minDelivery } = calculateSummary();

    if (cart.length === 0) {
      showError("Bitte füge mindestens ein Gericht in den Warenkorb hinzu.");
      return null;
    }

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const note = noteInput ? noteInput.value.trim() : "";

    if (!name) {
      showError("Bitte gib deinen Namen an.");
      return null;
    }

    if (!email) {
      showError("Bitte gib deine E-Mail-Adresse an.");
      return null;
    }

    if (orderMode === "delivery") {
      if (!address) {
        showError(
          "Bitte gib für eine Lieferung deine vollständige Adresse an."
        );
        return null;
      }
      if (subtotal < minDelivery) {
        showError(
          `Mindestbestellwert für Lieferung: ${formatPrice(minDelivery)}.`
        );
        return null;
      }
    }

    clearError();

    return {
      mode: orderMode,
      customer: {
        name,
        email,
        address: orderMode === "delivery" ? address : null,
        phone: phone || null,
        note: note || null,
      },
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        unit_amount: item.price,
        quantity: item.quantity,
      })),
      summary: {
        subtotal,
        deliveryFee,
        total,
      },
    };
  }

  // PayPal Buttons einrichten
  function initPayPal() {
    if (typeof paypal === "undefined") {
      console.warn("PayPal SDK nicht gefunden.");
      return;
    }

    paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        },
        createOrder: function () {
          const payload = buildOrderPayload();
          if (!payload) {
            return Promise.reject(
              new Error("Bestellung ist noch nicht vollständig.")
            );
          }

          return fetch("/api/orders/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error("Fehler beim Erstellen der Bestellung.");
              }
              return res.json();
            })
            .then((data) => {
              if (!data || !data.orderID) {
                throw new Error("Ungültige Antwort vom Server.");
              }
              return data.orderID;
            })
            .catch((error) => {
              console.error(error);
              showError(
                "Beim Erstellen der Bestellung ist ein Fehler aufgetreten. Bitte versuche es später erneut."
              );
              throw error;
            });
        },
        onApprove: function (data) {
          return fetch("/api/orders/capture", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderID: data.orderID }),
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error("Fehler beim Abschließen der Zahlung.");
              }
              return res.json();
            })
            .then((details) => {
              // Erfolgreich bezahlt
              cart = [];
              saveCart();
              renderCart();
              window.location.href = "/checkout-success.html";
            })
            .catch((error) => {
              console.error(error);
              showError(
                "Beim Abschließen der Zahlung ist ein Fehler aufgetreten. Bitte kontaktiere uns, falls der Betrag abgebucht wurde."
              );
              window.location.href = "/checkout-cancel.html";
            });
        },
        onError: function (err) {
          console.error("PayPal Fehler:", err);
          showError("Es ist ein Fehler mit PayPal aufgetreten.");
        },
        onCancel: function () {
          // Nutzer hat abgebrochen
          window.location.href = "/checkout-cancel.html";
        },
      })
      .render("#paypal-button-container");
  }

  // PayPal initialisieren, sobald SDK geladen ist
  if (typeof paypal !== "undefined") {
    initPayPal();
  } else {
    // Falls das Script langsamer lädt
    let retries = 0;
    const interval = setInterval(() => {
      if (typeof paypal !== "undefined") {
        clearInterval(interval);
        initPayPal();
      } else if (retries > 20) {
        clearInterval(interval);
        console.warn("PayPal SDK konnte nicht geladen werden.");
      }
      retries++;
    }, 300);
  }
});
