import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Image
} from '@mantine/core';
import Player from './Player';
import Ball from './Ball';
import useTempDetections from '../../../../../hooks/useTempDetections';

interface MinimapProps {
  overlay?: boolean;
}

const Minimap = ({ overlay }: MinimapProps) => {
  const [tempDetections, setTempDetections] = useTempDetections();
  const [tempBall, setTempBall] = useState([]);
  const [tempTimeout, setTemptimeout] = useState(null);

  // useEffect(() => {
  //   // updatePositions();

  //   return () => {
  //     clearTimeout(tempTimeout);
  //   };
  // }, []);

  const updatePositions = () => {
    setTempDetections(tempDetections.map((detection) => ({
      coordinates: [Math.random() * 100, Math.random() * 100],
      name: detection.name,
      position: detection.position
    })));
    setTempBall([Math.random() * 100, Math.random() * 100]);

    setTemptimeout(setTimeout(() => updatePositions(), 2500));
  };

  return (
    <Container overlay={overlay}>
      <Image
        radius="md"
        src="/images/pitch.svg"
        alt="Football pitch"
      />
      <PlayerContainer>
        {tempDetections.map((player, index) => (
          <Player id={`playerIcon-${index}`} color={index % 2 ? 'red' : 'blue'} playerId={index} player={player} />
        ))}
        <Ball position={tempBall} />
      </PlayerContainer>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  pointer-events: ${({ overlay }) => overlay && 'none'};
`;

const PlayerContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export default Minimap;
