const express = require('express');
const multer = require('multer')
const router = express.Router();
const os = require('os');
const upload = multer({ dest: os.tmpdir() });

const ffmpeg = require('fluent-ffmpeg');
const command = ffmpeg();
const resolutions = [
  '1920x1080', '1280x720', '480x360', '240x144'
];

/**
 * Upload Files
 */
router.post('/videos', upload.single('video'), function (req, res, next) {
  const { originalname, encoding, mimetype, destination, filename, path } = req.file;
  // Start encoding
  ffmpeg(path)
    .size('1280x720')
    .on('error', function (err) {
      console.log('An error occurred: ' + err.message);
    })
    .on('end', function () {
      console.log('Processing finished !');
    })
    .save('./public/videos/output.mp4');
  res.send("Uploading")
});

module.exports = router;
