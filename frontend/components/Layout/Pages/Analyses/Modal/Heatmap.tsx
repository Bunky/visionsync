import { useRef } from 'react';
import styled from 'styled-components';
import {
  Image
} from '@mantine/core';
import Canvas from './HeatmapCanvas';

const Heatmap = ({ data }) => {
  const ref = useRef();

  return (
    <Container>
      <Image
        radius="md"
        src="/images/pitch.svg"
        alt="Football pitch"
      />
      <StyledHeatmap>
        <Canvas
          ref={ref}
          data={data}
          width={900}
          height={400}
          maxOccurances={100}
          blur={25}
          radius={10}
        />
      </StyledHeatmap>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  min-height: 200px;
  min-width: 200px;
  position: relative;
`;

const StyledHeatmap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
`;

export default Heatmap;
