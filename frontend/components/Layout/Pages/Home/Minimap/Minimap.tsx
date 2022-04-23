import styled from 'styled-components';
import {
  Image
} from '@mantine/core';
import Player from './Player';
// import Ball from './Ball';
import useDetectionSocket from '../../../../../hooks/useDetectionSocket';

interface MinimapProps {
  overlay?: boolean;
}

const Minimap = ({ overlay }: MinimapProps) => {
  const { positions } = useDetectionSocket();

  return (
    <Container overlay={overlay}>
      <Image
        radius="md"
        src="/images/pitch.svg"
        alt="Football pitch"
      />
      <PlayerContainer>
        {positions.map((player, index) => (
          <Player
            id={`playerIcon-${index}`}
            playerId={index}
            player={player}
          />
        ))}
        {/* <Ball position={tempBall} /> */}
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
