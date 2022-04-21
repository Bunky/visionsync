import { useEffect } from 'react';
import styled from 'styled-components';
import Minimap from '../Minimap/Minimap';
import useLiveSocket from '../../../../../hooks/useLiveSocket';
// import useDetectionSocket from '../../../../../hooks/useDetectionSocket';

const Livefeed = () => {
  const live = useLiveSocket();
  // const { detections } = useDetectionSocket();

  useEffect(() => {
    document.getElementById('live').setAttribute('src', `data:image/jpeg;base64,${live}`);
  }, [live]);

  return (
    <Container>
      <Live id="live" width="640" height="360" />
      {/* <DetectionsOverlay>
        {detections.map((detection) => (
          <DetectionBox
            id={`${detection.name}+${detection.score}`}
            klass={detection.name}
            score={detection.confidence}
            position={[
              detection.xmin / 640,
              detection.ymin / 360,
              detection.xmax / 640,
              detection.ymax / 360
            ]}
          />
        ))}
      </DetectionsOverlay> */}
      <MinimapOverlay>
        <Minimap overlay />
      </MinimapOverlay>
    </Container>
  );
};

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

const Live = styled.img`
  border-radius: .25rem;
  width: 100%;
  height: 100%;
`;

// const DetectionsOverlay = styled.div`
//   position: absolute;
//   width: 100%;
//   height: 100%;
//   top: 0;
//   left: 0;
// `;

// const DetectionBox = styled.div`
//   position: absolute;
//   border-radius: 5px;
//   width: ${({ position }) => (position[2] - position[0]) * 100}%;
//   height: ${({ position }) => (position[3] - position[1]) * 100}%;
//   opacity: ${({ score }) => score};
//   border: solid 2px ${({ klass }) => (klass === 'player' ? 'red' : klass === 'ball' ? 'white' : 'green')};
//   left: ${({ position }) => position[0] * 100}%;
//   top: ${({ position }) => position[1] * 100}%;
// `;

export default Livefeed;
