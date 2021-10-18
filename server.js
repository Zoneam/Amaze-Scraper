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
  res.send(  [{
    title: 'Bluetooth Speakers, DOSS SoundBox Touch Portable Wireless Bluetooth Speakers with 12W HD Sound and Bass, IPX5 Waterproof, 20H Playtime,Touch Control, Handsfree, Speakers for Home,Outdoor,Travel-Black',
    priceWhole: '27.',
    priceFraction: '99',
    link: 'https://www.amazon.com/DOSS-Wireless-Bluetooth-Portable-Speaker/dp/B01CQOV3YO/ref=sr_1_19?dchild=1&keywords=speaker&qid=1634430211&sr=8-19',
    img: 'https://m.media-amazon.com/images/I/81WOtKe9T1L._AC_UY218_.jpg',
    coupon: true,
    couponAmount: 'Save $4.00'
  },
  {
    title: 'A2 LENRUE Portable Wireless Bluetooth Speaker with Built-in-Mic,Handsfree Call,AUX Line,TF Card,HD Sound and Bass for iPhone Ipad Android Smartphone and More(Rose Gold)',
    priceWhole: '15.',
    priceFraction: '99',
    link: 'https://www.amazon.com/A2-LENRUE-Bluetooth-Handsfree-Smartphone/dp/B071WYXY6B/ref=sr_1_20?dchild=1&keywords=speaker&qid=1634430211&sr=8-20',
    img: 'https://m.media-amazon.com/images/I/8165JZqGR1L._AC_UY218_.jpg',
    coupon: false,
    couponAmount: ''
  }]);
    // axios(`https://www.amazon.com/s?k=${req.params.searchInput}&ref=nb_sb_noss_1`)
    //   .then((response) => {
    //     let $ = cheerio.load(response.data);
    //     $(".s-asin", response.data).each(function (i) {
    //       isCouponAvailable = false;
    //       if ($(this).find('span' + '.s-coupon-highlight-color').text() !== '') {
    //         couponAmount = $(this).find('.s-coupon-highlight-color').text()
    //         isCouponAvailable = true;
    //       } else {
    //         couponAmount = "";
    //       }
    //       if ($(this).find('span' + '.a-text-normal').text() !== "") {
    //         title = $(this).find('span' + '.a-text-normal').text();
    //       }
    //       if ($(this).find('img' + '.s-image').attr("src") !== "") {
    //         img = $(this).find('img' + '.s-image').attr("src");
    //       }
    //       if ($(this).find('span' + '.a-price-whole').text() !== '') {
    //         priceWhole = $(this).find('span' + '.a-price-whole').text();
    //         priceFraction = $(this).find('span' + '.a-price-fraction').text();
    //       }
    //       if ($(this).find('a' + '.a-link-normal').attr('href') !== '') {
    //         url = $(this).find('a' + '.a-link-normal').attr('href');
    //       }
    //       finalResults.push({
    //               title: title.trim(),
    //               priceWhole: priceWhole,
    //               priceFraction: priceFraction,
    //               link: homeUrl + url,
    //               img: img,
    //               coupon: isCouponAvailable,
    //               couponAmount: couponAmount ? couponAmount : "",
    //             });
    //     });
    //   })
    //   .then( () => {
    //     res.send(finalResults);
    //   });
  
});
// LISTENING FOR THE PORT -----
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
