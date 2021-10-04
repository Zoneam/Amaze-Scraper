const PORT = 8000;
const cheerio = require('cheerio');
const express = require('express');
const axios = require('axios');
const url = 'https://www.amazon.com/s?k=screwdriver&ref=nb_sb_noss_2';

const app = express()

const getData = async () => {
    const titles = [];
try {
    const response = await axios(url);
    const websiteHtml = response.data;
    const $ = cheerio.load(websiteHtml)

    $('.a-size-base-plus', websiteHtml).each(function(){
         titles.push($(this).text())

    })
console.log(titles)
} catch(err){
    console.log(err)
}
}

getData();

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`)
  })