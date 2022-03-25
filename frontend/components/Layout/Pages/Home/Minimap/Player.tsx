import { useState } from 'react';
import {
  Tooltip, AspectRatio
} from '@mantine/core';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import usePlayerStatModal from '../../../../../hooks/usePlayerStatModal';

interface PlayerProps {
  id: string;
  player: {
    coordinates: Array<number>;
    name: string;
    position: string;
  };
  playerId: number;
  color: string;
}

const Player = ({ playerId, color, player }: PlayerProps) => {
  const [state, setState] = usePlayerStatModal();

  return (
    <Container position={player.coordinates}>
      <Tooltip
        label={(player.name).toUpperCase()}
        transition="pop"
        color={color}
        transitionDuration={100}
        gutter={16}
        styles={{
          body: { fontWeight: 900, color: 'white' },
          root: { width: '100%', height: '100%' }
        }}
      >
        <AspectRatio ratio={1}>
          <Dot open={state.open && state.playerId === playerId} color={color} onClick={() => setState({
            open: true,
            playerId
          })} />
        </AspectRatio>
      </Tooltip>
    </Container>
  );
};

const Container = styled(motion.div).attrs(({ position }) => ({
  transition: {
    type: "tween",
    duration: 1
  },
  animate: {
    left: `${position[0]}%`,
    top: `${position[1]}%`,
    x: '-1rem',
    y: '-1rem'
  }
}))`
  position: absolute;
  width: 3%;
`;

const Dot = styled(motion.div).attrs(({ open }) => ({
  initial: "closed",
  animate: open ? "opened" : "closed",
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
  background: ${({ color }) => color};
  border: 1px solid rgba(0,0,0,0);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 1rem 0 #000;
  height: 100%;
  width: 100%;
  cursor: pointer;
`;


export default Player;
