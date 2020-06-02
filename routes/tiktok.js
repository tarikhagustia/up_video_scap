const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const cache = require("../libs/cache")
const fetch = require('node-fetch');
const API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyClIa41lPaHwqW5pDNzqJsovSO0hFQlIJk";

const config = {
  headers: {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    Host: "t.tiktok.com",
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
  }
}

/**
 * Get Trending Videos  
 */
router.get('/trending', cache(5), function (req, res, next) {
  const locale = 'ID';
  axios.get(`https://t.tiktok.com/api/item_list/?count=30&id=1&type=5&secUid=&maxCursor=0&minCursor=0&sourceType=12&appId=1180&region=${locale}&language=en&verifyFp=verify_kav0pyn5_Tp5OlJLi_FF8G_4OL3_Bcb9_XBYcnRSScLoz&_signature=xKZsigAgEBJIs-FvkkTRV8SmbZAAJp.`, config)
    .then(response => {
      res.send(response.data.items)
    }).catch(err => {
      console.error(err)
      res.status(500).send({
        message: "Error"
      })
    })


});

module.exports = router;
