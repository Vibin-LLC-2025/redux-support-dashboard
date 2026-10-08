import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const SERVER_URL = "http://localhost:4000";
const APP_URL = "http://localhost:5173";
const OUT_DIR = join(process.cwd(), "docs", "screenshots");

function run(cmd, args, options = {}) {
  const child = spawn(cmd, args, { stdio: "inherit", ...options });
  return child;
}

async function waitForUrl(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.ok) return;
    } catch {
      // keep trying
    }
    await delay(300);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Start API and Vite dev server
  const api = run("npm", ["--prefix", "server", "start"], { env: process.env });
  const client = run("npm", ["--prefix", "client", "run", "dev"], { env: process.env });

  try {
    // Wait for servers to be live
    await waitForUrl(`${SERVER_URL}/api/tickets`);
    await waitForUrl(APP_URL);

    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1360, height: 860 } });
    await page.goto(APP_URL, { waitUntil: "networkidle" });

    // Desktop dashboard
    await delay(400); // allow initial reveal animations
    await page.screenshot({ path: join(OUT_DIR, "dashboard-desktop.png"), fullPage: true });

    // About panel open
    await page.getByRole("button", { name: "About this build" }).click();
    await page.waitForSelector(".build-notes");
    await delay(200);
    await page.screenshot({ path: join(OUT_DIR, "about-panel.png"), fullPage: true });
    // Close About
    await page.getByRole("button", { name: "Close" }).click().catch(() => {});

    // Ensure notes are on, then capture
    const notesBtn = page.getByRole("button", { name: "Inline build notes" });
    const pressed = await notesBtn.getAttribute("aria-pressed");
    if (pressed !== "true") {
      await notesBtn.click();
    }
    await delay(150);
    await page.screenshot({ path: join(OUT_DIR, "notes-on.png"), fullPage: true });

    // Mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await delay(200);
    await page.screenshot({ path: join(OUT_DIR, "dashboard-mobile.png"), fullPage: true });

    await browser.close();
    console.log(`Saved screenshots to ${OUT_DIR}`);
  } finally {
    // Kill dev servers
    api.kill("SIGINT");
    client.kill("SIGINT");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

