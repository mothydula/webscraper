const SITE_TO_SCRAPE =
  "https://www.corcoran.com/search/for-sale/location/northwest-harris-tx-17534130/regionId/119";

//Object containing the scraper function
const scraperObject = {
  url: SITE_TO_SCRAPE,
  //Scraper function
  async scraper(browser, intialSite) {
    let isNextButonDisabled = false;
    const page = await browser.newPage();
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
    await page.setUserAgent(ua);
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    let urls = [];
    let main;

    try {
      //Wait 5 seconds for page to load
      main = await page.waitForSelector("main", { timeout: 5000 });
    } catch (error) {
      console.log("Couldn't find the main container", error.message);
      return;
    }

    while (!isNextButonDisabled) {
      isNextButonDisabled = await page.evaluate(() => {
        const elements = document.querySelectorAll(
          '[data-e2e-id="paginator__button"]'
        );
        // do something with elements, like mapping elements to an attribute:
        const element = elements[0];
        element.click;
        return element.disabled;
      });
      await page.waitForSelector('[data-e2e-id="paginator__button"]');
      page.click('[data-e2e-id="paginator__button"]');

      let newUrls = await page.$$eval('[aria-label="listing"]', (listings) => {
        links = listings.map((listing) => listing.querySelector("a").href);
        return links;
      });
      urls = urls.concat(newUrls);
    }
    console.log(urls.length);
  },
};

module.exports = scraperObject;
