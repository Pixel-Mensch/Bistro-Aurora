// js/main.js

document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation
  const navToggle = document.querySelector(".nav-toggle");
  const body = document.body;

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

  // Section Reveal on Scroll
  const sections = document.querySelectorAll(".section");

  // Wenn kein JS oder kein IntersectionObserver -> alles sichtbar lassen
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
