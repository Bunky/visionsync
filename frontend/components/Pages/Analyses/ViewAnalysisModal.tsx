import { useState } from 'react';
import {
  Center, Loader, Modal, Select, Tabs
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
  const [team, setTeam] = useState('both');

  return (
    <Modal
      opened={modal.open}
      onClose={() => {
        setTimeout(() => {
          setTeam('both');
        }, 500);
        setModal({
          open: false,
          analysisId: modal.analysisId
        });
      }}
      title="View Analysis"
      overlayBlur={3}
      size="xl"
      overflow="inside"
    >
      {status === 'success' && data ? (
        <Tabs>
          <Tabs.Tab label="Heatmap" icon={<IoMap />}>
            <Select
              placeholder="Pick team"
              value={team}
              onChange={setTeam}
              data={[
                { value: 'both', label: 'Both Teams' },
                { value: '1', label: 'Team 1' },
                { value: '2', label: 'Team 2' }
              ]}
              mb="xs"
            />
            <Heatmap
              data={[].concat(...data).filter((d) => {
                if (team === '1' && d.team === 0) {
                  return true;
                }
                if (team === '2' && d.team === 1) {
                  return true;
                }
                if (team === 'both' && d.team > -1) {
                  return true;
                }
                return false;
              }).map((d) => ([d.x, d.y, 1]))}
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
