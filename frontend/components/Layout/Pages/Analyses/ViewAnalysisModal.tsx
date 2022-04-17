import { Modal } from '@mantine/core';
import { Prism } from '@mantine/prism';
import { useEffect, useState } from 'react';
import useViewAnalysisModel from '../../../../hooks/Analysis/useViewAnalysisModal';
import fetchAnalysisJson from '../../../../fetches/fetchAnalysisJson';

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
      <Prism withLineNumbers language="json">{JSON.stringify(json)}</Prism>
    </Modal>
  );
};

export default ViewAnalysisModal;
