/* eslint-disable no-nested-ternary */
import {
  Tooltip
} from '@mantine/core';
import styled from 'styled-components';
// import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';
import playerStatModalState from '../../../../atoms/playerStatModalState';
import analysisHoverState from '../../../../atoms/analysisHoverState';

const Player = ({ playerId, player }) => {
  const [modal, setModal] = useRecoilState(playerStatModalState);
  const [hover, setHover] = useRecoilState(analysisHoverState);

  return (
    <Container x={player.x} y={player.y}>
      <Tooltip
        label={(player.class === 0 ? 'Player' : (player.class === 1 ? 'Ball' : 'Goal'))}
        transition="pop"
        transitionDuration={100}
        gutter={4}
        styles={{
          body: { fontWeight: 900, color: 'white', marginLeft: 0 },
          arrow: { marginLeft: 0 },
          root: { width: '100%', height: '100%' }
        }}
        opened={hover.playerId === playerId}
        withArrow
        arrowSize={5}
      >
        <Dot
          open={hover.playerId === playerId || (modal.open && modal.playerId === playerId)}
          colour={player.colour}
          onClick={() => setModal({
            open: true,
            playerId
          })}
          onMouseEnter={() => setHover({
            playerId
          })}
          onMouseLeave={() => setHover({
            playerId: -1
          })}
        />
      </Tooltip>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  width: 20px;
  height: 20px;
  left: ${({ x }) => `calc(${x}% - 10px)`};
  top: ${({ y }) => `calc(${y}% - 10px)`};
`;

const Dot = styled.div`
  background: ${({ colour }) => `rgb(${colour[0]} ${colour[1]} ${colour[2]})`};
  filter: saturate(3);
  border: 3px solid rgba(255,255,255,1);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 1rem 0 #000;
  height: 100%;
  width: 100%;
  cursor: pointer;
  transform: scale(1);
  transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out, z-index 0.5s step-end;
  z-index: 0;

  ${({ open }) => open && `
    z-index: 1;
    box-shadow: 0 0 2rem 0.5rem #000;
    transform: scale(1.3);
    transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out, z-index 0.5s step-start;
  `};
`;

export default Player;
