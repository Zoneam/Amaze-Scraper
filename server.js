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
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        slowMo: 0,
        args: ['--window-size=1920,1080',
        '--remote-debugging-port=9222',
        "--remote-debugging-address=127.0.0.1", // You know what your doing?
          '--disable-gpu', "--disable-features=IsolateOrigins,site-per-process", '--blink-settings=imagesEnabled=true',
          '--no-sandbox', "--disable-setuid-sandbox"
      ],
      "defaultViewport": {
        "height": 1080,
        "width": 1920
      },
    }); // needs to be headless on heroku, still cannot bypass CAPTCHA on walmart.com
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
      'upgrade-insecure-requests': '1',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9,en;q=0.8'
  })
    await page.goto(`https://www.walmart.com/search?q=${searchItem}`);
   
    const html = await page.content();
    const $ = cheerio.load(html);
    $(".pa0-xl", html).each(function (i) {
      if ($(this).find('span' + '.lh-title').text() !== '') {
        items.push({
          title: $(this).find('span' + '.lh-title').text(),
          price: $(this).children().find('div' + '.mr2-xl').text(),
          link: 'https://www.walmart.com/' + $(this).children().find('a' + '.z-1').attr('href'),
        })
      }
    })
    items.forEach(item => {
      item.grade = 0;
      walmartItemArray = item.title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s{2,}/g, ' ').split(' ');
      searchItemArray.forEach(searchItemWord => {
        if (walmartItemArray.includes(searchItemWord)) {
          item.grade += 1;
        }
      })
      gradedItemSearch.push(item);
    })
    gradedItemSearch.sort((a,b) => b.grade - a.grade);
    res.send(gradedItemSearch[0])
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
