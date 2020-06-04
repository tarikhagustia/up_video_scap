const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const cache = require("../libs/cache")

/**
 * Get Trending Videos  
 */
router.get('/hashtag', async (req, res, next) => {
  const hashtag = req.query.hasgtag
  axios.get(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${hashtag}&include_reel=true`)
    .then(response => {
      console.log(response.data)
      res.send(response.data)
    }).catch(err => {
      console.error(err)
      res.status(500).send({
        message: "Error"
      })
    })
});


module.exports = router;
