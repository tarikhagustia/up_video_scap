const API_KEY = "AIzaSyClIa41lPaHwqW5pDNzqJsovSO0hFQlIJk";
const {google} = require('googleapis');
const path = require('path');
const {authenticate} = require('@google-cloud/local-auth');

// initialize the Youtube API library
const youtube = google.youtube('v3');

// a very simple example of searching for youtube videos
async function runSample() {
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, '../oauth2.keys.json'),
    scopes: ['https://www.googleapis.com/auth/youtube'],
  });
  google.options({auth});

  const res = await youtube.search.list({
    part: 'id,snippet',
    q: 'Node.js on Google Cloud',
  });
  console.log(res.data);
}

module.exports = runSample;