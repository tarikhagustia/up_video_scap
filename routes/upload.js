const express = require('express');
const multer = require('multer')
const router = express.Router();
const os = require('os');
const upload = multer({ dest: os.tmpdir() });
const db = require('../libs/db');
const moment = require('moment');
const fs = require('fs');

const { encode } = require('../libs/crypt');

const ffmpeg = require('fluent-ffmpeg');
// const resolutions = [
//   '1920x1080', '1280x720', '480x360', '240x144'
// ];

const resolutions = [
  {
    resolution: '240x144',
    px: 144
  },
  {
    resolution: '480x360',
    px: 360
  },
  // {
  //   resolution: '1280x720',
  //   px: 720
  // },
  // {
  //   resolution: '1920x1080',
  //   px: 1080
  // },

];

function asynqQuery(query, params) {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err)
        return reject(err);
      resolve(result);
    });
  });

}

function string_to_slug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to = "aaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

const handleLogin = (path) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) {
        return reject(err)
      } else {
        return resolve(metadata.format)
      }
    })
  })
}

/**
 * Upload Files
 */
router.post('/videos', upload.single('video'), async (req, res, next) => {
  const { originalname, encoding, mimetype, destination, filename, path } = req.file;
  const slug = encode(20);
  const meta = await handleLogin(path);
  const results = await asynqQuery("INSERT INTO videos SET ?", {
    title: req.body.title, encoding, mimetype, original_filename: originalname, duration: meta.duration, status: 'Uploading', created_at: moment().format('YYYY-MM-DD HH:mm:ss')
  });

  const videoId = results.insertId;

  // Start encoding
  const render = ffmpeg(path);
  let videos = [];
  const ID = encode(10);
  resolutions.forEach((item, key) => {
    
    const mainDir = `${process.env.UPLOAD_LOCATION}/videos/${ID}/${item.px}/`;
    
    // Check if directory is not exist
  
    if(!fs.existsSync(mainDir)) {
      fs.mkdirSync(mainDir, {
        recursive: true
      })
    }
    const outputDir = `${mainDir}${videoId}-${slug}-${item.resolution}.m3u8`;
    const outputUrl = `/videos/${ID}/${item.px}/${videoId}-${slug}-${item.resolution}.m3u8`;

    videos.push({
      outputDir, outputUrl, resolution: item.resolution, px: item.px
    });
    render.outputOptions([
      '-hls_time 5',
      '-hls_list_size 14',
      '-hls_flags omit_endlist', // +delete_segments
      // `-hls_segment_filename ${process.env.UPLOAD_LOCATION}/videos/${item.px}/${videoId}_%05d.ts`
    ])
    render.output(outputDir)
      .size(item.resolution);
  })
 
  render.on('end', (i) => {
    console.log(i)
    videos.forEach(async (item) => {
      // TODO : Save to MySQL database about information
      const videoItemId = await asynqQuery("INSERT INTO video_files SET ? ", {
        video_id: videoId, resolution: item.px, resolution_detail: item.resolution, file_location: item.outputDir, file_url: item.outputUrl, created_at: moment().format('YYYY-MM-DD HH:mm:ss')
      })
      console.log(`Rending ${item.outputUrl} success`);

      // TODO : Send Notification To Database
    })
    // UPDATE Status Records
    asynqQuery('UPDATE videos SET status = "Published" WHERE ? ', {
      id: videoId
    })
  }).run();

  const renderImage = ffmpeg(path);
  // Take Screenshoot
  renderImage.on('filenames', function (filenames) {
    filenames.forEach(item => {
      asynqQuery("INSERT INTO thumbs SET ?", {
        video_id: videoId,
        file_url: `/images/${item}`,
        created_at: moment().format('YYYY-MM-DD HH:mm:ss')
      }).catch(err => {
        console.error(err)
      })
    })
  })
    .screenshots({
      // Will take screens at 20%, 40%, 60% and 80% of the video
      count: 4,
      filename: slug + '-at-%s-seconds.png',
      folder: `${process.env.UPLOAD_LOCATION}/images`
    });


  res.send({
    status: true,
    message: "Your video is processing...",
    data: {
      videoId
    }
  })
});

module.exports = router;
