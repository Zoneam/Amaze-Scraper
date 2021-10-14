const PORT = 8000;
const cheerio = require("cheerio");
const express = require("express");
const axios = require("axios");
const { forEach } = require("axios/lib/utils");
const { response } = require("express");
const homeUrl = "https://www.amazon.com";
const searchPage = "https://www.amazon.com/s?k=screwdriver&ref=nb_sb_noss";
const app = express();
let price;
let urls = [];


const fetchPage = async (url) => {
    try {
        const response = await axios(url)
        return (response.data ? response.data : '' );
    } catch (err){
        console.log(url," ----err\n", err)
    }
};

const getPrices = async (urls) => {
for (const url of urls){
    console.log('-----------------------------------------------')
        const response = await fetchPage(url)
        const productPage = response ? response : '';
        let $ = cheerio.load(productPage);
         if ($("#priceblock_ourprice", productPage).text()) {
          price =
            "ourprice: => " + $("#priceblock_ourprice", productPage).text();
        }
         else if ($("#priceblock_dealprice", productPage).text()) {
          price =
            "dealerprice: => " + $("#priceblock_dealprice", productPage).text();
        } else if ($("#priceblock_saleprice", productPage).text()) {
          price =
            "saleprice: => " + $("#priceblock_saleprice", productPage).text();
        }
       console.log(price + "    " + url);
    }
}

    


    




axios(searchPage).then(response =>{
    let $ = cheerio.load(response.data)
    $(".s-asin", response.data).each(function (i) {
    const tailLink = $(this)
        .find("a" + ".s-no-outline")
        .attr("href");
    if (tailLink) {
        urls.push(homeUrl + tailLink);
        console.log(i + ": " + homeUrl + tailLink);
      }
        })
    }).then(() => getPrices(urls))




app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});