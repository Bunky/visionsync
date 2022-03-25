const cv = require('opencv4nodejs');

const morphShape = (value) => {
  if(value === 0) {
    return cv.MORPH_RECT
  } else if (value === 1) {
    return cv.MORPH_CROSS
  } else {
    return cv.MORPH_ELLIPSE
  }
};

module.exports = { morphShape };