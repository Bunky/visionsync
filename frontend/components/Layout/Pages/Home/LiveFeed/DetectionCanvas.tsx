import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const DetectionCanvas = ({ data }) => {
  const ref = useRef();
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  useEffect(() => {
    if (ref.current && width !== 100 && height !== 100) {
      draw();
      console.log('Drawn!');
    }
  }, [data, width, height]);

  useEffect(() => {
    if (ref.current) {
      if (ref.current.offsetWidth > 0 && ref.current.offsetHeight > 0) {
        setWidth(ref.current.offsetWidth);
        setHeight(ref.current.offsetHeight);
        console.log('Updated size!');
      }
    }
  }, [ref.current]);

  const draw = () => {
    const ctx = ref.current.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Draw each bounding box
    for (let i = 0; i < data.length; i++) {
      const detection = data[i];
      const x = (detection.xmin / 100) * width;
      const y = (detection.ymin / 100) * height;
      const w = ((detection.xmax - detection.xmin) / 100) * width;
      const h = ((detection.ymax - detection.ymin) / 100) * height;

      ctx.fillStyle = '#ff00f27f';
      ctx.fillRect(x, y, w, h);
    }
  };

  return (<Canvas ref={ref} width={width} height={height} />);
};

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

export default DetectionCanvas;
