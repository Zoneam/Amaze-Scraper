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
        res.send([
          {
            title: 'Bluetooth Speaker,MusiBaby Speaker,Outdoor, Portable,Waterproof,Wireless Speakers,Dual Pairing, Bluetooth 5.0,Loud Stereo,Booming Bass,1500 Mins Playtime for Home&Party Black',
            priceWhole: '26.',
            priceFraction: '93',
            link: 'https://www.amazon.com/Bluetooth-Speakers-MusiBaby-Portable-Waterproof/dp/B07XVFB67J/ref=sr_1_13?dchild=1&keywords=speaker&qid=1634430211&sr=8-13',
            img: 'https://m.media-amazon.com/images/I/713Nb6CHS-L._AC_UY218_.jpg',
            coupon: true,
            couponAmount: 'Save 5%'
          },
          {
            title: 'JBL Flip 4 Waterproof Portable Bluetooth Speaker - Blue',
            priceWhole: '116.',
            priceFraction: '95',
            link: 'https://www.amazon.com/JBL-Bluetooth-Portable-Stereo-Speaker/dp/B01N0QHI8L/ref=sr_1_14?dchild=1&keywords=speaker&qid=1634430211&sr=8-14',
            img: 'https://m.media-amazon.com/images/I/71WS9WIUDKL._AC_UY218_.jpg',
            coupon: false,
            couponAmount: ''
          }
        ])
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
        res.send(finalResults);
      });
  
});
// LISTENING FOR THE PORT -----
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
