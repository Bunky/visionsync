const cv = require('opencv4nodejs');
const { sendMessage, isConnected } = require('../utils/socket-io');
const { morphShape } = require('./utils');
const User = require('../models/user.model');
const { setJsonValue, getJsonValue, delJsonValue } = require('../utils/redis');

let activeAnalysis = []; // Change this so it uses redis instead of a variable!

exports.isActive = (room) => activeAnalysis.filter(analysis => analysis.room === room.toString()).length > 0;

exports.startAnalysis = async (room) => {
  const user = await User.findById(room);
  await setJsonValue(room, user.settings);

  const intervalId = initiateAnalysis(room.toString());
  activeAnalysis.push({
    room: room.toString(),
    intervalId
  });
};

exports.stopAnalysis = async (room) => {
  const analysis = activeAnalysis.filter(analysis => analysis.room === room.toString())[0];
  clearInterval(analysis.intervalId);
  activeAnalysis = activeAnalysis.filter(analysis => analysis.room !== room.toString());

  let user = await User.findById(room);   
  user.settings = await getJsonValue(room);
  await user.save();
  await delJsonValue(room);
};

const initiateAnalysis = (room) => {
  const FPS = 15;

  const video = new cv.VideoCapture(0);
  video.set(cv.CAP_PROP_FRAME_WIDTH, 640);
  video.set(cv.CAP_PROP_FRAME_HEIGHT, 360);
  
  const intervalId = setInterval(async () => {
    const settings = await getJsonValue(room);

    const frame = video.read();
    const [crowdMask, crowdMaskFrame] = generateCrowdMask(room, settings, frame);
    const [playerMask, playerMaskFrame] = generatePlayerMask(room, settings, frame);
    const [canny, cannyFrame] = generateCanny(room, settings, frame, crowdMask, playerMask);
    const [lines, linesFrame] = generateLines(room, settings, frame, canny);

    if (settings.preview.enabled && isConnected(room)) {
      switch (settings.preview.stage) {
        case 'crowdMask':
          sendMessage(room, 'preview', crowdMaskFrame);
          break;
        case 'playerMask':
          sendMessage(room, 'preview', playerMaskFrame);
          break;
        case 'canny':
          sendMessage(room, 'preview', cannyFrame);
          break;
        case 'lines':
          sendMessage(room, 'preview', linesFrame);
          break;
        default:
          break;
      }
    }

    sendMessage(room, 'result', cv.imencode('.jpg', frame).toString('base64'));
  }, 1000 / FPS);

  return intervalId;
};

const generateCrowdMask = (room, settings, frame) => {
  const hsv = frame.cvtColor(cv.COLOR_BGR2HSV);
  let crowdMask = hsv.inRange(new cv.Vec3(...settings.crowdMask.hsv.lower), new cv.Vec3(...settings.crowdMask.hsv.upper));

  // Settings
  const erosionSize = settings.crowdMask.erosion.size;
  const erosionShape = settings.crowdMask.erosion.shape;
  const dilationSize = settings.crowdMask.dilation.size;
  const dilationShape = settings.crowdMask.dilation.shape;
  const closingSize = settings.crowdMask.closing.size;
  const closingShape = settings.crowdMask.closing.shape;
  const openingSize = settings.crowdMask.opening.size;
  const openingShape = settings.crowdMask.opening.shape;

  // Erode mask
  if (settings.crowdMask.erosion.enabled) {
    const erosionElement = cv.getStructuringElement(morphShape(erosionShape), new cv.Size(2 * erosionSize + 1, 2 * erosionSize + 1), new cv.Point2(erosionSize, erosionSize));
    crowdMask = crowdMask.erode(erosionElement);
  }

  // Dilate mask
  if (settings.crowdMask.dilation.enabled) {
    const dilationElement = cv.getStructuringElement(morphShape(dilationShape), new cv.Size(2 * dilationSize + 1, 2 * dilationSize + 1), new cv.Point2(dilationSize, dilationSize));
    crowdMask = crowdMask.dilate(dilationElement);
  }

  // Closing
  if (settings.crowdMask.closing.enabled) {
    const closingElement = cv.getStructuringElement(morphShape(closingShape), new cv.Size(2 * closingSize + 1, 2 * closingSize + 1), new cv.Point2(closingSize, closingSize));
    crowdMask = crowdMask.morphologyEx(crowdMask, cv.MORPH_CLOSE, closingElement);
  }

  // Opening
  if (settings.crowdMask.opening.enabled) {
    const openingElement = cv.getStructuringElement(morphShape(openingShape), new cv.Size(2 * openingSize + 1, 2 * openingSize + 1), new cv.Point2(openingSize, openingSize));
    crowdMask = crowdMask.morphologyEx(crowdMask, cv.MORPH_OPEN, openingElement);
  }
  
  // Invert mask
  if (settings.crowdMask.invert) crowdMask = crowdMask.bitwiseNot();

  // Overlap
  let preview;
  if (settings.preview.enabled && settings.preview.stage === 'crowdMask' && isConnected(room)) {
    if (settings.crowdMask.overlap) {
      const frameChannels = frame.splitChannels();
      const maskedChannels = frameChannels.map(c => c.bitwiseAnd(crowdMask));
      const maskedFrame = new cv.Mat(maskedChannels);
      preview = cv.imencode('.jpg', maskedFrame).toString('base64')
    } else {
      preview = cv.imencode('.jpg', crowdMask).toString('base64')
    }
  } else {
    preview = false;
  }

  return [crowdMask, preview];
};

