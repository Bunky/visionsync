import { useState } from 'react';
import {
  Modal, AspectRatio
} from '@mantine/core';
import styled from 'styled-components';
// import { motion } from 'framer-motion';
import { useRecoilState } from 'recoil';
import analysisHoverState from '../../../../atoms/analysisHoverState';

const Ball = ({ ball, ballId }) => {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useRecoilState(analysisHoverState);

  return (
    <Container x={ball.x} y={ball.y}>
      <AspectRatio ratio={1}>
        <Football
          hover={hover.playerId === ballId || open}
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHover({
            playerId: ballId
          })}
          onMouseLeave={() => setHover({
            playerId: -1
          })}
        />
      </AspectRatio>
      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title="Ball Statistics!"
        overlayBlur={3}
        size="sm"
      >
        I am football!
      </Modal>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  width: 15px;
  height: 15px;
  left: ${({ x }) => `calc(${x}% - 7.5px)`};
  top: ${({ y }) => `calc(${y}% - 7.5px)`};
`;

const Football = styled.div`
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
  transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out, z-index 0.5s step-end;
  z-index: 0;

  ${({ hover }) => hover && `
    z-index: 1;
    box-shadow: 0 0 2rem 0.5rem #000;
    transform: scale(1.3);
    transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out, z-index 0.5s step-start;
  `};
`;

export default Ball;
