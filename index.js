const PORT = 8000;
const cheerio = require('cheerio');
const express = require('express');
const axios = require('axios');
const homeUrl = 'https://www.amazon.com';
const searchPage = 'https://www.amazon.com/s?k=screwdriver&ref=nb_sb_noss_2'
const app = express()

const getData = async () => {
    let price;
    let pageUrls = [];
try {
const pageResponse = await axios(searchPage);
let $ = cheerio.load(pageResponse.data);
    $('.s-no-outline', pageResponse.data).each(function() {
        const tailLink = $(this).attr('href')
        pageUrls.push(homeUrl + tailLink);
    })
//console.log(pageUrls)
try {
// pageUrl = 'https://www.amazon.com/AmazonBasics-Magnetic-Ratchet-Wrench-Screwdriver/dp/B07V843VFN/ref=sr_1_1_sspa?dchild=1&keywords=screwdriver&qid=1633395515&sr=8-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExQTVFQUtUR1g3SkI2JmVuY3J5cHRlZElkPUEwNjE1Mjc0MUtGUVI5WUtaRzQ2VSZlbmNyeXB0ZWRBZElkPUEwMjgwOTA1MVdQSTNEWDIwVlBJTCZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU='
 pageUrls.forEach(async pageUrl => {
        const response = await axios(pageUrl);
            const websiteHtml = response.data;
            $ = cheerio.load(websiteHtml)
            price = $('#priceblock_ourprice', websiteHtml).text()?$('#priceblock_ourprice', websiteHtml).text():'On Sale Price: ' + $('#priceblock_saleprice', websiteHtml).text()    
        console.log(price)
 })
} catch(err){
    //console.log(err)
}




} catch(err){
   // console.log(err)
}
}

getData();

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })