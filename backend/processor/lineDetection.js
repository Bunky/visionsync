// const cv = require('opencv4nodejs');
// const tf = require('@tensorflow/tfjs-node-gpu');
const { spawn } = require('child_process');
const { sendMessage, isConnected } = require('../utils/socket-io');
// const { morphShape } = require('./utils');
const Match = require('../models/match.model');
const { setJsonValue, getJsonValue, delJsonValue } = require('../utils/redis');
const { uploadAnalysis } = require('../utils/analysis');

let activeAnalysis = []; // Change this so it uses redis instead of a variable!

exports.isActive = (room) => activeAnalysis.filter((analysis) => analysis.room === room.toString()).length > 0;
exports.getActive = (room) => activeAnalysis.filter((analysis) => analysis.room === room.toString())[0];

exports.startAnalysis = async (room, matchId) => {
  const match = await Match.findOne({ matchId });
  await setJsonValue(`${matchId}-settings`, match.settings);
  await setJsonValue(`${matchId}-analysis`, []);

  const pythonProcess = spawn('python', ['./processor/python/main.py', matchId]);
  pythonProcess.stdout.on('data', (data) => {
    const messages = JSON.parse(data.toString());
    // console.log(room, message.type);

    messages.forEach(async (message) => {
      if (message.type === 'preview') {
        sendMessage(room, 'preview', message.data);
      }
      if (message.type === 'live') {
        sendMessage(room, 'live', message.data);
      }
      if (message.type === 'info') {
        console.log(message.data);
      }
      if (message.type === 'detections') {
        const detections = JSON.parse(`[${message.data}]`);
        // {
        //   xmin: 51.7733421326,
        //   ymin: 117.6339874268,
        //   xmax: 62.0035743713,
        //   ymax: 138.821395874,
        //   confidence: 0.7156005502,
        //   class: 0,
        //   name: 'player',
        //   colour: [ 0, 0, 255 ]
        // },
        sendMessage(room, 'detections', detections);
      }
      if (message.type === 'positions') {
        const positions = JSON.parse(message.data);
        // {
        //   class
        //   colour
        //   x
        //   y
        // }
        sendMessage(room, 'positions', positions);

        const currentAnalysis = await getJsonValue(`${matchId}-analysis`);
        await setJsonValue(`${matchId}-analysis`, [...currentAnalysis, positions]);
      }
    });
  });
  pythonProcess.stderr.on('data', (data) => {
    console.log(data.toString());
    // exports.stopAnalysis(matchId);
  });
  pythonProcess.on('exit', (code) => {
    console.log(`Process exited with code ${code}`);
    exports.stopAnalysis(matchId);
  });

  // const intervalId = initiateAnalysis(matchId.toString(), match);
  activeAnalysis.push({
    room,
    matchId,
    pid: pythonProcess.pid,
  });
};

exports.stopAnalysis = async (matchId) => {
  // clearInterval(activeAnalysis.filter((analysis) => analysis.matchId === matchId.toString())[0].intervalId);
  process.kill(activeAnalysis.filter((analysis) => analysis.matchId === matchId.toString())[0].pid);
  activeAnalysis = activeAnalysis.filter((analysis) => analysis.matchId !== matchId.toString());

  const match = await Match.findOne({ matchId });
  match.settings = await getJsonValue(`${matchId}-settings`);
  const analysis = await getJsonValue(`${matchId}-analysis`);
  await uploadAnalysis(matchId, match.ownerId, analysis, match.settings);
  await match.save();
  await delJsonValue(`${matchId}-settings`);
  await delJsonValue(`${matchId}-analysis`);
};
