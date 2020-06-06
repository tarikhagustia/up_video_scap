const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const cache = require("../libs/cache")

const API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Get Trending Videos  
 */
router.get('/trending', cache(60 * 60), function (req, res, next) {
  console.log(API_KEY)
  const locale = req.query.locale || "ID";
  const result = req.query.result || 10;
  axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&maxResults=${result}&chart=mostPopular&regionCode=${locale}&key=${API_KEY}`)
    .then(response => {
      res.send(response.data);
    }).catch(e => {
      console.error(e)
      res.send({ message: "Error" })
    })
});

module.exports = router;
