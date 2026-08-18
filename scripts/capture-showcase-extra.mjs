import { chromium } from "playwright";
import path from "node:path";

const ROOT = path.resolve("client-showcase");
const URL = "http://127.0.0.1:5173/";

const ready = async (page) => {
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map((img) =>
        img.complete && img.naturalWidth
          ? null
          : new Promise((r) => {
              img.addEventListener("load", r, { once: true });
              img.addEventListener("error", r, { once: true });
            })
      )
    );
  });
  await page.waitForTimeout(500);
};

const scrollTo = async (page, selector, extra = 0) => {
  await page.evaluate(
    ({ selector, extra }) => {
      const el = document.querySelector(selector);
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY + extra,
        behavior: "instant",
      });
    },
    { selector, extra }
  );
  await page.waitForTimeout(350);
};

const browser = await chromium.launch();

const desktop = await browser.newPage({
  viewport: { width: 1440, height: 1200 },
  deviceScaleFactor: 2,
});
await ready(desktop);

await desktop.locator("[data-service] button").first().click();
await scrollTo(desktop, "#book", -76);
await desktop.screenshot({
  path: path.join(ROOT, "desktop", "05-booking-general.png"),
  animations: "disabled",
});

for (const [tab, file] of [
  ["colour", "06-booking-colour.png"],
  ["waxing", "07-booking-waxing.png"],
  ["perm", "08-booking-down-perm.png"],
]) {
  await desktop.locator(`[data-tab="${tab}"]`).click();
  await desktop.waitForTimeout(200);
  await desktop.locator(`[data-panel="${tab}"] [data-service] button`).first().click();
  await desktop.waitForTimeout(150);
  await scrollTo(desktop, "#book", -76);
  await desktop.screenshot({
    path: path.join(ROOT, "desktop", file),
    animations: "disabled",
  });
}

await desktop.locator('[data-tab="general"]').click();
await desktop.locator("[data-service]").nth(4).locator("button").click();
await desktop.waitForTimeout(150);
await scrollTo(desktop, "#book", -76);
await desktop.screenshot({
  path: path.join(ROOT, "desktop", "05-booking-fade-selected.png"),
  animations: "disabled",
});

await scrollTo(desktop, "#policies", 0);
await desktop.screenshot({
  path: path.join(ROOT, "desktop", "10-policies-banner.png"),
  animations: "disabled",
});

await desktop.close();

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
await ready(mobile);

await scrollTo(mobile, "#book", -64);
await mobile.locator("[data-service] button").first().click();
await mobile.waitForTimeout(200);
await mobile.screenshot({
  path: path.join(ROOT, "mobile", "05-booking.png"),
  animations: "disabled",
});

await mobile.evaluate(() => {
  document.querySelector("#book").scrollIntoView({ block: "start" });
  window.scrollBy(0, 420);
});
await mobile.waitForTimeout(250);
await mobile.screenshot({
  path: path.join(ROOT, "mobile", "05-booking-form.png"),
  animations: "disabled",
});

await browser.close();
console.log("Supplemental captures saved");
