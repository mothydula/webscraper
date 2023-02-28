"use strict";

const express = require("express");
const browserObject = require("./browser");
const scraperController = require("./pageController");

const PORT = 8080;
const HOST = "0.0.0.0";
const WEBSITE_PREFIX = "https://www.corcoran.com";
const INITIAL_SITE =
  "https://www.corcoran.com/search/for-sale/location/northwest-harris-tx-17534130/regionId/119";
const app = express();

app.get("/", (request, result) => {
  //Start the browser and create a browser instance
  const browserInstance = browserObject.startBrowser();

  // Pass the browser instance to the scraper controller
  scraperController(browserInstance, WEBSITE_PREFIX, INITIAL_SITE);
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
