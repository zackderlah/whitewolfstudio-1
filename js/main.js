const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const openBtn = document.querySelector("[data-menu-open]");
const closeBtn = document.querySelector("[data-menu-close]");
const track = document.querySelector("[data-gallery-track]");

const setHeader = () => {
  header.classList.toggle("is-solid", window.scrollY > 24);
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

const scrollGallery = (dir) => {
  const amount = track.clientWidth * 0.8 * dir;
  track.scrollBy({ left: amount, behavior: "smooth" });
};

document.querySelector("[data-gallery-prev]").addEventListener("click", () => scrollGallery(-1));
document.querySelector("[data-gallery-next]").addEventListener("click", () => scrollGallery(1));

let galleryPointer = null;
let galleryStartX = 0;
let galleryStartY = 0;
let galleryScroll = 0;
let galleryAxis = null;
let galleryMoved = false;
let galleryLastX = 0;
let galleryLastTime = 0;
let galleryVelocity = 0;
let galleryRaf = 0;
let galleryNextLeft = null;
let galleryCoastRaf = 0;

const maxGalleryScroll = () => track.scrollWidth - track.clientWidth;

const applyGalleryScroll = () => {
  galleryRaf = 0;
  if (galleryNextLeft === null) {
    return;
  }
  track.scrollLeft = galleryNextLeft;
};

const stopGalleryCoast = () => {
  if (galleryCoastRaf) {
    cancelAnimationFrame(galleryCoastRaf);
    galleryCoastRaf = 0;
  }
};

const coastGallery = () => {
  const max = maxGalleryScroll();
  galleryVelocity *= 0.92;
  const next = Math.max(0, Math.min(max, track.scrollLeft - galleryVelocity));
  track.scrollLeft = next;

  if (Math.abs(galleryVelocity) > 0.35 && next > 0 && next < max) {
    galleryCoastRaf = requestAnimationFrame(coastGallery);
    return;
  }

  galleryCoastRaf = 0;
  galleryVelocity = 0;
};

track.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) {
    return;
  }

  stopGalleryCoast();
  galleryPointer = event.pointerId;
  galleryStartX = event.clientX;
  galleryStartY = event.clientY;
  galleryLastX = event.clientX;
  galleryLastTime = event.timeStamp;
  galleryScroll = track.scrollLeft;
  galleryAxis = event.pointerType === "mouse" ? "x" : null;
  galleryMoved = false;
  galleryVelocity = 0;
  track.setPointerCapture(event.pointerId);
});

track.addEventListener("pointermove", (event) => {
  if (galleryPointer !== event.pointerId) {
    return;
  }

  const deltaX = event.clientX - galleryStartX;
  const deltaY = event.clientY - galleryStartY;

  if (!galleryAxis) {
    if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
      return;
    }
    galleryAxis = Math.abs(deltaX) > Math.abs(deltaY) ? "x" : "y";
    if (galleryAxis === "y") {
      track.releasePointerCapture(event.pointerId);
      galleryPointer = null;
      return;
    }
  }

  if (galleryAxis !== "x") {
    return;
  }

  const now = event.timeStamp;
  const dt = Math.max(1, now - galleryLastTime);
  galleryVelocity = ((event.clientX - galleryLastX) / dt) * 16;
  galleryLastX = event.clientX;
  galleryLastTime = now;
  galleryMoved = true;
  track.classList.add("is-dragging");
  galleryNextLeft = galleryScroll - deltaX;
  if (!galleryRaf) {
    galleryRaf = requestAnimationFrame(applyGalleryScroll);
  }
});

const stopGalleryDrag = (event) => {
  if (galleryPointer !== event.pointerId) {
    return;
  }

  galleryPointer = null;
  galleryAxis = null;
  track.classList.remove("is-dragging");

  if (galleryMoved) {
    coastGallery();
  }
};

track.addEventListener("pointerup", stopGalleryDrag);
track.addEventListener("pointercancel", stopGalleryDrag);
