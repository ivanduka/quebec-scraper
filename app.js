const fs = require("fs");
const puppeteer = require("puppeteer-core");
const { PendingXHR } = require("pending-xhr-puppeteer");
const path = require("path");

const download = require("download-chromium");
const os = require("os");
const tmp = os.tmpdir();

const fileName = "well_authorizations_issued.csv";

const url =
  "https://reports.bcogc.ca/ogc/f?p=AMS_REPORTS:WA_ISSUED:11051318187560:";

const button1 =
  "#a_Collapsible1_WA_ISSUED_control_panel_content > ul > li:nth-child(1) > span.a-IRR-controls-cell.a-IRR-controls-cell--remove > button";

const button2 =
  "#a_Collapsible1_WA_ISSUED_control_panel_content > ul > li > span.a-IRR-controls-cell.a-IRR-controls-cell--remove > button";

const button3 = "#WA_ISSUED_actions_button";

const button4 = "#WA_ISSUED_actions_menu_14i";

const button5 = "#WA_ISSUED_download_CSV";

const app = async () => {
  let browser;
  try {
    console.log("Downloading a browser if needed...");
    const exec = await download({
      revision: 694644,
      installPath: `${tmp}/.local-chromium`
    });

    console.log("Opening a browser...");
    browser = await puppeteer.launch({
      executablePath: exec,
      headless: true
    });

    console.log("Opening a new page...");
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    const pendingXHR = new PendingXHR(page);

    console.log(`Going to ${url}...`);
    await page.goto(url);

    await page.click(button1);
    console.log("Removing the first filter...");
    await pendingXHR.waitForAllXhrFinished();

    await page.click(button2);
    console.log("Removing the second filter...");
    await pendingXHR.waitForAllXhrFinished();

    await page.click(button3);
    console.log("Opening Actions...");
    await pendingXHR.waitForAllXhrFinished();

    await page.click(button4);
    console.log("Opening Download options...");
    await pendingXHR.waitForAllXhrFinished();

    console.log("Downloading data...");
    const data = await page.evaluate(async btn => {
      const link = document.querySelector(btn).href;

      return fetch(link, {
        method: "GET"
        // credentials: "include"
      }).then(res => res.text());
    }, button5);
    console.log(`Saving '${fileName}' to '${__dirname}'...`);
    fs.writeFileSync(path.join(__dirname, fileName), data);
    console.log("File is saved! All hail the glorious Data, Design and Analytics team!");
  } catch (error) {
    console.error(error);
  } finally {
    if (browser) browser.close();
  }
};

app();
