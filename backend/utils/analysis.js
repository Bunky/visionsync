const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const AWS = require('aws-sdk');
const Analysis = require('../models/analysis.model');

// aws stuff
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});
AWS.config.update({
  region: 'us-east-2',
});

// =================================================================================================
//                                           Upload Analysis
// =================================================================================================

exports.uploadAnalysis = (matchId, ownerId, data, settings) => new Promise(async (resolve, reject) => {
  const newAnalysis = new Analysis({
    matchId,
    ownerId,
    settings,
  });
  const analysis = await newAnalysis.save();

  try {
    const s3Response = await s3.upload({
      Bucket: 'videos.visionsync.io',
      Key: `analyses/${analysis._id}.json`,
      Body: JSON.stringify(data),
      ContentType: 'application/json'
    }).promise();

    resolve(s3Response);
  } catch (err) {
    console.log(err);
    await Analysis.deleteOne({ _id: analysis._id });
    reject(err);
  }
});

// =================================================================================================
//                                           Delete Analysis
// =================================================================================================

exports.deleteAnalysis = (analysisId) => new Promise(async (resolve, reject) => {
  await Analysis.deleteOne({ analysisId });

  try {
    // Deleting files from the bucket
    const s3Response = s3.deleteObject({
      Bucket: 'videos.visionsync.io',
      Key: `analyses/${analysisId}.json`
    }).promise();

    resolve(s3Response);
  } catch (err) {
    reject(err);
  }
});