const generatePlayerMask = (room, settings, frame) => {
  const hsv = frame.cvtColor(cv.COLOR_BGR2HSV);
  let playerMask = hsv.inRange(new cv.Vec3(...settings.playerMask.hsv.lower), new cv.Vec3(...settings.playerMask.hsv.upper));

  // Settings
  const erosionSize = settings.playerMask.erosion.size;
  const erosionShape = settings.playerMask.erosion.shape;
  const dilationSize = settings.playerMask.dilation.size;
  const dilationShape = settings.playerMask.dilation.shape;
  const closingSize = settings.playerMask.closing.size;
  const closingShape = settings.playerMask.closing.shape;
  const openingSize = settings.playerMask.opening.size;
  const openingShape = settings.playerMask.opening.shape;

  // Erode mask
  if (settings.playerMask.erosion.enabled) {
    const erosionElement = cv.getStructuringElement(morphShape(erosionShape), new cv.Size(2 * erosionSize + 1, 2 * erosionSize + 1), new cv.Point2(erosionSize, erosionSize));
    playerMask = playerMask.erode(erosionElement);
  }

  // Dilate mask
  if (settings.playerMask.dilation.enabled) {
    const dilationElement = cv.getStructuringElement(morphShape(dilationShape), new cv.Size(2 * dilationSize + 1, 2 * dilationSize + 1), new cv.Point2(dilationSize, dilationSize));
    playerMask = playerMask.dilate(dilationElement);
  }

  // Closing
  if (settings.playerMask.closing.enabled) {
    const closingElement = cv.getStructuringElement(morphShape(closingShape), new cv.Size(2 * closingSize + 1, 2 * closingSize + 1), new cv.Point2(closingSize, closingSize));
    playerMask = playerMask.morphologyEx(playerMask, cv.MORPH_CLOSE, closingElement);
  }

  // Opening
  if (settings.playerMask.opening.enabled) {
    const openingElement = cv.getStructuringElement(morphShape(openingShape), new cv.Size(2 * openingSize + 1, 2 * openingSize + 1), new cv.Point2(openingSize, openingSize));
    playerMask = playerMask.morphologyEx(playerMask, cv.MORPH_OPEN, openingElement);
  }
  
  // Invert mask
  if (settings.playerMask.invert) playerMask = playerMask.bitwiseNot();

  // Overlap
  let preview;
  if (settings.preview.enabled && settings.preview.stage === 'playerMask' && isConnected(room)) {
    if (settings.playerMask.overlap) {
      const frameChannels = frame.splitChannels();
      const maskedChannels = frameChannels.map(c => c.bitwiseAnd(playerMask));
      const maskedFrame = new cv.Mat(maskedChannels);
      preview = cv.imencode('.jpg', maskedFrame).toString('base64')
    } else {
      preview = cv.imencode('.jpg', playerMask).toString('base64')
    }
  } else {
    preview = false;
  }

  return [playerMask, preview];
};

