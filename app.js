const superagent = require("superagent");
const cheerio = require("cheerio");

const url1 = "https://appli.mern.gouv.qc.ca/Infolot/";
const url2 = "https://appli.mern.gouv.qc.ca/Infolot/Info/Licence";
const url3 = "https://appli.mern.gouv.qc.ca/Infolot/Info/AccepterLicence";
const checkUrl =
  "https://appli.mern.gouv.qc.ca/arcgis_webadaptor_prodc/rest/services/PRODC-E/INFOLOT_ANONYME/MapServer/14";
const selector = "#LicenceForm > input[type=hidden]";

const app = async () => {
  const agent = superagent.agent();

  await agent.get(url1);

  const page = await agent.get(url2);

  const hiddenTextExtractor = cheerio.load(page.text);

  const hiddenCode = hiddenTextExtractor(selector).get()[0].attribs.value;

  await agent
    .post(url3)
    .set("Content-Type", "application/x-www-form-urlencoded")
    .send({ __RequestVerificationToken: hiddenCode, bureau: "bureau" })
    .ok(res => res.status < 500)
    .redirects(99);

  const check = await agent.get(checkUrl);

  const $ = cheerio
    .load(check.text)(".rbody")
    .text()
    .replace(/(\n)+/g, "\n")
    .replace(/(\n\t)/g, "\n")
    .replace(/(" ")/g, " ");

  console.log($);
};

app();
