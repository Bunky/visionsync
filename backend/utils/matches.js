const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const AWS = require('aws-sdk');
const { Readable, PassThrough } = require('stream');
const ffmpeg = require('fluent-ffmpeg');
const tmp = require('tmp');
const fs = require('fs');
const path = require('path');
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

const generateThumbnail = (matchData, matchId) => new Promise((resolve, reject) => {
  const tmpobj = tmp.dirSync();

  ffmpeg(Readable.from(matchData))
    .takeScreenshots({
      timemarks: ['00:00:00.000'],
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

exports.uploadMatch = (ownerId, title, configId, matchData) => new Promise(async (resolve, reject) => {
  let config = defaultSettings;
  if (configId) {
    config = (await Config.findById(configId)).config;
  }

  const newMatch = new Match({
    ownerId,
    title,
    config
  });
  const match = await newMatch.save();

  // Process uploaded video
  const passthroughStream = new PassThrough();
  const ffmpegCommand = ffmpeg()
    .input(Readable.from(matchData))
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

  try {
    // const s3ThumbnailResponse = await s3.upload({
    //   Bucket: 'videos.visionsync.io',
    //   Key: `thumbnails/${match._id}.png`,
    //   // Body: await generateThumbnail(matchData, match._id)
    //   Body: await generateThumbnail(matchData, match._id)
    // }).promise();
    const s3Response = await s3.upload({
      Bucket: 'videos.visionsync.io',
      Key: `matches/${match._id}.mp4`,
      Body: passthroughStream
    }).promise();

    resolve({ s3Response }); // s3ThumbnailResponse
  } catch (err) {
    console.log(err);
    await Match.findByIdAndDelete(match._id);
    reject(err);
  }
});

// =================================================================================================
//                                           Delete Match
// =================================================================================================

exports.deleteMatch = (matchId) => new Promise(async (resolve, reject) => {
  await Match.findByIdAndDelete(matchId);

  try {
    // Deleting files from the bucket
    const s3Response = s3.deleteObject({
      Bucket: 'videos.visionsync.io',
      Key: `thumbnails/${matchId}.png`
    }).promise();
    const s3ThumbnailResponse = s3.deleteObject({
      Bucket: 'videos.visionsync.io',
      Key: `matches/${matchId}.mp4`
    }).promise();

    resolve({ s3ThumbnailResponse, s3Response });
  } catch (err) {
    reject(err);
  }
});
