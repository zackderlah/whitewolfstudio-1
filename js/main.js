const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const openBtn = document.querySelector("[data-menu-open]");
const closeBtn = document.querySelector("[data-menu-close]");
const form = document.querySelector("#booking-form");
const serviceField = document.querySelector("#service-field");
const selectedLabel = document.querySelector("[data-selected-label]");
const success = document.querySelector("[data-form-success]");
const track = document.querySelector("[data-gallery-track]");

const setHeader = () => {
  header.classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.72);
};

const toggleMenu = (open) => {
  menu.hidden = !open;
  openBtn.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
};

openBtn.addEventListener("click", () => toggleMenu(true));
closeBtn.addEventListener("click", () => toggleMenu(false));
menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => toggleMenu(false));
});

window.addEventListener("scroll", setHeader, { passive: true });
setHeader();

document.querySelectorAll("[data-acc-btn]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
  });
});

document.querySelectorAll("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const id = tab.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.classList.toggle("is-active", btn === tab);
      btn.setAttribute("aria-selected", String(btn === tab));
    });
    document.querySelectorAll("[data-panel]").forEach((panel) => {
      const active = panel.dataset.panel === id;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
  });
});

document.querySelectorAll("[data-service]").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll("[data-service]").forEach((el) => el.classList.remove("is-selected"));
    item.classList.add("is-selected");
    const name = item.querySelector("strong").textContent.trim();
    const price = item.querySelector("b").textContent.trim();
    const detail = item.querySelector("em").textContent.trim();
    const value = `${name} — ${price} (${detail})`;
    serviceField.value = value;
    selectedLabel.textContent = `${name} · ${price}`;
    serviceField.setCustomValidity("");
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!serviceField.value) {
    serviceField.setCustomValidity("Please choose a service.");
    selectedLabel.textContent = "Choose a service from the menu.";
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const lines = [
    `Service: ${data.get("service")}`,
    `Name: ${data.get("name")}`,
    `Email: ${data.get("email")}`,
    `Phone: ${data.get("phone") || "—"}`,
    `Preferred date: ${data.get("date") || "—"}`,
    `Preferred time: ${data.get("time") || "—"}`,
    `Notes: ${data.get("notes") || "—"}`,
  ];
  const mailto = `mailto:white.wolf.studio@icloud.com?subject=${encodeURIComponent(
    "Booking request — White Wolf Studio"
  )}&body=${encodeURIComponent(lines.join("\n"))}`;

  success.hidden = false;
  window.location.href = mailto;
});

const scrollGallery = (dir) => {
  const amount = track.clientWidth * 0.8 * dir;
  track.scrollBy({ left: amount, behavior: "smooth" });
};

document.querySelector("[data-gallery-prev]").addEventListener("click", () => scrollGallery(-1));
document.querySelector("[data-gallery-next]").addEventListener("click", () => scrollGallery(1));
