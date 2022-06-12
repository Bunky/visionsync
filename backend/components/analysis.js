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
    await s3.upload({
      Bucket: process.env.AWS_BUCKET,
      Key: `analyses/${analysis._id}.json`,
      Body: JSON.stringify(data.filter((d) => d.length > 0)),
      ContentType: 'application/json'
    }).promise();

    resolve();
  } catch (err) {
    await Analysis.deleteOne({ _id: analysis._id });
    reject(err);
  }
});

// =================================================================================================
//                                           Delete Analysis
// =================================================================================================

exports.deleteAnalysis = (analysisId) => new Promise(async (resolve, reject) => {
  await Analysis.findByIdAndDelete(analysisId);

  try {
    // Deleting files from the bucket
    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET,
      Key: `analyses/${analysisId}.json`
    }).promise();

    resolve();
  } catch (err) {
    reject(err);
  }
});

exports.deleteAnalyses = (analysisIds) => new Promise(async (resolve, reject) => {
  await Analysis.deleteMany({
    _id: {
      $in: analysisIds
    }
  });

  try {
    // Deleting files from the bucket
    await s3.deleteObjects({
      Bucket: process.env.AWS_BUCKET,
      Delete: {
        Objects: analysisIds.map((analysisId) => ({ Key: `analyses/${analysisId}.json` })),
        Quiet: false
      }
    }).promise();

    resolve();
  } catch (err) {
    reject(err);
  }
});
