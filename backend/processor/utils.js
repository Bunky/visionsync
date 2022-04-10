const cv = require('opencv4nodejs');

const morphShape = (value) => {
  if (value === 0) {
    return cv.MORPH_RECT;
  } if (value === 1) {
    return cv.MORPH_CROSS;
  }
  return cv.MORPH_ELLIPSE;
};

module.exports = { morphShape };
