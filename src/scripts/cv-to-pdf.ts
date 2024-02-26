import puppeteer from "puppeteer";
import { $ } from "zx";

const APP_URL = new URL("http://localhost:4444");
const CV_DESTINATION = "./public/cv.pdf";
const CV_SELECTOR = "#julio-cv";

// -----------------------------------------

console.log(`🔪 Releasing port ${APP_URL.port} to run the app there...`);
await $`pnpx kill-port ${APP_URL.port}`.quiet();

console.log("🔨 Building and serving the app...");
const app = $`pnpm build && pnpm preview --port ${APP_URL.port}`.quiet();

console.log("⏳ Waiting for the app to be available...");
await $`pnpx wait-on ${APP_URL} --timeout 60s`.quiet();
console.log(`💯 App ready on ${APP_URL}...`);

console.log("👨🏻‍💻 Opening app in the browser...");
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(APP_URL.toString());

console.log("👾 Hacking the page to make the CV look amazing...");
await page.addStyleTag({
  content: `
  body {
    background: white;
  }

  @page {
    size: A4;
    margin-top: 50px;
    margin-bottom: 50px;
  }

  @page :first {
    margin-top: 0;
  }
`,
});
await page.$eval(CV_SELECTOR, (el) => (document.body.outerHTML = el.outerHTML));

console.log(`💾 Downloading the CV on ${CV_DESTINATION}...`);
await page.pdf({ path: CV_DESTINATION, preferCSSPageSize: true });

console.log(`🧹 Closing everything...`);
await browser.close();
await app.kill("SIGINT");

console.log("✅ DONE");
