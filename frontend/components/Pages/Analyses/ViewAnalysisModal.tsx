import {
  Center, Loader, Modal, Tabs
} from '@mantine/core';
import { Prism } from '@mantine/prism';
import { IoCode, IoMap } from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import Heatmap from './Modal/Heatmap';
import viewAnalysisModalState from '../../../atoms/viewAnalysisModalState';
import useAnalysisData from '../../../hooks/Analysis/useAnalysisData';

const ViewAnalysisModal = () => {
  const [modal, setModal] = useRecoilState(viewAnalysisModalState);
  const { data, status } = useAnalysisData(modal.analysisId, modal.open);

  return (
    <Modal
      opened={modal.open}
      onClose={() => setModal({
        open: false,
        analysisId: modal.analysisId
      })}
      title="View Analysis"
      overlayBlur={3}
      size="xl"
      overflow="inside"
    >
      {status === 'success' && data ? (
        <Tabs>
          <Tabs.Tab label="Heatmap" icon={<IoMap />}>
            <Heatmap
              data={[].concat(...data).map((d) => ([d.x, d.y, 1]))}
            />
          </Tabs.Tab>
          <Tabs.Tab label="Data" icon={<IoCode />}>
            <Prism
              withLineNumbers
              language="json"
            >
              {JSON.stringify(data, null, 2)}
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
