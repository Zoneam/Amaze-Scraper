const PORT = 8000;
const cheerio = require("cheerio");
const express = require("express");
const axios = require("axios");
const { forEach } = require("axios/lib/utils");
const { response } = require("express");
const homeUrl = "https://www.amazon.com";
const searchPage = "https://www.amazon.com/s?k=drill&ref=nb_sb_noss_2";
const app = express();

let urls = [];
const finalResults = []
;

const fetchPage = async (url) => {
    try {
        const response = await axios(url)
        console.log(response.status)
        if (response.status){
            return response.data ;
        }
        
    } catch (err){
        if (err.response){
            if (err.response.status === 503) {
            console.log(url)
        }}
       
    }
};

const getPrices = async (url)=>{
    let price;
    let priceFrom;
    let couponAmount = '';
    let isCouponAvailable = false;
    console.log('-----------------------------------------------')
    const response = await fetchPage(url)
    const productPage = response ? response : '';
    if (productPage){
    let $ = cheerio.load(productPage);
        if ($('.couponBadge',productPage).text() === 'Coupon') {
            couponAmount = $('span:contains("Save an extra")', productPage).text().substr(15, 8).trim().split(' ');
            console.log(couponAmount[0])
            isCouponAvailable = true;
            console.log(isCouponAvailable)
        } 
        if ($("#priceblock_ourprice", productPage).text()) {
            price = $("#priceblock_ourprice", productPage).text();
            priceFrom = 'Our Price';
        } else if ($("#priceblock_dealprice", productPage).text()) {
            price = $("#priceblock_dealprice", productPage).text();
            priceFrom = 'Dealer Price';
        } else if ($("#priceblock_saleprice", productPage).text()) {
            price = $("#priceblock_saleprice", productPage).text();
            priceFrom = 'Sale Price';
        } else {
            return; // if price unavailable return
        }
  console.log(price + "    " + url + "\n " + isCouponAvailable);
  finalResults.push({
      pricefrom: priceFrom,
      price: price,
      link: url,
      coupon: isCouponAvailable,
      couponAmount: couponAmount[0]?couponAmount[0]:'',
})
    } else {
        console.log('Product Not Found !')
        urls.push(url);
        console.log(urls.length)
    }
}

const getPricesDelay = async (urls) => {
    const timer = ms => new Promise(res => setTimeout(res, ms))
    async function load () { 
        for (const url of urls){
        await timer(100); // delay miliseconds before each fetch
        getPrices(url)
      }
      console.log(finalResults,finalResults.length)
    }
    load()
}

axios(searchPage).then(response =>{
    let $ = cheerio.load(response.data)
    $(".s-asin", response.data).each(function (i) {
    const tailLink = $(this)
        .find("a" + ".s-no-outline")
        .attr("href");
    if (tailLink) {
        urls.push(homeUrl + tailLink);
       // console.log(i + ": " + homeUrl + tailLink);
      }
        })
    }).then(() => getPricesDelay(urls))

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});