import { Center, Loader, Modal, Tabs } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { useEffect, useState } from 'react';
import useViewAnalysisModel from '../../../../hooks/Analysis/useViewAnalysisModal';
import fetchAnalysisJson from '../../../../fetches/fetchAnalysisJson';
import Heatmap from './Modal/Heatmap';
import { IoCode, IoMap } from 'react-icons/io5';

const ViewAnalysisModal = () => {
  const [state, setState] = useViewAnalysisModel();
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (state.open) {
      const fetchJson = async () => {
        setJson(await fetchAnalysisJson(state.analysisId));
      };

      fetchJson();
    }
  }, [state]);

  return (
    <Modal
      opened={state.open}
      onClose={() => setState({
        open: false,
        analysisId: state.analysisId
      })}
      title="View Analysis"
      size="55%"
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
