import { Modal } from '@mantine/core';
import useViewConfigModal from '../../../../hooks/Configs/useViewConfigModal';

const ViewConfigModal = () => {
  const [state, setState] = useViewConfigModal();

  return (
    <Modal
      opened={state.open}
      onClose={() => setState({
        open: false,
        configId: state.configId
      })}
      title="View Config"
      size="55%"
    >
      Config shown here yes :)
    </Modal>
  );
};

export default ViewConfigModal;
