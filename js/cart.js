// Datei: js/cart.js
(function () {
  "use strict";

  // === Konfiguration ===========================================
  const ORDER_ENDPOINT = "https://dein-backend-host/api/orders"; // <- später anpassen
  const DELIVERY_FEE = 2.5;

  // === State ====================================================
  const cartState = {
    items: [], // { id, name, price, quantity }
    deliveryMode: "pickup", // "pickup" | "delivery"
  };

  // === Helper ===================================================
  function formatPrice(value) {
    const num = typeof value === "number" ? value : Number(value) || 0;
    return num.toFixed(2).replace(".", ",") + " €";
  }

  function findCartItemIndex(id) {
    return cartState.items.findIndex((item) => item.id === id);
  }

  function updateDeliveryMode(mode) {
    if (mode !== "pickup" && mode !== "delivery") return;
    cartState.deliveryMode = mode;
    renderCartSummary();
    toggleAddressRow();
  }

  function toggleAddressRow() {
    const addressRow = document.getElementById("address-row");
    if (!addressRow) return;
    const isDelivery = cartState.deliveryMode === "delivery";
    addressRow.style.display = isDelivery ? "" : "none";
  }

  // === Cart-Manipulation ========================================
  function addItemToCart(id, name, price) {
    const parsedPrice = Number(price);
    if (!id || !name || Number.isNaN(parsedPrice)) return;

    const index = findCartItemIndex(id);
    if (index >= 0) {
      cartState.items[index].quantity += 1;
    } else {
      cartState.items.push({
        id,
        name,
        price: parsedPrice,
        quantity: 1,
      });
    }
    renderCart();
  }

  function changeItemQuantity(id, delta) {
    const index = findCartItemIndex(id);
    if (index === -1) return;

    const item = cartState.items[index];
    item.quantity += delta;

    if (item.quantity <= 0) {
      cartState.items.splice(index, 1);
    }
    renderCart();
  }

  function removeItem(id) {
    const index = findCartItemIndex(id);
    if (index === -1) return;
    cartState.items.splice(index, 1);
    renderCart();
  }

  function calculateTotals() {
    const subtotal = cartState.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee =
      cartState.deliveryMode === "delivery" && subtotal > 0 ? DELIVERY_FEE : 0;
    const total = subtotal + deliveryFee;

    return { subtotal, deliveryFee, total };
  }

  // === Rendering ================================================
  function renderCart() {
    const listEl = document.getElementById("cart-items");
    const emptyMsgEl = document.getElementById("cart-empty-message");
    if (!listEl || !emptyMsgEl) return;

    listEl.innerHTML = "";

    if (cartState.items.length === 0) {
      emptyMsgEl.style.display = "";
    } else {
      emptyMsgEl.style.display = "none";

      cartState.items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "cart-item";
        li.dataset.itemId = item.id;

        li.innerHTML = `
  <div class="cart-item-header">
    <span class="cart-item-title">${item.name}</span>
    <span class="cart-item-price">${formatPrice(
      item.price * item.quantity
    )}</span>
    <button 
      type="button" 
      class="cart-item-remove" 
      data-action="remove" 
      aria-label="Artikel entfernen"
    >
      ×
    </button>
  </div>

  <div class="cart-item-controls">
    <button 
      type="button" 
      class="quantity-btn minus" 
      data-action="decrease"
    >−</button>

    <span class="cart-item-quantity">${item.quantity}</span>

    <button 
      type="button" 
      class="quantity-btn plus" 
      data-action="increase"
    >+</button>
  </div>
`;

        listEl.appendChild(li);
      });
    }

    renderCartSummary();
  }

  function renderCartSummary() {
    const { subtotal, deliveryFee, total } = calculateTotals();

    const subtotalEl = document.getElementById("cart-subtotal");
    const deliveryFeeEl = document.getElementById("cart-delivery-fee");
    const totalEl = document.getElementById("cart-total");

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (deliveryFeeEl) deliveryFeeEl.textContent = formatPrice(deliveryFee);
    if (totalEl) totalEl.textContent = formatPrice(total);
  }

  // === Bestellung absenden =====================================
  async function submitOrder() {
    if (cartState.items.length === 0) {
      showFeedback("Bitte füge zuerst Gerichte zum Warenkorb hinzu.", "error");
      return;
    }

    const formEl = document.getElementById("order-form");
    if (!formEl) return;

    const name = formEl.elements["name"]?.value.trim();
    const phone = formEl.elements["phone"]?.value.trim();
    const email = formEl.elements["email"]?.value.trim();
    const address = formEl.elements["address"]?.value.trim();
    const notes = formEl.elements["notes"]?.value.trim();

    if (!name || !phone) {
      showFeedback("Bitte fülle mindestens Name und Telefon aus.", "error");
      return;
    }

    if (cartState.deliveryMode === "delivery" && !address) {
      showFeedback(
        "Für eine Lieferung benötigen wir eine vollständige Adresse.",
        "error"
      );
      return;
    }

    const totals = calculateTotals();

    const payload = {
      customer: {
        name,
        phone,
        email: email || null,
        address: cartState.deliveryMode === "delivery" ? address : null,
        notes: notes || null,
      },
      cart: {
        items: cartState.items.map((item) => ({
          id: item.id,
          name: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
        })),
        deliveryMode: cartState.deliveryMode,
        totals,
      },
      meta: {
        createdAt: new Date().toISOString(),
        source: "bistro-aurora-website",
      },
    };

    showFeedback("Bestellung wird gesendet …", "info");

    try {
      const response = await fetch(ORDER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Antwort vom Server war nicht erfolgreich.");
      }

      showFeedback(
        "Vielen Dank! Deine Bestellung ist bei uns eingegangen.",
        "success"
      );
      resetCartAndForm();
    } catch (error) {
      console.error("Bestellfehler:", error);
      showFeedback(
        "Es ist ein Fehler beim Absenden der Bestellung aufgetreten. Bitte versuche es später erneut oder rufe direkt im Bistro an.",
        "error"
      );
    }
  }

  function showFeedback(message, type) {
    const feedbackEl = document.getElementById("order-feedback");
    if (!feedbackEl) return;

    feedbackEl.textContent = message;
    feedbackEl.classList.remove(
      "order-feedback--error",
      "order-feedback--success",
      "order-feedback--info"
    );

    if (type === "error") {
      feedbackEl.classList.add("order-feedback--error");
    } else if (type === "success") {
      feedbackEl.classList.add("order-feedback--success");
    } else {
      feedbackEl.classList.add("order-feedback--info");
    }
  }

  function resetCartAndForm() {
    cartState.items = [];
    renderCart();

    const formEl = document.getElementById("order-form");
    if (formEl) formEl.reset();

    const pickupRadio = document.querySelector(
      'input[name="deliveryMode"][value="pickup"]'
    );
    if (pickupRadio) {
      pickupRadio.checked = true;
      updateDeliveryMode("pickup");
    }
  }

  // === Event-Binding ===========================================
  function bindMenuButtons() {
    const buttons = document.querySelectorAll("[data-add-to-cart]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const itemEl = btn.closest(".menu-item");
        if (!itemEl) return;

        const id = itemEl.dataset.id;
        const name = itemEl.dataset.name;
        const price = itemEl.dataset.price;

        addItemToCart(id, name, price);
      });
    });
  }

  function bindCartList() {
    const listEl = document.getElementById("cart-items");
    if (!listEl) return;

    listEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const action = target.dataset.action;
      if (!action) return;

      const itemEl = target.closest(".cart-item");
      if (!itemEl) return;

      const id = itemEl.dataset.itemId;
      if (!id) return;

      if (action === "increase") {
        changeItemQuantity(id, 1);
      } else if (action === "decrease") {
        changeItemQuantity(id, -1);
      } else if (action === "remove") {
        removeItem(id);
      }
    });
  }

  function bindDeliveryMode() {
    const radios = document.querySelectorAll('input[name="deliveryMode"]');
    radios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio instanceof HTMLInputElement && radio.checked) {
          updateDeliveryMode(radio.value);
        }
      });
    });
  }

  function bindOrderButton() {
    const btn = document.getElementById("place-order-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      submitOrder();
    });
  }

  function init() {
    bindMenuButtons();
    bindCartList();
    bindDeliveryMode();
    bindOrderButton();
    renderCart();
    toggleAddressRow();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
