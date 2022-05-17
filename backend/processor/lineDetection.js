// const { spawn } = require('child_process');
const { sendMessage, isConnected } = require('../utils/socket-io');
const Match = require('../models/match.model');
const { setJsonValue, getJsonValue, delJsonValue } = require('../utils/redis');
const { uploadAnalysis } = require('../components/analysis');
const { uploadConfig } = require('../components/configs');
const { analysisLogger: logger } = require('../utils/logger');

let activeAnalysis = []; // Change this so it uses redis instead of a variable!

exports.getActive = (room) => activeAnalysis.find((analysis) => analysis.room === room.toString());

exports.startAnalysis = async (room, matchId) => {
  const match = await Match.findById(matchId);
  await setJsonValue(`${matchId}-settings`, match.config);
  await setJsonValue(`${matchId}-analysis`, []);

  logger.log({
    level: 'info',
    message: 'Starting analysis',
    metadata: {
      userId: room,
      matchId: matchId.toString()
    }
  });
  /*
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
        logger.log({
          level: 'debug',
          message: message.data
        });
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
    logger.log({
      level: 'debug',
      message: data.toString()
    });
  });
  pythonProcess.on('exit', async (code) => {
    logger.log({
      level: 'info',
      message: `Process exited with code ${code}`,
      metadata: {
        matchId: matchId.toString()
      }
    });

    activeAnalysis = activeAnalysis.filter((analysis) => analysis.matchId !== matchId.toString());
    match.settings = await getJsonValue(`${matchId}-settings`);
    const analysis = await getJsonValue(`${matchId}-analysis`);
    await uploadAnalysis(matchId, match.ownerId, analysis, match.settings);
    await match.save();
    await delJsonValue(`${matchId}-settings`);
    await delJsonValue(`${matchId}-analysis`);

    // Send false to update the UI
    sendMessage(room, 'live', false);
  });

  activeAnalysis.push({
    room,
    matchId,
    pid: pythonProcess.pid,
  });
  */
};

exports.stopAnalysis = async (matchId) => {
  logger.log({
    level: 'info',
    message: 'Stopping analysis',
    metadata: {
      matchId: matchId.toString()
    }
  });

  try {
    process.kill(activeAnalysis.filter((analysis) => analysis.matchId === matchId.toString())[0].pid);
  } catch (err) {
    logger.warn(`Failed to kill process for ${matchId}`, {
      matchId
    });
  }
};
