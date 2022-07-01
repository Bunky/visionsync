/* eslint-disable no-nested-ternary */
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Color from 'color';

const MinimapCanvas = ({ data }) => {
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
      const x = (detection.x / 100) * width;
      const y = (detection.y / 100) * height;

      if (detection.class === 0) {
        if (detection.team !== -1) {
          ctx.beginPath();
          ctx.arc(x, y, 9, 0, 2 * Math.PI, false);
          let color = Color.rgb(detection.colour);
          color = color.saturate(1.5);
          ctx.fillStyle = `rgb(${color.red()}, ${color.green()}, ${color.blue()})`;

          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 17;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();

          ctx.shadowColor = 0;
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          ctx.fill();
          ctx.stroke();
        }
      } else if (detection.class === 1) {
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000000';
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

export default MinimapCanvas;
