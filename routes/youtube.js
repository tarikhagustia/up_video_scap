const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const cache = require("../libs/cache")

const API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * Get Trending Videos  
 */
router.get('/trending', function (req, res, next) {
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

/**
 * Search video by keywords 
 */
router.get('/search', cache(60 * 5), function (req, res, next) {
  const q = req.query.q;
  axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=100&q=${q}&key=${API_KEY}`)
    .then(response => {
      res.send(response.data);
    }).catch(e => {
      console.error(e)
      res.send({ message: "Error" })
    })
});

/**
 * Search video by location 
 */
router.get('/search_location', cache(60 * 5), function (req, res, next) {
  const q = req.query.q;
  const location = req.query.location;
  const radius = req.query.radius || '10mi';
  axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&location=${location}&locationRadius=${radius}&q=${q}&type=video&key=${API_KEY}`)
    .then(response => {
      res.send(response.data);
    }).catch(e => {
      console.error(e)
      res.send({ message: "Error" })
    })
});

module.exports = router;
