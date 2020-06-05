const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const cache = require("../libs/cache")
const Instagram = require('instagram-web-api')
const { IG_USERNAME, IG_PASSWORD } = process.env
const FileCookieStore = require('tough-cookie-filestore2')
const cookieStore = new FileCookieStore('./storage/cookies.json')
const client = new Instagram({ username : IG_USERNAME, password: IG_PASSWORD, cookieStore })

/**
 * Get Trending Videos  
 */
router.get('/search', cache(10 * 60), async (req, res, next) => {
  const q = req.query.q
  await client.login()
  const result = await client.search({ query: q })
  res.send(result)
});

/**
 * Get Media Feed By Hashtag
 */
router.get('/media/hashtag', cache(10 * 60), async (req, res, next) => {
  const { hashtag } = req.query
  await client.login()
  const media = await client.getMediaFeedByHashtag({ hashtag: hashtag })
  res.send(media)
});

/**
 * Get Short Code
 */
router.get('/media/:shortcode', cache(10 * 60), async (req, res, next) => {
  const { shortcode } = req.params
  await client.login()
  const media = await client.getMediaByShortcode({ shortcode })
  res.send(media)
});



module.exports = router;
