import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Tabs, Image
} from '@mantine/core';
import Webcam from "react-webcam";
import Minimap from '../Minimap/Minimap';

const Livefeed = () => (
  <Container>
    <Webcam
      width="100%"
      videoConstraints={{
        width: 1280,
        height: 720,
        facingMode: "user"
      }}
    />
    <MinimapOverlay>
      <Minimap overlay />
    </MinimapOverlay>
  </Container>
);

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const MinimapOverlay = styled.div`
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 20%;
  opacity: 0.5;
`;

export default Livefeed;
