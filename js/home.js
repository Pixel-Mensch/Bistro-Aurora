// js/home.js

document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!button || !answer) return;

    const expanded = button.getAttribute("aria-expanded") === "true";
    item.classList.toggle("open", expanded);
    answer.hidden = !expanded;

    button.addEventListener("click", () => {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      const next = !isExpanded;

      // nur ein Eintrag offen
      faqItems.forEach((otherItem) => {
        const otherBtn = otherItem.querySelector(".faq-question");
        const otherAnswer = otherItem.querySelector(".faq-answer");
        if (!otherBtn || !otherAnswer) return;

        if (otherItem === item) {
          otherBtn.setAttribute("aria-expanded", String(next));
          otherAnswer.hidden = !next;
          otherItem.classList.toggle("open", next);
        } else {
          otherBtn.setAttribute("aria-expanded", "false");
          otherAnswer.hidden = true;
          otherItem.classList.remove("open");
        }
      });
    });
  });
});
