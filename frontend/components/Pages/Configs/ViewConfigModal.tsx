import { Modal } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { useRecoilState } from 'recoil';
import viewConfigModalState from '../../../atoms/viewConfigModalState';
import useConfigs from '../../../hooks/Configs/useConfigs';

const ViewConfigModal = () => {
  const [modal, setModal] = useRecoilState(viewConfigModalState);
  const { data: configs } = useConfigs();

  return (
    <Modal
      opened={modal.open}
      onClose={() => setModal({
        open: false,
        configId: modal.configId
      })}
      title="View Config"
      size="55%"
      overflow="inside"
    >
      <Prism
        withLineNumbers
        language="json"
      >
        {JSON.stringify(configs.find((config) => config._id === modal.configId)?.config, null, 2)}
      </Prism>
    </Modal>
  );
};

export default ViewConfigModal;
