const { spawn } = require('child_process');
const { sendMessage, isConnected } = require('../utils/socket-io');
const Match = require('../models/match.model');
const { setJsonValue, getJsonValue, delJsonValue } = require('../utils/redis');
const { uploadAnalysis } = require('../components/analysis');
const { uploadConfig } = require('../components/configs');
const { analysisLogger: log } = require('../utils/logger');

let activeAnalysis = []; // Change this so it uses redis instead of a variable!

exports.getActive = (room) => activeAnalysis.find((analysis) => analysis.room === room.toString());

exports.startAnalysis = async (room, matchId) => {
  const match = await Match.findById(matchId);
  await setJsonValue(`${matchId}-settings`, match.config);
  await setJsonValue(`${matchId}-analysis`, []);

  log.info(`Starting analysis for match ${matchId}`, {
    userId: room,
    matchId
  });
  const pythonProcess = spawn('python', ['./processor/python/main.py', matchId]);
  pythonProcess.stdout.on('data', (data) => {
    const messages = JSON.parse(data.toString());

    messages.forEach(async (message) => {
      if (message.type === 'preview') {
        sendMessage(room, 'preview', message.data);
      }
      if (message.type === 'live') {
        sendMessage(room, 'live', message.data);
      }
      if (message.type === 'info') {
        log.info(message.data);
      }
      if (message.type === 'detections') {
        const detections = JSON.parse(`[${message.data}]`);
        // {
        //   xmin: 51.88,
        //   ymin: 98.45,
        //   xmax: 62.52,
        //   ymax: 24.25,
        //   confidence: 0.7156005502,
        //   class: 0,
        //   name: 'player',
        //   colour: [ 0, 0, 255 ]
        // },
        sendMessage(room, 'detections', detections);
      }
      if (message.type === 'positions') {
        const positions = JSON.parse(message.data);
        const corners = JSON.parse(message.corners);
        // {
        //   class
        //   colour
        //   x
        //   y
        // }

        // {
        //   x
        //   y
        // }
        sendMessage(room, 'positions', { positions, corners });

        const currentAnalysis = await getJsonValue(`${matchId}-analysis`);
        await setJsonValue(`${matchId}-analysis`, [...currentAnalysis, positions]);
      }
    });
  });
  pythonProcess.stderr.on('data', (data) => {
    log.info(data.toString());
  });
  pythonProcess.on('exit', (code) => {
    log.info(`Process exited with code ${code}`, {
      matchId
    });
    exports.stopAnalysis(matchId);
  });

  activeAnalysis.push({
    room,
    matchId,
    pid: pythonProcess.pid,
  });
};

exports.stopAnalysis = async (matchId) => {
  log.info(`Stopping analysis for match ${matchId}`, {
    matchId
  });

  try {
    process.kill(activeAnalysis.filter((analysis) => analysis.matchId === matchId.toString())[0].pid);
  } catch (err) {
    log.warn(`Failed to kill process for ${matchId}`, {
      matchId
    });
  }
  activeAnalysis = activeAnalysis.filter((analysis) => analysis.matchId !== matchId.toString());

  const match = await Match.findOne({ matchId });
  match.settings = await getJsonValue(`${matchId}-settings`);
  const analysis = await getJsonValue(`${matchId}-analysis`);
  await uploadAnalysis(matchId, match.ownerId, analysis, match.settings);
  await match.save();
  await delJsonValue(`${matchId}-settings`);
  await delJsonValue(`${matchId}-analysis`);
};
