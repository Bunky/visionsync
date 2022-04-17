const router = require('express').Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');
const { Readable, PassThrough } = require('stream');
const Match = require('../models/match.model');
const Config = require('../models/config.model');
const defaultSettings = require('../processor/defaultSettings.json');

// aws stuff
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});
AWS.config.update({
  region: 'us-east-2',
});

// =================================================================================================
//                                           Upload Match
// =================================================================================================

const generateThumbnail = (data, matchId) => new Promise((resolve, reject) => {
  const tmpobj = tmp.dirSync();

  ffmpeg(Readable.from(data))
    .takeScreenshots({
      timemarks: ['00:00:01.000'],
      filename: matchId,
      folder: tmpobj.name,
      size: '640x360',
    }).on('end', async () => {
      const thumbnailBuffer = await fs.readFileSync(path.join(tmpobj.name, `${matchId}.png`));
      fs.rmdirSync(tmpobj.name, { recursive: true });
      console.log('Thumbnail generated successfully');
      return resolve(thumbnailBuffer);
    }).on('err', (err) => reject(err));
});

router.route('/upload').post(async (req, res) => {
  if (req.isAuthenticated()) {
    const matchId = uuidv4();

    // Process uploaded video
    const passthroughStream = new PassThrough();
    const ffmpegCommand = ffmpeg()
      .input(Readable.from(req.files.match.data))
      .FPS(30)
      .size('640x360')
      .autopad()
      .videoBitrate(1000)
      .videoCodec('libx264')
      .noAudio()
      .outputFormat('mp4')
      .outputOptions('-movflags frag_keyframe+empty_moov');

    ffmpegCommand.on('end', () => {
      console.log('Video converted successfully');
    }).on('error', (err) => {
      console.log(`Error: ${err.message}`);
    }).on('progress', (p) => {
      // console.log(p);
    }).pipe(passthroughStream);

    // Uploading files to the bucket
    try {
      const s3ThumbnailResponse = await s3.upload({
        Bucket: 'videos.visionsync.io',
        Key: `thumbnails/${matchId}.png`,
        Body: await generateThumbnail(req.files.match.data, matchId)
      }).promise();
      const s3Response = await s3.upload({
        Bucket: 'videos.visionsync.io',
        Key: `${matchId}.mp4`,
        Body: passthroughStream
      }).promise();

      let config = defaultSettings;
      if (req.body.config) {
        config = (await Config.findById(req.body.config)).config;
      }

      const newMatch = new Match({
        matchId,
        ownerId: req.user._id,
        title: req.body.title,
        settings: config,
      });

      await newMatch.save();
      return res.status(200).send({
        thumbnailRes: s3ThumbnailResponse,
        videoRes: s3Response,
      });
    } catch (err) {
      console.log(err);
    }
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                           Get Matches
// =================================================================================================

router.route('/').get(async (req, res) => {
  if (req.isAuthenticated()) {
    const matches = await Match.find({ ownerId: req.user._id }, {
      ownerId: 0, settings: 0, __v: 0, _id: 0,
    });
    return res.status(200).send(matches);
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                         Delete Matche
// =================================================================================================

router.route('/').delete(async (req, res) => {
  if (req.isAuthenticated()) {
    const { matchId } = req.body;
    await Match.deleteOne({ matchId });

    // Deleting files from the bucket
    const s3Response = s3.deleteObject({
      Bucket: 'videos.visionsync.io',
      Key: `thumbnails/${matchId}.png`
    }).promise();
    const s3ThumbnailResponse = s3.deleteObject({
      Bucket: 'videos.visionsync.io',
      Key: `${matchId}.mp4`
    }).promise();

    return res.status(200).send({
      thumbnailRes: s3ThumbnailResponse,
      videoRes: s3Response
    });
  }
  return res.sendStatus(403);
});

// =================================================================================================
//                                           Watch Match
// =================================================================================================

router.route('/watch').get(async (req, res) => {
  if (req.isAuthenticated()) {
    const params = {
      Bucket: 'videos.visionsync.io',
      Key: `${req.query.matchId}.mp4`,
    };

    s3.getObject(params).on('httpHeaders', (statusCode, headers) => {
      res.set('Content-Length', headers['content-length']);
      res.set('Content-Type', headers['content-type']);
      return this.response.httpResponse.createUnbufferedStream().pipe(res);
    }).send();

    // return res.status(200).send(matches);
  } else {
    return res.sendStatus(403);
  }
});

module.exports = router;
