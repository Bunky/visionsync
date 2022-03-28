const router = require('express').Router();
const _ = require('lodash');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const User = require('../models/user.model');
const { startAnalysis, isActive, stopAnalysis } = require("../processor/lineDetection");
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const Match = require('../models/match.model');
const defaultSettings = require('../processor/defaultSettings.json');

// aws stuff
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET
});
AWS.config.update({
  region: "us-east-2"
});

// =================================================================================================
//                                           Upload Match
// =================================================================================================

router.route('/upload').post(async (req, res) => {
  if (req.isAuthenticated()) {
    const matchId = uuidv4();

    // Setting up S3 upload parameters
    const params = {
      Bucket: 'videos.visionsync.io',
      Key: `${matchId}.mp4`,
      Body: Buffer.from(req.files.match.data, 'binary')
    };

    // Uploading files to the bucket
    s3.upload(params, async (err, data) => {
      if (err) {
        throw err;
      }

      const newMatch = new Match({
        matchId,
        ownerId: req.user._id,
        title: req.body.title,
        thumbnail: 'https://images.indianexpress.com/2018/07/football-reuters-m.jpg',
        settings: defaultSettings
      });
  
      await newMatch.save();
      return res.status(200).send({
        "response_message": "Success",
        "response_data": data
      });
    });
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

// =================================================================================================
//                                           Get Matches
// =================================================================================================

router.route('/').get(async (req, res) => {
  if (req.isAuthenticated()) {
    const matches = await Match.find({ ownerId: req.user._id }, {
      ownerId: 0, settings: 0, __v: 0, _id: 0
    });
    return res.status(200).send(matches);
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

// =================================================================================================
//                                         Delete Matche
// =================================================================================================

router.route('/').delete(async (req, res) => {
  if (req.isAuthenticated()) {
    const matchId = req.body.matchId;
    await Match.deleteOne({ matchId });

    // Delete from s3
    const params = {
      Bucket: 'videos.visionsync.io',
      Key: `${matchId}.mp4`,
    };

    // Uploading files to the bucket
    s3.deleteObject(params, (err, data) => {
      if (err) {
        throw err;
      }
      return res.status(200).send({
        "response_message": "Success",
        "response_data": data
      });
    });
  } else {
    return res.status(200).send({ unauthorised: true });
  }
});

module.exports = router;
