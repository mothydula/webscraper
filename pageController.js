const pageScraper = require("./pageScraper");

const scrapeAll = async (browserInstance, websitePrefix, intialSite) => {
  try {
    //Instantiate web driver
    const browser = await browserInstance;
    console.log(websitePrefix);
    await pageScraper.scraper(browser, websitePrefix, intialSite);
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
};

//Export a function that calls controller
module.exports = (browserInstance, websitePrefix, intialSite) =>
  scrapeAll(browserInstance, websitePrefix, intialSite);
