import { Center, Loader, Modal } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { useEffect, useState } from 'react';
import fetchConfigJson from '../../../../fetches/fetchConfigJson';
import useViewConfigModal from '../../../../hooks/Configs/useViewConfigModal';

const ViewConfigModal = () => {
  const [state, setState] = useViewConfigModal();
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (state.open) {
      const fetchJson = async () => {
        setJson(await fetchConfigJson(state.configId));
      };

      fetchJson();
    }
  }, [state]);

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
      <Modal
        opened={state.open}
        onClose={() => setState({
          open: false,
          configId: state.configId
        })}
        title="View Analysis"
        size="55%"
      >
        {json ? (
          <Prism
            withLineNumbers
            language="json"
          >
            {JSON.stringify(json, null, 2)}
          </Prism>
        ) : (
          <Center>
            <Loader />
          </Center>
        )}
      </Modal>
    </Modal>
  );
};

export default ViewConfigModal;