const generateCanny = (room, settings, frame, crowdMask, playerMask) => {
  // Settings
  let blurSize = settings.canny.blur.size;
  const cannyThresholdOne = settings.canny.thresholdOne;
  const cannyThresholdTwo = settings.canny.thresholdTwo;

  const closingSize = settings.canny.closing.size;
  const closingShape = settings.canny.closing.shape;
  const openingSize = settings.canny.opening.size;
  const openingShape = settings.canny.opening.shape;
  const dilationSize = settings.canny.dilation.size;
  const dilationShape = settings.canny.dilation.shape;
  const erosionSize = settings.canny.erosion.size;
  const erosionShape = settings.canny.erosion.shape;
  
  // Blur frame
  let blur = frame;
  if (settings.canny.blur.enabled) {
    if (blurSize % 2 == 0) {
      blurSize += 1;
    }  
    blur = frame.gaussianBlur(new cv.Size(blurSize, blurSize), 0);
  }

  // Turn grey
  const grey = blur.cvtColor(cv.COLOR_BGR2GRAY);

  // Apply canny 
  let canny = grey.canny(cannyThresholdOne, cannyThresholdTwo, 3);

  // Add masks
  let maskedCanny = canny.bitwiseAnd(crowdMask);
  maskedCanny = maskedCanny.bitwiseAnd(playerMask);

  // Closing
  if (settings.canny.closing.enabled) {
    const closingElement = cv.getStructuringElement(morphShape(closingShape), new cv.Size(2 * closingSize + 1, 2 * closingSize + 1), new cv.Point2(closingSize, closingSize));
    maskedCanny = maskedCanny.morphologyEx(maskedCanny, cv.MORPH_CLOSE, closingElement);
    if (!settings.canny.masked) {
      canny = canny.morphologyEx(canny, cv.MORPH_CLOSE, closingElement);
    }
  }

  // Opening
  if (settings.canny.opening.enabled) {
    const openingElement = cv.getStructuringElement(morphShape(openingShape), new cv.Size(2 * openingSize + 1, 2 * openingSize + 1), new cv.Point2(openingSize, openingSize));
    maskedCanny = maskedCanny.morphologyEx(maskedCanny, cv.MORPH_OPEN, openingElement);
    if (!settings.canny.masked) {
      canny = canny.morphologyEx(canny, cv.MORPH_OPEN, openingElement);
    }
  }

  // Erode
  if (settings.canny.erosion.enabled) {
    const erosionElement = cv.getStructuringElement(morphShape(erosionShape), new cv.Size(2 * erosionSize + 1, 2 * erosionSize + 1), new cv.Point2(erosionSize, erosionSize));
    maskedCanny = maskedCanny.erode(erosionElement);
    if (!settings.canny.masked) {
      canny = canny.erode(erosionElement);
    }
  }

  // Dilate
  if (settings.canny.dilation.enabled) {
    const dilationElement = cv.getStructuringElement(morphShape(dilationShape), new cv.Size(2 * dilationSize + 1, 2 * dilationSize + 1), new cv.Point2(dilationSize, dilationSize));
    maskedCanny = maskedCanny.dilate(dilationElement);
    if (!settings.canny.masked) {
      canny = canny.dilate(dilationElement);
    }
  }

  // Preview
  let preview;
  if (settings.preview.enabled && settings.preview.stage === 'canny' && isConnected(room)) {
    if (settings.canny.overlap) {
      const frameChannels = blur.splitChannels();
      const invertedCanny = settings.canny.masked ? maskedCanny.bitwiseNot() : canny.bitwiseNot();
      const maskedChannels = frameChannels.map(c => c.bitwiseAnd(invertedCanny));
      const maskedFrame = new cv.Mat(maskedChannels);
      preview = cv.imencode('.jpg', maskedFrame).toString('base64');
    } else {
      preview = cv.imencode('.jpg', settings.canny.masked ? maskedCanny : canny).toString('base64');
    }
  } else {
    preview = false;
  }

  return [maskedCanny, preview];
};

const generateLines = (room, settings, frame, canny) => {
  const threshold = settings.lines.threshold;
  const minLineLength = settings.lines.minLineLength;
  const maxLineGap = settings.lines.maxLineGap;
  const resolution = settings.lines.resolution;
  const rho = settings.lines.rho;

  const lines = canny.houghLinesP(rho, resolution * Math.PI / 180, threshold, minLineLength, maxLineGap);

  // console.log(lines[0]);

  // Preview
  let preview;
  if (settings.preview.enabled && settings.preview.stage === 'lines' && isConnected(room)) {
    const lineFrame = frame.copy();
    for (let i = 0; i < lines.length; i++) {
      const [x1, y1, x2, y2] = [lines[i].y, lines[i].x, lines[i].w, lines[i].z];
      lineFrame.drawLine(new cv.Point2(x1, y1), new cv.Point2(x2, y2), new cv.Vec3(0, 255, 0), 3);
    }

    preview = cv.imencode('.jpg', lineFrame).toString('base64');
  } else {
    preview = false;
  }

  return [lines, preview];
};
