import {
  AspectRatio,
  Modal
} from '@mantine/core';
import ReactPlayer from 'react-player';
import useViewMatchModal from '../../../../hooks/Matches/useViewMatchModal';

const ViewMatchModal = () => {
  const [state, setState] = useViewMatchModal();

  return (
    <Modal
      opened={state.open}
      onClose={() => setState({
        open: false,
        matchId: state.matchId
      })}
      title="Watch Match"
      size="55%"
    >
      <AspectRatio ratio={16 / 9}>
        <ReactPlayer
          url={`https://s3.us-east-2.amazonaws.com/videos.visionsync.io/${state.matchId}.mp4`}
          width="100%"
          height="100%"
          controls
        />
      </AspectRatio>
    </Modal>
  );
};

export default ViewMatchModal;
