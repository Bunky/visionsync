import styled from 'styled-components';
import {
  Center, Loader
} from '@mantine/core';
import useConfigs from '../hooks/Configs/useConfigs';
import ConfigsTable from '../components/Layout/Pages/Configs/ConfigsTable';
import ViewConfigModal from '../components/Layout/Pages/Configs/ViewConfigModal';
import EditConfigModal from '../components/Layout/Pages/Configs/EditConfigModal';

const Configs = () => {
  const { status: configsStatus } = useConfigs();

  if (configsStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (configsStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <Container>
      <ConfigsTable />
      <ViewConfigModal />
      <EditConfigModal />
    </Container>
  );
};

const Container = styled.div`
  max-height: 100%;
  height: 100%;
`;

export default Configs;
