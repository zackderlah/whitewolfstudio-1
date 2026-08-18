import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("client-showcase");
const URL = "http://127.0.0.1:5173/";

const waitForPage = async (page) => {
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const imgs = [...document.images];
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return null;
        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      })
    );
  });
  await page.waitForTimeout(600);
};

const snapElement = async (page, selector, file) => {
  const loc = page.locator(selector).first();
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await loc.screenshot({
    path: file,
    animations: "disabled",
    timeout: 30000,
  });
};

const snapViewport = async (page, selector, file, offset = 0) => {
  await page.evaluate(
    ({ selector, offset }) => {
      const el = document.querySelector(selector);
      const y = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top: Math.max(0, y), left: 0, behavior: "instant" });
    },
    { selector, offset }
  );
  await page.waitForTimeout(350);
  await page.screenshot({
    path: file,
    animations: "disabled",
    fullPage: false,
  });
};

const captureDesktop = async (browser) => {
  const dir = path.join(ROOT, "desktop");
  await mkdir(dir, { recursive: true });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  await waitForPage(page);

  await snapViewport(page, ".hero", path.join(dir, "01-hero.png"), 0);
  await snapElement(page, ".hero", path.join(dir, "01-hero-section.png"));

  await snapViewport(page, "#studio", path.join(dir, "02-story.png"), -76);
  await snapElement(page, "#studio", path.join(dir, "02-story-section.png"));

  await snapViewport(page, ".jump", path.join(dir, "03-explore.png"), -40);
  await snapElement(page, ".jump", path.join(dir, "03-explore-section.png"));

  await snapViewport(page, "#visit", path.join(dir, "04-studio-visit.png"), -76);
  await snapElement(page, "#visit", path.join(dir, "04-studio-visit-section.png"));

  await page.locator("[data-service] button").first().click();
  await page.waitForTimeout(200);
  await snapViewport(page, "#book", path.join(dir, "05-booking-general.png"), -76);
  await snapElement(page, "#book", path.join(dir, "05-booking-general-section.png"));

  for (const [tab, name] of [
    ["colour", "06-booking-colour"],
    ["waxing", "07-booking-waxing"],
    ["perm", "08-booking-down-perm"],
  ]) {
    await page.locator(`[data-tab="${tab}"]`).click();
    await page.waitForTimeout(200);
    await page.locator(`[data-panel="${tab}"] [data-service] button`).first().click();
    await page.waitForTimeout(150);
    await snapElement(page, "#book", path.join(dir, `${name}-section.png`));
  }

  await page.locator('[data-tab="general"]').click();
  await page.waitForTimeout(150);

  await snapViewport(page, "#work", path.join(dir, "09-work.png"), -76);
  await snapElement(page, "#work", path.join(dir, "09-work-section.png"));

  await page.locator("[data-gallery-next]").click();
  await page.waitForTimeout(500);
  await snapElement(page, "#work", path.join(dir, "09-work-gallery-scrolled.png"));

  await snapViewport(page, "#policies", path.join(dir, "10-policies-banner.png"), -20);
  await snapElement(page, "#policies", path.join(dir, "10-policies-banner-section.png"));

  await snapViewport(page, ".policies-list", path.join(dir, "11-policies-details.png"), -76);
  await snapElement(page, ".policies-list", path.join(dir, "11-policies-details-section.png"));

  await snapViewport(page, ".site-footer", path.join(dir, "12-footer.png"), -40);
  await snapElement(page, ".site-footer", path.join(dir, "12-footer-section.png"));

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.locator("[data-menu-open]").click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(dir, "13-menu-overlay.png"),
    animations: "disabled",
  });
  await page.locator("[data-menu-close]").click();
  await page.waitForTimeout(200);

  await page.addStyleTag({
    content: `
      .site-header { position: absolute !important; }
      html { scroll-padding-top: 0 !important; }
    `,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(dir, "00-full-page.png"),
    fullPage: true,
    animations: "disabled",
  });

  await page.close();
};

const captureMobile = async (browser) => {
  const dir = path.join(ROOT, "mobile");
  await mkdir(dir, { recursive: true });

  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    colorScheme: "light",
  });
  await waitForPage(page);

  await snapViewport(page, ".hero", path.join(dir, "01-hero.png"), 0);
  await snapElement(page, ".hero", path.join(dir, "01-hero-section.png"));
  await snapElement(page, "#studio", path.join(dir, "02-story-section.png"));
  await snapElement(page, ".jump", path.join(dir, "03-explore-section.png"));
  await snapElement(page, "#visit", path.join(dir, "04-studio-visit-section.png"));

  await page.locator("[data-service] button").first().click();
  await page.waitForTimeout(200);
  await snapViewport(page, "#book", path.join(dir, "05-booking.png"), -70);
  await snapElement(page, "#book", path.join(dir, "05-booking-section.png"));

  await snapElement(page, "#work", path.join(dir, "06-work-section.png"));
  await snapElement(page, "#policies", path.join(dir, "07-policies-banner-section.png"));
  await snapElement(page, ".policies-list", path.join(dir, "08-policies-details-section.png"));
  await snapElement(page, ".site-footer", path.join(dir, "09-footer-section.png"));

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
  await page.locator("[data-menu-open]").click();
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(dir, "10-menu-overlay.png"),
    animations: "disabled",
  });
  await page.locator("[data-menu-close]").click();

  await page.addStyleTag({
    content: `
      .site-header { position: absolute !important; }
      html { scroll-padding-top: 0 !important; }
    `,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(dir, "00-full-page.png"),
    fullPage: true,
    animations: "disabled",
  });

  await page.close();
};

const browser = await chromium.launch({
  args: ["--font-render-hinting=none", "--disable-lcd-text"],
});

try {
  await captureDesktop(browser);
  await captureMobile(browser);
} finally {
  await browser.close();
}

console.log("Showcase saved to client-showcase/");
