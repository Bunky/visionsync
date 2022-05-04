import { useEffect } from 'react';
import styled from 'styled-components';
import { AspectRatio } from '@mantine/core';
import useLiveSocket from '../../../../../hooks/useLiveSocket';
import DetectionCanvas from './DetectionCanvas';
import useDetectionSocket from '../../../../../hooks/useDetectionSocket';

const Livefeed = ({ showDetections }) => {
  const live = useLiveSocket();
  const { detections } = useDetectionSocket();

  useEffect(() => {
    document.getElementById('live').setAttribute('src', `data:image/jpeg;base64,${live}`);
  }, [live]);

  return (
    <Container>
      <AspectRatio ratio={16 / 9}>
        <Live id="live" width="640" height="360" />
        {showDetections && (
          <DetectionsOverlay>
            <DetectionCanvas
              data={detections}
            />
          </DetectionsOverlay>
        )}
      </AspectRatio>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Live = styled.img`
  border-radius: 8px;
  width: 100%;
  height: 100%;
`;

const DetectionsOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  border-radius: 8px;
`;

export default Livefeed;
