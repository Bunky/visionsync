/* eslint-disable no-nested-ternary */
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Color from 'color';

const DetectionCanvas = ({ data }) => {
  const ref = useRef();
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  useEffect(() => {
    if (ref.current && width !== 100 && height !== 100) {
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
  }, [ref.current]);

  const draw = () => {
    const ctx = ref.current.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Draw each bounding box
    for (let i = 0; i < data.length; i++) {
      const detection = data[i];
      const w = (((detection.xmax - detection.xmin) / 100) * width) * 1.3;
      const h = (((detection.ymax - detection.ymin) / 100) * height) * 1.3;
      const tw = (((detection.xmax - detection.xmin) / 100) * width) - w;
      const th = (((detection.ymax - detection.ymin) / 100) * height) - h;
      const x = ((detection.xmin / 100) * width) + (tw / 2);
      const y = ((detection.ymin / 100) * height) + (th / 2);

      if (detection.name === 'player') {
        if (detection.team !== -1) {
          let color = Color.rgb(detection.colour);
          color = color.saturate(1.5);

          ctx.fillStyle = `rgba(${color.red()}, ${color.green()}, ${color.blue()}, 0.3)`;
          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(${color.red()}, ${color.green()}, ${color.blue()}, 1)`;
          ctx.strokeRect(x, y, w, h);
          ctx.fillRect(x, y, w, h);
        }
      } else if (detection.name === 'ball') {
        ctx.beginPath();
        ctx.arc(x + 5, y + 5, 5, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#ffffff7f';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
    }
  };

  return (<Canvas ref={ref} width={width} height={height} />);
};

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

export default DetectionCanvas;
