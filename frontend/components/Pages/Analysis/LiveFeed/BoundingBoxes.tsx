import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import playerStatModalState from '../../../../atoms/playerStatModalState';
import analysisHoverState from '../../../../atoms/analysisHoverState';

const BoundingBoxes = ({ data }) => {
  const [modal, setModal] = useRecoilState(playerStatModalState);
  const [hover, setHover] = useRecoilState(analysisHoverState);
  return (
    <Container>
      {data.filter((player) => player.class !== 2 && ((player.class === 0 && player.team > -1) || player.class === 1)).map((player, i) => (
        <Player
          onClick={() => setModal({
            open: true,
            playerId: i
          })}
          onMouseEnter={() => setHover({
            playerId: i
          })}
          onMouseLeave={() => setHover({
            playerId: -1
          })}
          player={player}
          hover={hover.playerId === i || (modal.open && modal.playerId === i)}
        />
      ))}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Player = styled.div`
  position: absolute;
  width: ${({ player }) => player.xmax - player.xmin}%;
  height: ${({ player }) => player.ymax - player.ymin}%;
  top: ${({ player }) => player.ymin}%;
  left: ${({ player }) => player.xmin}%;
  border-radius: ${({ player }) => (player.class === 0 ? '4px' : '50%')};
  border: 1px solid ${({ player }) => `rgb(${player.colour[0]}, ${player.colour[1]}, ${player.colour[2]})`};
  background-color: ${({ player }) => `rgba(${player.colour[0]}, ${player.colour[1]}, ${player.colour[2]}, 0.3)`};
  filter: saturate(3);
  cursor: pointer;
  transform: scale(1.3);
  transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out, z-index 0.5s step-end;
  box-shadow: rgba(0, 0, 0, 0) 0 0 0 2000px;
  z-index: 0;

  ${({ hover }) => hover && `
    z-index: 1;
    transform: scale(1.7);
    transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out, z-index 0.5s step-start;
    box-shadow: rgba(0, 0, 0, 0.35) 0 0 0 2000px;
  `};
`;

export default BoundingBoxes;
