const PORT = process.env.PORT || 8000;
const cheerio = require("cheerio");
const express = require("express");
const path = require("path");
const axios = require("axios");
const homeUrl = "https://www.amazon.com";
const puppeteer = require("puppeteer");
const app = express();
const cors = require('cors');
const { send } = require("process");
const corsOptions = {
  //exposedHeaders: 'Authorization',
  // origin: true,
  // optionsSuccessStatus: 200
};
// app.use(timeout('15s'))
// app.use(bodyParser())
// app.use(haltOnTimedout)
app.use(cors({
  origin: "*",
}));
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

app.get("/api/walmart/:title", async (req, res) => {
  let items = [];
  let searchItem = req.params.title;
  let searchTitleWordArray = searchItem.split(' '); // Braking our search title into array of words
  let gradedItems = [];
  let headerVersion;
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox']
    }); // needs to be headless on heroku
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(0); // need to set timout to get prices faster
    headerVersion = Math.floor(Math.random() * 1000);
    await page.setExtraHTTPHeaders({  // Need to rotate headers to bypass CAPTCHA on walmart.com
      'user-agent': `Mozilla/5.0 (Windows NT ${headerVersion}.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.132 Safari/537.36`,
      'upgrade-insecure-requests': '1',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'en-US,en;q=0.9,en;q=0.8'
    })
    console.log(headerVersion);
    await page.goto(`https://www.walmart.com/search?q=${searchItem}`, { 
      timeout: 0,
      waitUntil: 'domcontentloaded',
      // waitUntil: 'networkidle0'
    });
    const html = await page.content();
    const $ = cheerio.load(html);    
    if ($('title', html).text() === 'Robot or human?') {
      // Sending Bot Detected response
      res.sendStatus(204);
      await context.close();
      await browser.close();
      sleep(5000);
      console.log("sleep");
      
      return;
    }

    $(".pa0-xl", html).each(function (i) { // finding each item on search page by class name
              if ($(this).find('span' + '.lh-title').text() !== '') {
                items.push({
                  walmartTitle: $(this).find('span' + '.lh-title').text().replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s{2,}/g, ' ').split(' '),
                  walmartPrice: $(this).children().find('div' + '.mr2-xl').text()?$(this).children().find('div' + '.mr2-xl').text():$(this).children().find('div' + '.lh-copy').text().replace(/[^0-9.]/g,''),
                  walmartLink: ($(this).children().find('a' + '.z-1').attr('href').substring(0, 4) === 'http') ? $(this).children().find('a' + '.z-1').attr('href') : 'https://www.walmart.com' + $(this).children().find('a' + '.z-1').attr('href'),
                  grade: 0,
                })
              }
    })

    //--------------- Simple Grading Algorithm to find best match for our product ---------------------
    items.forEach(item => {  // Grading each item on search page
      searchTitleWordArray.forEach((searchTitleWord,i) => {
        if (item.walmartTitle.includes(searchTitleWord)) {
          if (searchTitleWord === item.walmartTitle[0] && i === 0) { // checking if first word in titles match
            item.grade += 5;
          }
          if (searchTitleWord === item.walmartTitle[1] && i === 1) { // checking if second words in titles match
            item.grade += 3;
          }
          if (searchTitleWord === item.walmartTitle[3] && i === 3) { // checking if third words in titles match
            item.grade += 2;
          }
          item.grade++;
        }
      })
      gradedItems.push(item);
    })
    
    gradedItems.sort((a, b) => b.grade - a.grade); // Sorting Graded items by grade    
    

    if (Math.floor(gradedItems[0].grade * 100 / searchTitleWordArray.length) < 80) { // checking if 80% words in title match
      res.sendStatus(404) // Sending N/A back
    } else {
      gradedItems[0].matchPercentage = Math.floor(gradedItems[0].grade * 100 / searchTitleWordArray.length); 
      res.send(gradedItems[0]) // Sending back our highest graded item
    }
    await context.close();
    await browser.close();
  } catch (err) {
    res.send(err);
  }
})

app.get("/api/:searchInput", async (req, res) => { // our GET request for amazon.com search
  let url = '';
  let productResults = [];
  let priceWhole ='';
  let priceFraction = '';
  let img = '';
  let title = '';
  let couponAmount = '';
  let isCouponAvailable = false;

  try {
      const response = await axios({ // Amazon doesnt have CAPTCHA check, dont neet to worry about rotating headers here
        method: 'GET',
        url: `https://www.amazon.com/s?k=${req.params.searchInput}&ref=nb_sb_noss_1`,
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

    $(".s-asin", response.data).each(function (i) { // Finding products by Class name on search page
          // Finding Coupon 
          isCouponAvailable = false;
          if ($(this).find('span' + '.s-coupon-highlight-color').text() !== '') { // Looking for coupon if available
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
          productResults.push({
            title: title.trim(),
            priceWhole: priceWhole,
            priceFraction: priceFraction,
            link: homeUrl + url,
            img: img,
            coupon: isCouponAvailable,
            couponAmount: couponAmount ? couponAmount : "",
          });
  });                                                          
      productResults.length = 15;
     // Sending responce
      res.send(productResults); // Sending found products back
    } catch (err) {
      res.send(err)
    }
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
