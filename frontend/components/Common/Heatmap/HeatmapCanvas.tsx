import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Heatmap = ({
  radius, blur, data, maxOccurances
}) => {
  const ref = useRef();
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);

  let circleCanvas = null;
  let gradientCanvas = null;
  let gradient = null;
  let circleCanvasRadius = 1;
  const defaultGradient = {
    0.4: 'blue',
    0.6: 'cyan',
    0.7: 'lime',
    0.8: 'yellow',
    1.0: 'red'
  };

  useEffect(() => {
    if (ref.current && width !== 1 && height !== 1) {
      draw();
    }
  }, [data, width, height]);

  useEffect(() => {
    if (ref.current) {
      if (ref.current.offsetWidth > 0 && ref.current.offsetHeight > 0) {
        setWidth(ref.current.offsetWidth);
        setHeight(ref.current.offsetHeight);
      }
    }
  }, [ref.current?.offsetWidth, ref.current?.offsetHeight]);

  const draw = () => {
    const opacity = 0.05;

    if (!circleCanvas) {
      createCircleBrushCanvas(radius);
    }
    if (!gradientCanvas) {
      createGradientCanvas(defaultGradient);
    }

    const ctx = ref.current.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // draw a grayscale heatmap by putting a blurred circle at each data point
    for (let i = 0, len = data.length, p; i < len; i++) {
      p = data[i];
      ctx.globalAlpha = Math.min(Math.max(p[2] / maxOccurances, opacity), 1);
      ctx.drawImage(circleCanvas, (width * (p[0] / 100)) - circleCanvasRadius, (height * (p[1] / 100)) - circleCanvasRadius);
    }

    // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
    const colored = ctx.getImageData(0, 0, width, height);
    colorize(colored.data, gradient);
    ctx.putImageData(colored, 0, 0);
  };

  const colorize = (pixels, localGradient) => {
    for (let i = 0, len = pixels.length, j; i < len; i += 4) {
      j = pixels[i + 3] * 4; // get gradient color from opacity value

      if (j) {
        pixels[i] = localGradient[j];
        pixels[i + 1] = localGradient[j + 1];
        pixels[i + 2] = localGradient[j + 2];
      }
    }
  };

  const createCircleBrushCanvas = (r) => {
    circleCanvas = createCanvas();
    const circleCanvasContext = circleCanvas.getContext('2d');

    const b = blur;
    const r2 = r + b;

    circleCanvasRadius = r2;
    circleCanvas.width = r2 * 2;
    circleCanvas.height = r2 * 2;

    circleCanvasContext.shadowOffsetX = r2 * 2;
    circleCanvasContext.shadowOffsetY = r2 * 2;
    circleCanvasContext.shadowBlur = b;
    circleCanvasContext.shadowColor = 'black';

    circleCanvasContext.beginPath();
    circleCanvasContext.arc(-r2, -r2, r, 0, Math.PI * 2, true);
    circleCanvasContext.closePath();
    circleCanvasContext.fill();
  };

  const createGradientCanvas = (grad) => {
    gradientCanvas = createCanvas();
    /* eslint-disable prefer-const */
    let ctx = gradientCanvas.getContext('2d');
    let localGradient = ctx.createLinearGradient(0, 0, 0, 256);
    /* eslint-enable prefer-const */

    gradientCanvas.width = 1;
    gradientCanvas.height = 256;

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const i in grad) {
      localGradient.addColorStop(+i, grad[i]);
    }

    ctx.fillStyle = localGradient;
    ctx.fillRect(0, 0, 1, 256);

    gradient = ctx.getImageData(0, 0, 1, 256).data;
  };

  const createCanvas = () => {
    const c = document.createElement('canvas');
    return c;
  };

  return (<Canvas ref={ref} width={width} height={height} />);
};

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

export default Heatmap;
