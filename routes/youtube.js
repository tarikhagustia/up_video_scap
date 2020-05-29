const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const cache = require("../libs/cache")

const API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyClIa41lPaHwqW5pDNzqJsovSO0hFQlIJk";

/**
 * Get Trending Videos  
 */
router.get('/trending', cache(10), function (req, res, next) {
  axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&maxResults=50&chart=mostPopular&regionCode=ID&key=${API_KEY}`)
    .then(response => {
      console.log(response.data)
      res.send(response.data);
    })
});

module.exports = router;
