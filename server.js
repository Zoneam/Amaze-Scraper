const PORT = 8000;
const cheerio = require("cheerio");
const express = require("express");
const path = require("path");
const axios = require("axios");
const homeUrl = "https://www.amazon.com";
const cors = require("cors");
const app = express();
app.use(cors());

// ENDPOINT
app.get("/:searchInput", async (req, res) => {
  let index = 0;
  let urls = [];
  let finalResults = [];
  // FETCH SINGLE PAGE -------------------
  const fetchPage = async (url) => {
    try {
      const response = await axios(url);
      console.log("----------------------");
      console.log(response.status, url);
      if (response.status) {
        return response.data;
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 503) {
          console.log("----------------------");
          console.log(err.response.status + " Error");
        }
      }
    }
  };
  //----------------------------------------

  // GET PRICE DATA FROM SINGLE ITEM
  const getPrices = async (url) => {
    index += 1;
    console.log("----" + index + "----");
    let price;
    let priceFrom;
    let couponAmount = "";
    let isCouponAvailable = false;
    const response = await fetchPage(url);
    const productPage = response ? response : "";
    if (productPage) {
      let $ = cheerio.load(productPage);
      if ($(".couponBadge", productPage).text() === "Coupon") {
        couponAmount = $('span:contains("Save an extra")', productPage)
          .text()
          .substr(15, 8)
          .trim()
          .split(" ");
        console.log(couponAmount[0]);
        isCouponAvailable = true;
        console.log(isCouponAvailable);
      } else {
        couponAmount = "";
      }
      if ($("#priceblock_ourprice", productPage).text()) {
        price = $("#priceblock_ourprice", productPage).text();
        priceFrom = "Our Price";
      } else if ($("#priceblock_dealprice", productPage).text()) {
        price = $("#priceblock_dealprice", productPage).text();
        priceFrom = "Dealer Price";
      } else if ($("#priceblock_saleprice", productPage).text()) {
        price = $("#priceblock_saleprice", productPage).text();
        priceFrom = "Sale Price";
      } else {
        return; // if price unavailable return
      }
      console.log(price + "    " + url + "\n " + isCouponAvailable);
      finalResults.push({
        pricefrom: priceFrom,
        price: price,
        link: url,
        coupon: isCouponAvailable,
        couponAmount: couponAmount[0] ? couponAmount[0] : "",
      });
      //urls = urls.filter((u) => u !== url);
      console.log(urls.length);
    } else {
      console.log("Product Not Found !");
      urls.push(url);
      console.log(urls.length);
    }
  };
  //----------------------------------------
  //  DELAY AND FETCH SINGLE ITEM ---------
  const getPricesDelay = async (urls) => {
    async function load() {
      for (const url of urls) {
        await getPrices(url);
      }
    }

    await load();
    console.log(finalResults, finalResults.length);
    res.send(finalResults);
  };
  //----------------------------------------
  // STARTING POINT AND FETCH ALL URLS -----
  function start(input) {
    const searchPage = `https://www.amazon.com/s?k=${input}&ref=nb_sb_noss_2`;
    axios(searchPage)
      .then((response) => {
        let $ = cheerio.load(response.data);
        $(".s-asin", response.data).each(function (i) {
          const tailLink = $(this)
            .find("a" + ".s-no-outline")
            .attr("href");
          if (tailLink) {
            urls.push(homeUrl + tailLink);
          }
        });
      })
      .then(() => getPricesDelay(urls));
  }
  start(req.params.searchInput);
});
// LISTENING FOR THE PORT -----
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});