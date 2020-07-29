const express = require('express');
const router = express.Router();
const axios = require('axios').default;
const cache = require("../libs/cache")
const fetch = require('node-fetch');
const TikTokScraper = require('tiktok-scraper');
const puppeteer = require('puppeteer');

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
router.get('/trending', async (req, res, next) => {
  try {
    const posts = await TikTokScraper.trend('', { number: 50 });
    res.send(posts)
  } catch (err) {
    console.error(err)
    res.status(500).send({
      message: "Error"
    })
  }
});

/**
 * Get Discovery User
 */
router.get('/discovery/user', async (req, res, next) => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://www.tiktok.com/discover?lang=en');
  try {
    await page.waitForSelector('._explore_feed_card_item');
  } catch (e) {
    if (e instanceof puppeteer.errors.TimeoutError) {
      // Do something if this is a timeout.
      res.status(500).send({
        message: "Error"
      })
    }
  }
  const results = await page.evaluate(async () => {
    let results = []
    let items = document.querySelectorAll('li._user_carousel_list-item')
    items.forEach(el => {
      const name = el.querySelector("h2._user_carousel_title").innerText
      const url = el.querySelector("a").getAttribute("href")
      const username = el.querySelector("h3._user_carousel_sub-title").innerText
      const follower = el.querySelector("strong").innerText
      const cssBg = el.querySelector("div._user_carousel_avatar")
      style = cssBg.currentStyle || window.getComputedStyle(cssBg, false)
      photo = style.backgroundImage.slice(4, -1).replace(/"/g, "");
      results.push({
        name, url, username, follower, photo
      })
    });

    return results
  })
  await browser.close();
  res.send(results)
});

async function autoScroll(page){
  await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 100;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}

/**
 * Get Discovery Popular Hastag Videos and Music
 */
router.get('/discovery', cache(60 * 5), async (req, res, next) => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://www.tiktok.com/discover/indonesia', { "waitUntil": "networkidle0" });
  await page.setViewport({
    width: 1200,
    height: 800
  });

  await autoScroll(page);

  const results = await page.evaluate(async () => {
    let results = []
    let items = document.querySelectorAll('div._explore_feed_item')

    items.forEach(item => {
      let tag = item.querySelector("h3._card_header_title").innerText
      let url = item.querySelector("a._card_header_link").getAttribute("href")
      let videos = item.querySelector("strong._card_header_subTitle").innerText

      const cards = item.querySelectorAll("div._explore_feed_card_item")
      let cardItems = []
      cards.forEach(c => {
        const url = c.querySelector("a").getAttribute("href")
        const cssBg = c.querySelector("div.image-card")
        style = cssBg.currentStyle || window.getComputedStyle(cssBg, false)
        console.log(style.backgroundImage)
        bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
        cardItems.push({
          url,
          cover: bi
        })
      });
      results.push({
        type: tag.startsWith("#") ? "hastag" : "music",
        tag,
        url,
        meta: videos,
        videos: cardItems
      })
    })
    return results
  });
  await browser.close();
  res.send(results)
});

/**
 * Get Video Details
 */
router.get('/videos/:username/video/:videoId', cache(60 * 5), async (req, res, next) => {
  try {
    // Format https://www.tiktok.com/@_kupitkcl/video/6832931475344674050
    const { videoId, username } = req.params
    const url = `https://www.tiktok.com/${username}/video/${videoId}`
    const video = await TikTokScraper.getVideoMeta(url, {})
    
    res.send(video)
  } catch (err) {
    console.error(err)
    res.status(500).send({
      message: "Error"
    })
  }
});


module.exports = router;
