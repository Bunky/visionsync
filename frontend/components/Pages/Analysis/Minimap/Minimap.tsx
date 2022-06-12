/* eslint-disable max-len */
import styled from 'styled-components';
import {
  AspectRatio,
  // Image
} from '@mantine/core';
import { useContext } from 'react';
// import Player from './Player';
// import Ball from './Ball';
import HeatmapCanvas from '../../../Common/Heatmap/HeatmapCanvas';
import MinimapCanvas from './MinimapCanvas';
import AnalysisContext from '../../../../contexts/analysis/AnalysisContext';

interface MinimapProps {
  overlay?: boolean;
  heatmap: boolean;
  boundaries: boolean;
  team: string;
}

const Minimap = ({
  overlay, heatmap, boundaries, team = 'both'
}: MinimapProps) => {
  const { positions, corners, allPositions } = useContext(AnalysisContext);

  return (
    <AspectRatio ratio={16 / 9}>
      <Container overlay={overlay}>
        {/* <Image
          radius="md"
          src="/images/pitch.svg"
          alt="Football pitch"
        /> */}
        <img
          src="/images/pitch.svg"
          alt="Football pitch"
          height="100%"
        />
        {boundaries && (
          <OverlayContainer>
            <FieldOfView corners={corners} />
          </OverlayContainer>
        )}
        {heatmap && (
          <OverlayContainer>
            <HeatmapCanvas
              data={[].concat(...allPositions).filter((d) => {
                if (team === '1' && d.team === 0) {
                  return true;
                }
                if (team === '2' && d.team === 1) {
                  return true;
                }
                if (team === 'both' && d.team > -1) {
                  return true;
                }
                return false;
              }).map((d) => ([d.x, d.y, 1]))}
              maxOccurances={10}
              blur={overlay ? 5 : 25}
              radius={overlay ? 1 : 5}
            />
          </OverlayContainer>
        )}
        <OverlayContainer>
          <MinimapCanvas data={positions} />
          {/* {positions.map((player, index) => (player.class === 1 ? (
            <Ball ball={player} />
          ) : (
            <Player
              id={`playerIcon-${index}`}
              playerId={index}
              player={player}
            />
          )))} */}
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
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  width: 85.14%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
`;

const FieldOfView = styled.div`
  background-color: rgba(255, 255, 255, 0.3);
  width: 100%;
  height: 100%;
  ${({ corners }) => corners.tl && `
    clip-path: polygon(${corners.tl.x}% ${corners.tl.y}%, ${corners.tr.x}% ${corners.tr.y}%, ${corners.br.x}% ${corners.br.y}%, ${corners.bl.x}% ${corners.bl.y}%);
  `}
`;

export default Minimap;
