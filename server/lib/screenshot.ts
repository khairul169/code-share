import puppeteer, { Browser } from "puppeteer";

let browser: Browser | null = null;
let closeHandler: any;

export const screenshot = async (slug: string) => {
  try {
    if (!browser) {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
      });
    }

    const page = await browser.newPage();

    await page.setViewport({ width: 512, height: 340 });
    await page.goto(`http://localhost:3000/api/preview/${slug}/index.html`, {
      waitUntil: "networkidle0",
      timeout: 5000,
    });
    const result = await page.screenshot();
    await page.close();

    if (closeHandler) {
      clearTimeout(closeHandler);
    }

    closeHandler = setTimeout(() => {
      browser?.close();
      closeHandler = null;
    }, 60000);

    return result;
  } catch (err) {
    return null;
  }
};
