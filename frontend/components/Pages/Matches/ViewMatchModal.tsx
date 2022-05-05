import {
  AspectRatio,
  Modal
} from '@mantine/core';
import ReactPlayer from 'react-player';
import { useRecoilState } from 'recoil';
import viewMatchModalState from '../../../atoms/viewMatchModalState';

const ViewMatchModal = () => {
  const [modal, setModal] = useRecoilState(viewMatchModalState);

  return (
    <Modal
      opened={modal.open}
      onClose={() => setModal({
        open: false,
        matchId: modal.matchId
      })}
      title="Watch Match"
      size="55%"
    >
      <AspectRatio ratio={16 / 9}>
        <ReactPlayer
          url={`http://d1pu8bxuwsqdvz.cloudfront.net/matches/${modal.matchId}.mp4`}
          width="100%"
          height="100%"
          controls
        />
      </AspectRatio>
    </Modal>
  );
};

export default ViewMatchModal;
