import { Modal } from '@mantine/core';
import usePlayerStatModal from '../../../../hooks/usePlayerStatModal';

const PlayerStatsModal = () => {
  const [state, setState] = usePlayerStatModal();

  return (
    <Modal
      opened={state.open}
      onClose={() => setState({
        open: false,
        playerId: state.playerId
      })}
      title="Player Statistics!"
    >
      {state.playerId}
    </Modal>
  );
};

export default PlayerStatsModal;
