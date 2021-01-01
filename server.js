const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.post("/", async (req, res) => {
  const url = req.body.url;
  const format = req.body.format || "A0";
  const path = `${req.body.path}.pdf` || "webpage.pdf";
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const webpage = await browser.newPage();

  await webpage.goto(url, {
    waitUntil: "networkidle0",
  });

  const dimensions = await webpage.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      scale: window.devicePixelRatio,
    };
  });

  const pdf = await webpage.pdf({
    ...dimensions,
    printBackground: true,
    format: format,
    landscape: true,
    path: path,
    margin: {
      top: "20px",
      bottom: "40px",
      left: "30px",
      right: "30px",
    },
  });
  // await browser.close();
  res.contentType("application/pdf");
  res.send(pdf);
});

app.listen(port, () => {
  console.log("Server Up and Running");
});
