/* eslint-disable no-nested-ternary */
import {
  Tooltip, AspectRatio
} from '@mantine/core';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';
import playerStatModalState from '../../../../atoms/playerStatModalState';

const Player = ({ playerId, player }) => {
  const [modal, setModal] = useRecoilState(playerStatModalState);

  return (
    <Container player={player}>
      <Tooltip
        label={(player.class === 0 ? 'Player' : (player.class === 1 ? 'Ball' : 'Goal'))}
        transition="pop"
        transitionDuration={100}
        gutter={16}
        styles={{
          body: { fontWeight: 900, color: 'white' },
          root: { width: '100%', height: '100%' }
        }}
      >
        <AspectRatio ratio={1}>
          <Dot
            open={modal.open && modal.playerId === playerId}
            colour={player.colour}
            onClick={() => setModal({
              open: true,
              playerId
            })}
          />
        </AspectRatio>
      </Tooltip>
    </Container>
  );
};

const Container = styled(motion.div).attrs(({ player }) => ({
  transition: {
    type: 'tween',
    duration: 1
  },
  animate: {
    left: `${player.x}%`,
    top: `${player.y}%`,
    x: '-1rem',
    y: '-1rem'
  }
}))`
  position: absolute;
  width: 3%;
`;

const Dot = styled(motion.div).attrs(({ open }) => ({
  initial: 'closed',
  animate: open ? 'opened' : 'closed',
  whileHover: {
    scale: 1.3,
    border: '1px solid rgba(255,255,255,1)',
  },
  whileTap: {
    scale: 0.9
  },
  variants: {
    opened: {
      border: '3px solid rgba(255,255,255,1)',
      boxShadow: '0 0 2rem 0.5rem #000',
      scale: 1.1,
      transition: {
        repeat: Infinity,
        repeatType: 'mirror',
        duration: 0.1,
        repeatDelay: 0.2
      }
    },
    closed: {
      border: '1px solid rgba(0,0,0,0)',
      boxShadow: '0 0 1rem 0rem #000',
      scale: 1
    }
  }
}))`
  background: ${({ colour }) => `rgb(${colour[0]} ${colour[1]} ${colour[2]})`};
  border: 1px solid rgba(0,0,0,0);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 1rem 0 #000;
  height: 100%;
  width: 100%;
  cursor: pointer;
`;

export default Player;
