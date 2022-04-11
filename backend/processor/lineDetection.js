// const cv = require('opencv4nodejs');
// const tf = require('@tensorflow/tfjs-node-gpu');
const { spawn } = require('child_process');
const { sendMessage, isConnected } = require('../utils/socket-io');
// const { morphShape } = require('./utils');
const Match = require('../models/match.model');
const { setJsonValue, getJsonValue, delJsonValue } = require('../utils/redis');

let activeAnalysis = []; // Change this so it uses redis instead of a variable!

exports.isActive = (room) => activeAnalysis.filter((analysis) => analysis.room === room.toString()).length > 0;
exports.getActive = (room) => activeAnalysis.filter((analysis) => analysis.room === room.toString())[0];

exports.startAnalysis = async (room, matchId) => {
  const match = await Match.findOne({ matchId });
  await setJsonValue(matchId, match.settings);

  const pythonProcess = spawn('python', ['./processor/python/main.py', matchId]);
  pythonProcess.stdout.on('data', (data) => {
    const messages = JSON.parse(data.toString());
    // console.log(room, message.type);

    messages.forEach((message) => {
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
  match.settings = await getJsonValue(matchId);
  await match.save();
  await delJsonValue(matchId);
};

// const initiateAnalysis = async (room, match) => {
//   const FPS = 30;

//   // const video = new cv.VideoCapture(0);
//   const video = new cv.VideoCapture(`http://d1pu8bxuwsqdvz.cloudfront.net/${match.matchId}.mp4`);
//   // const video = new cv.VideoCapture('../../../Data/videos/manutd.mp4');
//   // const video = new cv.VideoCapture('mancity.mp4');
//   video.set(cv.CAP_PROP_FRAME_WIDTH, 640);
//   video.set(cv.CAP_PROP_FRAME_HEIGHT, 360);

//   // Load tf model before analysis
//   const detectionModel = await tf.loadGraphModel('file://./processor/model/model.json');

//   let startTime = new Date().getTime() / 1000;
//   const timeThreshold = 1;
//   let frames = 0;
//   const intervalId = setInterval(async () => {
//     const settings = await getJsonValue(room);

//     let frame = video.read();
//     // Resize frame
//     frame = frame.resize(640, 640);

//     const liveFrame = cv.imencode('.jpg', frame).toString('base64');
//     sendMessage(room, 'live', liveFrame);

//     const detections = await detect(settings, frame, detectionModel);
//     sendMessage(room, 'detections', detections);

//     frames++;
//     if ((new Date().getTime() / 1000) - startTime > timeThreshold) {
//       console.log(`FPS: ${frames / ((new Date().getTime() / 1000) - startTime)}`);
//       frames = 0;
//       startTime = new Date().getTime() / 1000;
//     }

//     // const [crowdMask, crowdMaskFrame] = generateCrowdMask(room, settings, frame);
//     // const [playerMask, playerMaskFrame] = generatePlayerMask(room, settings, frame);
//     // const [canny, cannyFrame] = generateCanny(room, settings, frame, crowdMask, playerMask);
//     // const [lines, linesFrame] = generateLines(room, settings, frame, canny);

//     // if (settings.preview.enabled && isConnected(room)) {
//     //   switch (settings.preview.stage) {
//     //     case 'crowdMask':
//     //       sendMessage(room, 'preview', crowdMaskFrame);
//     //       break;
//     //     case 'playerMask':
//     //       sendMessage(room, 'preview', playerMaskFrame);
//     //       break;
//     //     case 'canny':
//     //       sendMessage(room, 'preview', cannyFrame);
//     //       break;
//     //     case 'lines':
//     //       sendMessage(room, 'preview', linesFrame);
//     //       break;
//     //     default:
//     //       break;
//     //   }
//     // }

//     // sendMessage(room, 'result', cv.imencode('.jpg', frame).toString('base64'));
//   }, 1000 / FPS);

//   return intervalId;
// };

// const detect = async (settings, frame, detectionModel) => {
//   // // Resize frame
//   // const tinyFrame = frame.resize(640, 640);
//   // Generate tensor
//   const tensor = tf.tensor3d(new Uint8Array(frame.cvtColor(cv.COLOR_BGR2RGB).getData()), [640, 640, 3], 'int32').div(255.0).expandDims(0);
//   // Apply
//   const predictions = await detectionModel.executeAsync(tensor);

//   const [boxes, scores, classes, validDetections] = predictions;
//   const boxesData = boxes.dataSync();
//   const scoresData = scores.dataSync();
//   const classesData = classes.dataSync();
//   const validDetectionsData = validDetections.dataSync()[0];

//   const detections = [];

//   for (let i = 0; i < validDetectionsData; i++) {
//     detections.push({
//       class: ['player', 'ball', 'goal'][classesData[i]],
//       score: scoresData[i].toFixed(2),
//       boundingBox: Array.from(boxesData.slice(i * 4, (i * 4) + 4)),
//     });
//   }

//   return detections;
// };

// const generateCrowdMask = (room, settings, frame) => {
//   const hsv = frame.cvtColor(cv.COLOR_BGR2HSV);
//   let crowdMask = hsv.inRange(new cv.Vec3(...settings.crowdMask.hsv.lower), new cv.Vec3(...settings.crowdMask.hsv.upper));

//   // Settings
//   const erosionSize = settings.crowdMask.erosion.size;
//   const erosionShape = settings.crowdMask.erosion.shape;
//   const dilationSize = settings.crowdMask.dilation.size;
//   const dilationShape = settings.crowdMask.dilation.shape;
//   const closingSize = settings.crowdMask.closing.size;
//   const closingShape = settings.crowdMask.closing.shape;
//   const openingSize = settings.crowdMask.opening.size;
//   const openingShape = settings.crowdMask.opening.shape;

//   // Erode mask
//   if (settings.crowdMask.erosion.enabled) {
//     const erosionElement = cv.getStructuringElement(
//       morphShape(erosionShape),
//       new cv.Size(2 * erosionSize + 1, 2 * erosionSize + 1),
//       new cv.Point2(erosionSize, erosionSize)
//     );
//     crowdMask = crowdMask.erode(erosionElement);
//   }

//   // Dilate mask
//   if (settings.crowdMask.dilation.enabled) {
//     const dilationElement = cv.getStructuringElement(
//       morphShape(dilationShape),
//       new cv.Size(2 * dilationSize + 1, 2 * dilationSize + 1),
//       new cv.Point2(dilationSize, dilationSize)
//     );
//     crowdMask = crowdMask.dilate(dilationElement);
//   }

//   // Closing
//   if (settings.crowdMask.closing.enabled) {
//     const closingElement = cv.getStructuringElement(
//       morphShape(closingShape),
//       new cv.Size(2 * closingSize + 1, 2 * closingSize + 1),
//       new cv.Point2(closingSize, closingSize)
//     );
//     crowdMask = crowdMask.morphologyEx(crowdMask, cv.MORPH_CLOSE, closingElement);
//   }

//   // Opening
//   if (settings.crowdMask.opening.enabled) {
//     const openingElement = cv.getStructuringElement(
//       morphShape(openingShape),
//       new cv.Size(2 * openingSize + 1, 2 * openingSize + 1),
//       new cv.Point2(openingSize, openingSize)
//     );
//     crowdMask = crowdMask.morphologyEx(crowdMask, cv.MORPH_OPEN, openingElement);
//   }

//   // Invert mask
//   if (settings.crowdMask.invert) crowdMask = crowdMask.bitwiseNot();

//   // Overlap
//   let preview;
//   if (settings.preview.enabled && settings.preview.stage === 'crowdMask' && isConnected(room)) {
//     if (settings.crowdMask.overlap) {
//       const frameChannels = frame.splitChannels();
//       const maskedChannels = frameChannels.map((c) => c.bitwiseAnd(crowdMask));
//       const maskedFrame = new cv.Mat(maskedChannels);
//       preview = cv.imencode('.jpg', maskedFrame).toString('base64');
//     } else {
//       preview = cv.imencode('.jpg', crowdMask).toString('base64');
//     }
//   } else {
//     preview = false;
//   }

//   return [crowdMask, preview];
// };

// const generatePlayerMask = (room, settings, frame) => {
//   const hsv = frame.cvtColor(cv.COLOR_BGR2HSV);
//   let playerMask = hsv.inRange(new cv.Vec3(...settings.playerMask.hsv.lower), new cv.Vec3(...settings.playerMask.hsv.upper));

//   // Settings
//   const erosionSize = settings.playerMask.erosion.size;
//   const erosionShape = settings.playerMask.erosion.shape;
//   const dilationSize = settings.playerMask.dilation.size;
//   const dilationShape = settings.playerMask.dilation.shape;
//   const closingSize = settings.playerMask.closing.size;
//   const closingShape = settings.playerMask.closing.shape;
//   const openingSize = settings.playerMask.opening.size;
//   const openingShape = settings.playerMask.opening.shape;

//   // Erode mask
//   if (settings.playerMask.erosion.enabled) {
//     const erosionElement = cv.getStructuringElement(
//       morphShape(erosionShape),
//       new cv.Size(2 * erosionSize + 1, 2 * erosionSize + 1),
//       new cv.Point2(erosionSize, erosionSize)
//     );
//     playerMask = playerMask.erode(erosionElement);
//   }

//   // Dilate mask
//   if (settings.playerMask.dilation.enabled) {
//     const dilationElement = cv.getStructuringElement(
//       morphShape(dilationShape),
//       new cv.Size(2 * dilationSize + 1, 2 * dilationSize + 1),
//       new cv.Point2(dilationSize, dilationSize)
//     );
//     playerMask = playerMask.dilate(dilationElement);
//   }

//   // Closing
//   if (settings.playerMask.closing.enabled) {
//     const closingElement = cv.getStructuringElement(
//       morphShape(closingShape),
//       new cv.Size(2 * closingSize + 1, 2 * closingSize + 1),
//       new cv.Point2(closingSize, closingSize)
//     );
//     playerMask = playerMask.morphologyEx(playerMask, cv.MORPH_CLOSE, closingElement);
//   }

//   // Opening
//   if (settings.playerMask.opening.enabled) {
//     const openingElement = cv.getStructuringElement(
//       morphShape(openingShape),
//       new cv.Size(2 * openingSize + 1, 2 * openingSize + 1),
//       new cv.Point2(openingSize, openingSize)
//     );
//     playerMask = playerMask.morphologyEx(playerMask, cv.MORPH_OPEN, openingElement);
//   }

//   // Invert mask
//   if (settings.playerMask.invert) playerMask = playerMask.bitwiseNot();

//   // Overlap
//   let preview;
//   if (settings.preview.enabled && settings.preview.stage === 'playerMask' && isConnected(room)) {
//     if (settings.playerMask.overlap) {
//       const frameChannels = frame.splitChannels();
//       const maskedChannels = frameChannels.map((c) => c.bitwiseAnd(playerMask));
//       const maskedFrame = new cv.Mat(maskedChannels);
//       preview = cv.imencode('.jpg', maskedFrame).toString('base64');
//     } else {
//       preview = cv.imencode('.jpg', playerMask).toString('base64');
//     }
//   } else {
//     preview = false;
//   }

//   return [playerMask, preview];
// };

// const generateCanny = (room, settings, frame, crowdMask, playerMask) => {
//   // Settings
//   let blurSize = settings.canny.blur.size;
//   const cannyThresholdOne = settings.canny.thresholdOne;
//   const cannyThresholdTwo = settings.canny.thresholdTwo;

//   const closingSize = settings.canny.closing.size;
//   const closingShape = settings.canny.closing.shape;
//   const openingSize = settings.canny.opening.size;
//   const openingShape = settings.canny.opening.shape;
//   const dilationSize = settings.canny.dilation.size;
//   const dilationShape = settings.canny.dilation.shape;
//   const erosionSize = settings.canny.erosion.size;
//   const erosionShape = settings.canny.erosion.shape;

//   // Blur frame
//   let blur = frame;
//   if (settings.canny.blur.enabled) {
//     if (blurSize % 2 === 0) {
//       blurSize += 1;
//     }
//     blur = frame.gaussianBlur(new cv.Size(blurSize, blurSize), 0);
//   }

//   // Turn grey
//   const grey = blur.cvtColor(cv.COLOR_BGR2GRAY);

//   // Apply canny
//   let canny = grey.canny(cannyThresholdOne, cannyThresholdTwo, 3);

//   // Add masks
//   let maskedCanny = canny.bitwiseAnd(crowdMask);
//   maskedCanny = maskedCanny.bitwiseAnd(playerMask);

//   // Closing
//   if (settings.canny.closing.enabled) {
//     const closingElement = cv.getStructuringElement(
//       morphShape(closingShape),
//       new cv.Size(2 * closingSize + 1, 2 * closingSize + 1),
//       new cv.Point2(closingSize, closingSize)
//     );
//     maskedCanny = maskedCanny.morphologyEx(maskedCanny, cv.MORPH_CLOSE, closingElement);
//     if (!settings.canny.masked) {
//       canny = canny.morphologyEx(canny, cv.MORPH_CLOSE, closingElement);
//     }
//   }

//   // Opening
//   if (settings.canny.opening.enabled) {
//     const openingElement = cv.getStructuringElement(
//       morphShape(openingShape),
//       new cv.Size(2 * openingSize + 1, 2 * openingSize + 1),
//       new cv.Point2(openingSize, openingSize)
//     );
//     maskedCanny = maskedCanny.morphologyEx(maskedCanny, cv.MORPH_OPEN, openingElement);
//     if (!settings.canny.masked) {
//       canny = canny.morphologyEx(canny, cv.MORPH_OPEN, openingElement);
//     }
//   }

//   // Erode
//   if (settings.canny.erosion.enabled) {
//     const erosionElement = cv.getStructuringElement(
//       morphShape(erosionShape),
//       new cv.Size(2 * erosionSize + 1, 2 * erosionSize + 1),
//       new cv.Point2(erosionSize, erosionSize)
//     );
//     maskedCanny = maskedCanny.erode(erosionElement);
//     if (!settings.canny.masked) {
//       canny = canny.erode(erosionElement);
//     }
//   }

//   // Dilate
//   if (settings.canny.dilation.enabled) {
//     const dilationElement = cv.getStructuringElement(
//       morphShape(dilationShape),
//       new cv.Size(2 * dilationSize + 1, 2 * dilationSize + 1),
//       new cv.Point2(dilationSize, dilationSize)
//     );
//     maskedCanny = maskedCanny.dilate(dilationElement);
//     if (!settings.canny.masked) {
//       canny = canny.dilate(dilationElement);
//     }
//   }

//   // Preview
//   let preview;
//   if (settings.preview.enabled && settings.preview.stage === 'canny' && isConnected(room)) {
//     if (settings.canny.overlap) {
//       const frameChannels = blur.splitChannels();
//       const invertedCanny = settings.canny.masked ? maskedCanny.bitwiseNot() : canny.bitwiseNot();
//       const maskedChannels = frameChannels.map((c) => c.bitwiseAnd(invertedCanny));
//       const maskedFrame = new cv.Mat(maskedChannels);
//       preview = cv.imencode('.jpg', maskedFrame).toString('base64');
//     } else {
//       preview = cv.imencode('.jpg', settings.canny.masked ? maskedCanny : canny).toString('base64');
//     }
//   } else {
//     preview = false;
//   }

//   return [maskedCanny, preview];
// };

// const generateLines = (room, settings, frame, canny) => {
//   const { threshold } = settings.lines;
//   const { minLineLength } = settings.lines;
//   const { maxLineGap } = settings.lines;
//   const { resolution } = settings.lines;
//   const { rho } = settings.lines;

//   const lines = canny.houghLinesP(rho, resolution * (Math.PI / 180), threshold, minLineLength, maxLineGap);

//   // console.log(lines[0]);

//   // Preview
//   let preview;
//   if (settings.preview.enabled && settings.preview.stage === 'lines' && isConnected(room)) {
//     const lineFrame = frame.copy();
//     for (let i = 0; i < lines.length; i++) {
//       const [x1, y1, x2, y2] = [lines[i].y, lines[i].x, lines[i].w, lines[i].z];
//       lineFrame.drawLine(new cv.Point2(x1, y1), new cv.Point2(x2, y2), new cv.Vec3(0, 255, 0), 3);
//     }

//     preview = cv.imencode('.jpg', lineFrame).toString('base64');
//   } else {
//     preview = false;
//   }

//   return [lines, preview];
// };
