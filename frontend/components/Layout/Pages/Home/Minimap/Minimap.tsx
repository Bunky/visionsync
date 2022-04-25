import styled from 'styled-components';
import {
  Image
} from '@mantine/core';
import Player from './Player';
// import Ball from './Ball';
import useDetectionSocket from '../../../../../hooks/useDetectionSocket';
import HeatmapCanvas from '../../Analyses/Modal/HeatmapCanvas';

interface MinimapProps {
  overlay?: boolean;
}

const Minimap = ({ overlay }: MinimapProps) => {
  const { positions, corners } = useDetectionSocket();

  return (
    <Container overlay={overlay}>
      <Image
        radius="md"
        src="/images/pitch.svg"
        alt="Football pitch"
      />
      <OverlayContainer>
        <HeatmapCanvas
          data={positions.map((d) => ([d.x, d.y, 1]))}
          maxOccurances={1}
          blur={overlay ? 5 : 25}
          radius={overlay ? 2 : 10}
        />
      </OverlayContainer>
      <OverlayContainer>
        {positions.map((player, index) => (
          <Player
            id={`playerIcon-${index}`}
            playerId={index}
            player={player}
          />
        ))}
        {/* <Ball position={tempBall} /> */}
      </OverlayContainer>
      <OverlayContainer>
        <FieldOfView corners={corners} />
      </OverlayContainer>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  pointer-events: ${({ overlay }) => overlay && 'none'};
`;

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
`;

const FieldOfView = styled.div`
  background-color: rgba(255, 255, 255, 0.5);
  width: 100%;
  height: 100%;
  ${({ corners }) => corners.tl && `
    clip-path: polygon(${corners.tl.x}% ${corners.tl.y}%, ${corners.tr.x}% ${corners.tr.y}%, ${corners.br.x}% ${corners.br.y}%, ${corners.bl.x}% ${corners.bl.y}%);
  `}
`;

export default Minimap;
