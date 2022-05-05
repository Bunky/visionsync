import styled from 'styled-components';
import {
  Image
} from '@mantine/core';
import Player from './Player';
import Ball from './Ball';
import useDetectionSocket from '../../../../../hooks/useDetectionSocket';
import HeatmapCanvas from '../../../../Common/Heatmap/HeatmapCanvas';

interface MinimapProps {
  overlay?: boolean;
  heatmap: boolean;
  boundaries: boolean;
}

const Minimap = ({ overlay, heatmap, boundaries }: MinimapProps) => {
  const { positions, corners, allPositions } = useDetectionSocket();

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
        {heatmap && (
          <OverlayContainer>
            <HeatmapCanvas
              data={[].concat(...allPositions).map((d) => ([d.x, d.y, 1]))}
              maxOccurances={1}
              blur={overlay ? 5 : 25}
              radius={overlay ? 2 : 10}
            />
          </OverlayContainer>
        )}
        {boundaries && (
          <OverlayContainer>
            <FieldOfView corners={corners} />
          </OverlayContainer>
        )}
        <OverlayContainer>
          {positions.map((player, index) => (player.class === 1 ? (
            <Ball ball={player} />
          ) : (
            <Player
              id={`playerIcon-${index}`}
              playerId={index}
              player={player}
            />
          )))}
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
