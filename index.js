const PORT = 8000;
const cheerio = require("cheerio");
const express = require("express");
const axios = require("axios");
const { forEach } = require("axios/lib/utils");
const homeUrl = "https://www.amazon.com";
const searchPage = "https://www.amazon.com/s?k=screwdriver&ref=nb_sb_noss";
const app = express();
let price;
let urls = [];

const getPrice = async (urls) => {
  try {
    urls.forEach(async (url) => {
      try {
        const response = await axios(url);
        const websiteHtml = await response.data;
        let $ = cheerio.load(websiteHtml);
        if ($("#priceblock_ourprice", websiteHtml).text()) {
          price =
            "ourprice: => " + $("#priceblock_ourprice", websiteHtml).text();
        } else if ($("#priceblock_dealprice", websiteHtml).text()) {
          price =
            "dealerprice: => " + $("#priceblock_dealprice", websiteHtml).text();
        } else if ($("#priceblock_saleprice", websiteHtml).text()) {
          price =
            "saleprice: => " + $("#priceblock_saleprice", websiteHtml).text();
        }
        // console.log(pageUrl);
        console.log(price + "    " + url);
      } catch (err) {
        console.log(err);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

const getData = async () => {
  try {
    const pageResponse = await axios(searchPage);
    let $ = cheerio.load(pageResponse.data);
    $(".s-asin", pageResponse.data).each(function (i) {
      const tailLink = $(this)
        .find("a" + ".s-no-outline")
        .attr("href");
      if (tailLink) {
        urls.push(homeUrl + tailLink);
        // console.log(i + ": " + homeUrl + tailLink);
      }
    });

    getPrice(urls);
  } catch (err) {
    console.log(err);
  }
};

getData();

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
