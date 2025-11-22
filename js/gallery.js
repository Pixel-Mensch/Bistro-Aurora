// js/gallery.js

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const docEl = document.documentElement;

  const galleryGrid = document.querySelector("[data-gallery-grid]");
  const filterButtons = document.querySelectorAll(".gallery-filter-btn");
  const galleryItems = galleryGrid
    ? Array.from(galleryGrid.querySelectorAll(".gallery-item"))
    : [];

  // Filter-Logik
  if (galleryGrid && filterButtons.length && galleryItems.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter") || "all";

        filterButtons.forEach((b) => {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });

        galleryItems.forEach((item) => {
          const cat = item.getAttribute("data-category") || "";
          const shouldShow = filter === "all" || cat === filter;
          item.classList.toggle("is-hidden", !shouldShow);
        });
      });
    });
  }

  // Lightbox mit Fokusfalle
  const lightbox = document.querySelector("[data-gallery-lightbox]");
  let previouslyFocusedElement = null;

  if (lightbox && galleryItems.length) {
    const imageEl = lightbox.querySelector(".gallery-lightbox-image");
    const captionEl = lightbox.querySelector(".gallery-lightbox-caption");
    const closeEls = lightbox.querySelectorAll("[data-lightbox-close]");

    const getFocusableElements = () =>
      Array.from(
        lightbox.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));

    const openLightbox = (item) => {
      const fullSrc = item.getAttribute("data-full");
      const caption = item.getAttribute("data-caption") || "";
      const thumbImg = item.querySelector("img");

      previouslyFocusedElement = document.activeElement;

      if (imageEl && fullSrc) {
        imageEl.src = fullSrc;
        imageEl.alt = thumbImg ? thumbImg.alt : caption || "Bild";
      }
      if (captionEl) {
        captionEl.textContent = caption;
      }

      lightbox.hidden = false;
      docEl.classList.add("no-scroll");
      body.classList.add("no-scroll");

      const focusable = getFocusableElements();
      if (focusable.length) {
        focusable[0].focus();
      }
    };

    const closeLightbox = () => {
      lightbox.hidden = true;
      docEl.classList.remove("no-scroll");
      body.classList.remove("no-scroll");

      if (
        previouslyFocusedElement &&
        typeof previouslyFocusedElement.focus === "function"
      ) {
        previouslyFocusedElement.focus();
      }
    };

    galleryItems.forEach((item) => {
      item.addEventListener("click", () => openLightbox(item));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(item);
        }
      });
    });

    closeEls.forEach((el) => {
      el.addEventListener("click", closeLightbox);
    });

    lightbox.addEventListener("click", (event) => {
      if (event.target.hasAttribute("data-lightbox-close")) {
        closeLightbox();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lightbox.hidden) {
        closeLightbox();
      }
    });

    lightbox.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = getFocusableElements();
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }
});
