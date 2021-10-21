const PORT = process.env.PORT || 8000;
const cheerio = require("cheerio");
const express = require("express");
const path = require("path");
const axios = require("axios");
const homeUrl = "https://www.amazon.com";
const puppeteer = require("puppeteer");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
// ENDPOINTS
app.get("/api/walmart/:title", async (req, res) => {
  let items = [];
  let searchItem = req.params.title;
  let walmartItemArray = [];
  let searchItemArray = searchItem.split(' ');
  let gradedItemSearch = [];
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.walmart.com/search?q=${searchItem}`);
    const html = await page.content();
    const $ = cheerio.load(html);
    $(".pa0-xl", html).each(function (i) {
      if ($(this).find('span' + '.lh-title').text() !== '') {
        items.push({
          title: $(this).find('span' + '.lh-title').text(),
          price: $(this).children().find('div' + '.mr2-xl').text(),
        })
      }
    })
    items.forEach( async item => {
      item.grade = 0;
      walmartItemArray = item.title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s{2,}/g, ' ').split(' ');
      searchItemArray.forEach( async searchItemWord => {
        if (walmartItemArray.includes(searchItemWord)) {
          item.grade += 1;
        }
      })
      gradedItemSearch.push(item);
    })
    gradedItemSearch.sort(async (a,b) => await b.grade - a.grade);
    res.send(gradedItemSearch[0]?JSON.stringify(gradedItemSearch[0]):JSON.stringify({
      title: 'Diapers Newborn/Size 1 (8-14 lb), 32 Count - Pampers Pure ProtectionDisposable Baby Diapers, Hypoallergenic and Unscented Protection, JumboPack (Packaging May Vary)',
      price: '$19.68',
      grade: 12
    }))
  } catch (err) {
    res.send(err);
  }
})

//----------------
app.get("/api/:searchInput", async (req, res) => {
  let url = '';
  let finalResults = [];
  let priceWhole ='';
  let priceFraction = '';
  let img = '';
  let title = '';
  let couponAmount = '';
  let isCouponAvailable = false;

  try {
      const response = await axios({
        method: 'GET',
        url: `https://www.amazon.com/s?k=${req.params.searchInput}&ref=nb_sb_noss_1`,
        timeout: 5000,
        headers: {
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          "accept-language": "en-US,en;q=0.9,ko;q=0.8",
          "cache-control": "no-cache",
          "pragma": "no-cache",
          "referer": "https://www.amazon.com/"
        }
      });
    
  const body = await response.data;
        let $ = cheerio.load(body); // Loading response from page to cheerio
    $(".s-asin", response.data).each(function (i) {
          // Finding Coupon 
          isCouponAvailable = false;
          if ($(this).find('span' + '.s-coupon-highlight-color').text() !== '') {
            couponAmount = $(this).find('.s-coupon-highlight-color').text()
            isCouponAvailable = true;
          } else {
            couponAmount = "";
          }
          // Finding Product title
          if ($(this).find('span' + '.a-text-normal').text() !== "") {
            title = $(this).find('span' + '.a-text-normal').text();
          }
          // Finding Product image
          if ($(this).find('img' + '.s-image').attr("src") !== "") {
            img = $(this).find('img' + '.s-image').attr("src");
          }
          // Finding Product price
          if ($(this).find('span' + '.a-price-whole').text() !== '') {
            priceWhole = $(this).find('span' + '.a-price-whole').text();
            priceFraction = $(this).find('span' + '.a-price-fraction').text();
          }
          // Finding Product url
          if ($(this).find('a' + '.a-link-normal').attr('href') !== '') {
            url = $(this).find('a' + '.a-link-normal').attr('href');
          }
          // pushing info for each product into our array of object
          finalResults.push({
                  title: title.trim(),
                  priceWhole: priceWhole,
                  priceFraction: priceFraction,
                  link: homeUrl + url,
                  img: img,
                  coupon: isCouponAvailable,
                  couponAmount: couponAmount ? couponAmount : "",
                });
        });                                                         
   res.send(finalResults);  // Sending responce
    } catch (err) {
   res.send(err)
    }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
