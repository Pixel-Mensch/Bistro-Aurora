// js/core.js

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const docEl = document.documentElement;

  // =========================================
  // Mobile Navigation
  // =========================================
  const navToggle = document.querySelector(".nav-toggle");

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Menü schließen" : "Menü öffnen"
      );
    });
  }

  // =========================================
  // Theme Toggle (Dark / Light)
  // =========================================
  const themeToggle = document.querySelector(".theme-toggle");
  const THEME_KEY = "bistro-aurora-theme";

  const applyTheme = (theme) => {
    if (theme === "light") {
      docEl.dataset.theme = "light";
      if (themeToggle) {
        const icon = themeToggle.querySelector(".theme-toggle-icon");
        if (icon) icon.textContent = "☀️";
      }
    } else {
      docEl.dataset.theme = "dark";
      if (themeToggle) {
        const icon = themeToggle.querySelector(".theme-toggle-icon");
        if (icon) icon.textContent = "🌙";
      }
    }
  };

  const storedTheme = window.localStorage.getItem(THEME_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    applyTheme(storedTheme);
  } else {
    const prefersLight =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(prefersLight ? "light" : "dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = docEl.dataset.theme === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      window.localStorage.setItem(THEME_KEY, next);
    });
  }

  // =========================================
  // Header Shadow + Back-to-Top
  // =========================================
  const header = document.querySelector(".site-header");
  const backToTopBtn = document.querySelector(".back-to-top");

  const handleScrollState = () => {
    const y = window.scrollY || window.pageYOffset;

    if (header) {
      if (y > 10) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    if (backToTopBtn) {
      if (y > 400) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    }
  };

  window.addEventListener("scroll", handleScrollState, { passive: true });
  handleScrollState();

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // =========================================
  // Section Reveal on Scroll
  // =========================================
  const sections = document.querySelectorAll(".section");

  if (!("IntersectionObserver" in window) || sections.length === 0) {
    sections.forEach((section) => {
      section.classList.add("section-visible");
    });
    return;
  }

  sections.forEach((section) => {
    section.classList.add("reveal-section");
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));
});
