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


async function getWalmartData(eachTitle) {
  let items = [];
  let walmartItemArray = [];
  let gradedItemSearch = [];
  let filteredTitle = eachTitle.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s{2,}/g, '%20');
  let searchItemArray = filteredTitle.split(' ');

  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    }); // needs to be headless on heroku
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0); // need to set timout to get prices faster
    await page.setExtraHTTPHeaders({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; X11; Ubuntu; Linux i686; rv:15.0) AppleWebKit/537.36 Gecko/20100101 Firefox/15.0.1 Chrome/74.0.3729.131 Safari/537.36',
      'upgrade-insecure-requests': '1',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9,en;q=0.8',
      'Access-Control-Allow-Origins': '*',
      'accept': 'application/json',
      'Content-Type': 'application/json'
    })
    await page.goto(`https://www.walmart.com/search?q=${filteredTitle}`, {
      waitUntil: 'load',
      timeout: 0
    });
    const html = await page.content();

    const $ = cheerio.load(html);
    $(".pa0-xl", html).each(function (i) {
      if ($(this).find('span' + '.lh-title').text() !== '') {
        items.push({
          walmartTitle: $(this).find('span' + '.lh-title').text(),
          walmartPrice: $(this).children().find('div' + '.mr2-xl').text(),
          walmartLink: 'https://www.walmart.com' + $(this).children().find('a' + '.z-1').attr('href'),
        })
      }
    })
    items.forEach(item => {
      item.grade = 0;
      walmartItemArray = item.walmartTitle.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s{2,}/g, ' ').split(' ');
      searchItemArray.forEach(searchItemWord => {
        if (walmartItemArray.includes(searchItemWord)) {
          item.grade += 1;
        }
      })
      gradedItemSearch.push(item);
    })
    gradedItemSearch.sort((a, b) => b.grade - a.grade);
    await page.close();
    // await browser.close();
    return gradedItemSearch[0];
  } catch (err) {
    console.log(err)
  }
}
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
  let walmartObject = [];
  try {
      const response = await axios({
        method: 'GET',
        url: `https://www.amazon.com/s?k=${req.params.searchInput}&ref=nb_sb_noss_1`,
        // timeout: 500,
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
                  id: i,
                  title: title.trim(),
                  priceWhole: priceWhole,
                  priceFraction: priceFraction,
                  link: homeUrl + url,
                  img: img,
                  coupon: isCouponAvailable,
                  couponAmount: couponAmount ? couponAmount : "",
                });
        });                                                         
    finalResults.length = 5;
     // Sending responce
    
    let index = 0;
    for (let eachResult of finalResults) {
      const walmartBestPriceItem = await getWalmartData(eachResult.title)
      finalResults[index] = await { ...finalResults[index], ...walmartBestPriceItem }
      index += 1;
    }
     res.send(finalResults);
    } catch (err) {
   res.send(err)
    }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
