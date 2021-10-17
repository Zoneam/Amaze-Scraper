const PORT = process.env.PORT || 8000;
const cheerio = require("cheerio");
const express = require("express");
const path = require("path");
const axios = require("axios");
const homeUrl = "https://www.amazon.com";
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
// ENDPOINT
app.get("/api/:searchInput", async (req, res) => {
  let url;
  let urls = [];
  let finalResults = [];
  let priceWhole;
  let priceFraction;
  let img;
  let title;
  let couponAmount = "";
  let isCouponAvailable = false;
  // FETCH SINGLE PAGE -------------------
  // const fetchPage = async (url) => {
  //   try {
  //   const response = await axios(url);
  //   console.log("----------------------");
  //   console.log(response.status, url);
  //   if (response.status) {
  //       return response.data;
  //     }
  //   } catch (err) {
  //     if (err.response) {
  //       if (err.response.status === 503) {
  //         console.log("----------------------");
  //         console.log(err.response.status + " Error");
  //       }
  //     }
  //   }
  // };
  //----------------------------------------

  // GET PRICE DATA FROM SINGLE ITEM
  // const getPrices = async (url) => {
  //   index += 1; //for testing
  //   console.log("----" + index + "----"); //for testing
  //   let price;
  //   let priceFrom;
  //   let img;
  //   let title;
  //   let couponAmount = "";
  //   let isCouponAvailable = false;
  //   const response = await fetchPage(url);
  //   const productPage = response ? response : "";
  //   if (productPage) {
  //     let $ = cheerio.load(productPage); // LOADING HTML INTO CHEERIO
  //     if ($(".couponBadge", productPage).text() === "Coupon") {
  //       couponAmount = $('span:contains("Save an extra")', productPage)
  //         .text()
  //         .substr(15, 8)
  //         .trim()
  //         .split(" ");
  //       console.log(couponAmount[0]);
  //       isCouponAvailable = true;
  //       console.log(isCouponAvailable);
  //     } else {
  //       couponAmount = "";
  //     }
  //     if ($("#productTitle", productPage).text() !== "") {
  //       title = $("#productTitle", productPage).text();
  //     }
  //     if ($("#landingImage", productPage).attr("src") !== "") {
  //       img = $("#landingImage", productPage).attr("src");
  //     }
  //     if ($("#priceblock_ourprice", productPage).text()) {
  //       price = $("#priceblock_ourprice", productPage).text();
  //       priceFrom = "Our Price";
  //     } else if ($("#priceblock_dealprice", productPage).text()) {
  //       price = $("#priceblock_dealprice", productPage).text();
  //       priceFrom = "Dealer Price";
  //     } else if ($("#priceblock_saleprice", productPage).text()) {
  //       price = $("#priceblock_saleprice", productPage).text();
  //       priceFrom = "Sale Price";
  //     } else {
  //       return; // if price unavailable return
  //     }
  //     console.log(price + "    " + url + "\n " + isCouponAvailable);
  //     finalResults.push({
  //       title: title.trim(),
  //       pricefrom: priceFrom,
  //       price: price,
  //       link: url,
  //       img: img,
  //       coupon: isCouponAvailable,
  //       couponAmount: couponAmount[0] ? couponAmount[0] : "",
  //     });
  //     console.log(urls.length);
  //     console.log(title.trim());
  //   } else {
  //     console.log("Product Not Found !");
  //     urls.push(url);
  //     console.log(urls.length);
  //   }
  // };
  //----------------------------------------
  //  DELAY AND FETCH SINGLE ITEM ---------
  // const getPricesDelay = async (urls) => {
  //   async function load() {
  //     for (const url of urls) {
  //       await getPrices(url);
  //     }
  //   }

  //   await load();
  //   console.log(finalResults, finalResults.length);
  //   res.send(finalResults);
  // };
  //----------------------------------------
  // STARTING POINT AND FETCH ALL URLS -----

    const searchPage = `https://www.amazon.com/s?k=${req.params.searchInput}&ref=nb_sb_noss_2`;
    axios(searchPage)
      .then((response) => {
        let $ = cheerio.load(response.data);
        $(".s-asin", response.data).each(function (i) {
          isCouponAvailable = false;
          if ($(this).find('span' + '.s-coupon-highlight-color').text() !== '') {
            couponAmount = $(this).find('.s-coupon-highlight-color').text()
            console.log(couponAmount);
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
      .then(() => {
        console.log(finalResults)
        res.send(finalResults);
      });
  
});
// LISTENING FOR THE PORT -----
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
