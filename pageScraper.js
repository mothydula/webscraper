const createCsvWriter = require("csv-writer").createArrayCsvWriter;

const FILE_NAME = "out.csv";
const SITE_TO_SCRAPE =
  "https://www.corcoran.com/search/for-sale/location/northwest-harris-tx-17534130/regionId/119";

//Object containing the scraper function
const scraperObject = {
  url: SITE_TO_SCRAPE,
  //Scraper function
  async scraper(browser, intialSite) {
    let isNextButonDisabled = false;
    const page = await browser.newPage();
    //const listingPage = await browser.newPage();
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
    await page.setUserAgent(ua);
    console.log(`Navigating to ${this.url}...`);
    await page.goto(this.url);
    let urls = [];
    let main;

    const csvWriter = createCsvWriter({
      header: [
        "address",
        "city",
        "square footage",
        "beds",
        "baths",
        "listed price",
        "brokerage fee",
        "common charges",
        "annual tax",
        "year built",
        "imageUrl",
      ],
      path: FILE_NAME,
    });

    await page.setDefaultNavigationTimeout(0);
    try {
      //Wait 5 seconds for page to load
      main = await page.waitForSelector("main", { timeout: 5000 });
    } catch (error) {
      console.log("Couldn't find the main container", error.message);
      return;
    }

    //Go page to page
    while (!isNextButonDisabled) {
      //Check to see if we're at the last page
      isNextButonDisabled = await page.evaluate(() => {
        //Find the next button
        const elements = document.querySelectorAll(
          '[data-e2e-id="paginator__button"]'
        );

        const element = elements[0];
        //Click the next button
        element.click;
        //Return the "disabled" flag of the button
        return element.disabled;
      });

      //Click the next button
      await page.waitForSelector('[data-e2e-id="paginator__button"]');
      page.click('[data-e2e-id="paginator__button"]');

      //Collect all of the listing urls for the page
      let newUrls = await page.$$eval('[aria-label="listing"]', (listings) => {
        links = listings.map((listing) => listing.querySelector("a").href);
        return links;
      });

      //loop through the listing pages
      const start = Date.now();
      let rows = await Promise.all(
        newUrls.map(async (url) => {
          //Instantiate the row
          let row = [];
          const listingPage = await browser.newPage();

          //Navigate to the listing page
          await listingPage.goto(url, {
            waitUntl: "domcontentloaded",
            timeout: 0,
          });

          //Collect row data

          try {
            row = await listingPage.$eval(
              '[data-e2e-id="main-listing-info__container"]',
              (listingInfoContainer) => {
                const getInnerText = (node) => {
                  if (node !== null) {
                    return node.innerText;
                  }
                  return "";
                };

                let address = getInnerText(
                  listingInfoContainer.querySelector(
                    '[data-e2e-id="main-listing-info__listing-title"]'
                  )
                );
                console.log(address);
                console.log("HERE");
                let city = getInnerText(
                  listingInfoContainer.querySelector(
                    '[data-e2e-id="main-listing-info__listing-subtitle"]'
                  )
                );
                let stateZipCode = getInnerText(
                  listingInfoContainer.querySelector(
                    '[data-e2e-id="main-listing-info__neighborhood-name-link-wrapper"]'
                  )
                );
                let listedPrice = getInnerText(
                  listingInfoContainer.querySelector(
                    '[data-e2e-id="main-listing-info__price"]'
                  )
                );
                let beds = getInnerText(
                  listingInfoContainer.querySelector(
                    '[data-e2e-id="main-listing-info__flex-container__bedroom-info"]'
                  )
                );
                let baths = getInnerText(
                  listingInfoContainer.querySelector(
                    '[data-e2e-id="main-listing-info__flex-container__bathrooms"]'
                  )
                );
                let squareFootage = getInnerText(
                  listingInfoContainer.querySelector(
                    '[data-e2e-id="main-listing-info__flex-container__squarefootage"]'
                  )
                );
                let brokerageFee = getInnerText(
                  listingInfoContainer.querySelector(
                    "li.MainListingInfo__CompensationItem-sc-f9f9c32c-18"
                  )
                );
                let annualTax = getInnerText(
                  listingInfoContainer.querySelector(
                    ".MainListingInfo__Tax-sc-f9f9c32c-6"
                  )
                );
                let yearBuilt = getInnerText(
                  listingInfoContainer.querySelector(
                    'h2[data-e2e-id="main-listing-info__transaction-building-types-container"]'
                  )
                );
                let commonCharges = getInnerText(
                  listingInfoContainer.querySelector(
                    "li.MainListingInfo__Maintenance-sc-f9f9c32c-7"
                  )
                );
                return [
                  address,
                  city,
                  Number(squareFootage.replace(/[^0-9.-]+/g, "")),
                  Number(beds.replace(/[^0-9.-]+/g, "")),
                  Number(baths.replace(/[^0-9.-]+/g, "")),
                  Number(listedPrice.replace(/[^0-9.-]+/g, "")),
                  Number(brokerageFee.replace(/[^0-9.-]+/g, "")),
                  Number(commonCharges.replace(/[^0-9.-]+/g, "")),
                  Number(annualTax.replace(/[^0-9.-]+/g, "")),
                  Number(yearBuilt.replace(/[^0-9.-]+/g, "")),
                ];
              }
            );
            imageUrl = await listingPage.$eval(
              '[data-e2e-id="simple-carousel__carousel-link"]',
              (carouselSlide) => {
                return carouselSlide.querySelector("img").src;
              }
            );
            row.push(imageUrl);

            console.log("row buffered");
            if (row !== null && row !== undefined) {
              listingPage.close();
              return row;
            }
          } catch {
            //do nothing
            listingPage.close();
          }
        })
      );

      //Dump buffer to file
      csvWriter.writeRecords(rows).then(() => {
        console.log("...Wrote chunk");
      });

      const end = Date.now();
      console.log(`Execution time: ${end - start} ms`);
    }

    console.log("END");
  },
};

module.exports = scraperObject;
