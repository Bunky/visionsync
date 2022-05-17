import styled from 'styled-components';
import {
  AspectRatio,
  Image
} from '@mantine/core';
import { useContext } from 'react';
import Player from './Player';
import Ball from './Ball';
import HeatmapCanvas from '../../../Common/Heatmap/HeatmapCanvas';
import MinimapCanvas from './MinimapCanvas';
import AnalysisContext from '../../../../contexts/analysis/AnalysisContext';

interface MinimapProps {
  overlay?: boolean;
  heatmap: boolean;
  boundaries: boolean;
}

const Minimap = ({ overlay, heatmap, boundaries }: MinimapProps) => {
  const { positions, corners, allPositions } = useContext(AnalysisContext);

  return (
    <AspectRatio ratio={16 / 9}>
      <Container overlay={overlay}>
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
    </AspectRatio>
  );
};

const Container = styled.div`
  position: relative;
  pointer-events: ${({ overlay }) => overlay && 'none'};
  object-fit: contain;
  background-color: rgb(89 178 0);
  border-radius: 8px;
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
