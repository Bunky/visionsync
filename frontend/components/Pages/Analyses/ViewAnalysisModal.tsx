import {
  Center, Loader, Modal, Tabs
} from '@mantine/core';
import { Prism } from '@mantine/prism';
import { useEffect, useState } from 'react';
import { IoCode, IoMap } from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import fetchAnalysisJson from '../../../fetches/fetchAnalysisJson';
import Heatmap from './Modal/Heatmap';
import viewAnalysisModalState from '../../../atoms/viewAnalysisModalState';

const ViewAnalysisModal = () => {
  const [modal, setModal] = useRecoilState(viewAnalysisModalState);

  const [json, setJson] = useState(null);

  useEffect(() => {
    if (modal.open) {
      const fetchJson = async () => {
        setJson(await fetchAnalysisJson(modal.analysisId));
      };

      fetchJson();
    }
  }, [modal]);

  return (
    <Modal
      opened={modal.open}
      onClose={() => setModal({
        open: false,
        analysisId: modal.analysisId
      })}
      title="View Analysis"
      size="55%"
      overflow="inside"
    >
      {json ? (
        <Tabs>
          <Tabs.Tab label="Heatmap" icon={<IoMap />}>
            <Heatmap
              data={[].concat(...json).map((d) => ([d.x, d.y, 1]))}
            />
          </Tabs.Tab>
          <Tabs.Tab label="Data" icon={<IoCode />}>
            <Prism
              withLineNumbers
              language="json"
            >
              {JSON.stringify(json, null, 2)}
            </Prism>
          </Tabs.Tab>
        </Tabs>
      ) : (
        <Center>
          <Loader />
        </Center>
      )}
    </Modal>
  );
};

export default ViewAnalysisModal;
