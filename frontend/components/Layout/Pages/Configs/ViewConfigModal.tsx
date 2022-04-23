import { Center, Loader, Modal } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import viewConfigModalState from '../../../../atoms/viewConfigModalState';
import fetchConfigJson from '../../../../fetches/fetchConfigJson';

const ViewConfigModal = () => {
  const [modal, setModal] = useRecoilState(viewConfigModalState);
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (modal.open) {
      const fetchJson = async () => {
        setJson(await fetchConfigJson(modal.configId));
      };

      fetchJson();
    }
  }, [modal]);

  return (
    <Modal
      opened={modal.open}
      onClose={() => setModal({
        open: false,
        configId: modal.configId
      })}
      title="View Config"
      size="55%"
    >
      <Modal
        opened={modal.open}
        onClose={() => setModal({
          open: false,
          configId: modal.configId
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
