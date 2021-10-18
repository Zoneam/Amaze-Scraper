const PORT = process.env.PORT || 8000;
const cheerio = require("cheerio");
const express = require("express");
const path = require("path");
const axios = require("axios");
const homeUrl = "https://www.amazon.com";
// const cors = require("cors");
const app = express();
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
// ENDPOINT
app.get("/api/:searchInput", async (req, res) => {
  let url = '';
  let finalResults = [];
  let priceWhole ='';
  let priceFraction = '';
  let img = '';
  let title = '';
  let couponAmount = '';
  let isCouponAvailable = false;
 
    axios(`https://www.amazon.com/s?k=${req.params.searchInput}&ref=nb_sb_noss_1`)
      .then((response) => {
        let $ = cheerio.load(response.data);
        $(".s-asin", response.data).each(function (i) {
          isCouponAvailable = false;
          if ($(this).find('span' + '.s-coupon-highlight-color').text() !== '') {
            couponAmount = $(this).find('.s-coupon-highlight-color').text()
            isCouponAvailable = true;
          } else {
            couponAmount = "";
          }
          if ($(this).find('span' + '.a-text-normal').text() !== "") {
            title = $(this).find('span' + '.a-text-normal').text();
          }
          if ($(this).find('img' + '.s-image').attr("src") !== "") {
            img = $(this).find('img' + '.s-image').attr("src");
          }
          if ($(this).find('span' + '.a-price-whole').text() !== '') {
            priceWhole = $(this).find('span' + '.a-price-whole').text();
            priceFraction = $(this).find('span' + '.a-price-fraction').text();
          }
          if ($(this).find('a' + '.a-link-normal').attr('href') !== '') {
            url = $(this).find('a' + '.a-link-normal').attr('href');
          }
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
      })
      .then( () => {
        res.json(finalResults);
      });
  
});
// LISTENING FOR THE PORT -----
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
