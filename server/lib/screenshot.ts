import puppeteer, { Browser } from "puppeteer";

let browser: Browser | null = null;
let closeHandler: any;

export const screenshot = async (url: string) => {
  try {
    if (!browser) {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox"],
      });
    }

    const page = await browser.newPage();

    await page.setViewport({ width: 512, height: 340 });
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 5000,
    });
    const result = await page.screenshot();

    setTimeout(() => {
      page.close();
    }, 500);

    if (closeHandler) {
      clearTimeout(closeHandler);
    }

    closeHandler = setTimeout(() => {
      browser?.close();
      browser = null;
      closeHandler = null;
    }, 30000);

    return result;
  } catch (err) {
    return null;
  }
};
