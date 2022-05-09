import { Modal } from '@mantine/core';
import { useRecoilState } from 'recoil';
import playerStatModalState from '../../../atoms/playerStatModalState';

const PlayerStatsModal = () => {
  const [modal, setModal] = useRecoilState(playerStatModalState);

  return (
    <Modal
      opened={modal.open}
      onClose={() => setModal({
        open: false,
        playerId: modal.playerId
      })}
      title="Player Statistics!"
      overlayBlur={3}
      size="sm"
    >
      {modal.playerId}
    </Modal>
  );
};

export default PlayerStatsModal;
