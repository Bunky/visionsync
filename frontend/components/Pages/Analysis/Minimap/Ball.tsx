import { useState } from 'react';
import {
  Modal, AspectRatio
} from '@mantine/core';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Ball = ({ ball }) => {
  const [open, setOpen] = useState(false);

  return (
    <Container ball={ball}>
      <AspectRatio ratio={1}>
        <Football onClick={() => setOpen(true)} />
      </AspectRatio>
      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title="Ball Statistics!"
      >
        I am football!
      </Modal>
    </Container>
  );
};

const Container = styled(motion.div).attrs(({ ball }) => ({
  transition: {
    type: 'tween',
    duration: 1
  },
  animate: {
    left: `${ball.x}%`,
    top: `${ball.y}%`,
    x: '-1rem',
    y: '-1rem'
  }
}))`
  position: absolute;
  width: 2%;
`;

const Football = styled(motion.div).attrs(() => ({
  whileHover: {
    scale: 1.3,
    border: '1px solid rgba(0,0,0,1)',
  },
  whileTap: {
    scale: 0.9
  },
}))`
  background: white;
  background-image: url("images/football.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 120%;
  border: 1px solid rgba(0,0,0,0);
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 1rem 0 #000;
  height: 100%;
  width: 100%;
  cursor: pointer;
`;

export default Ball;
