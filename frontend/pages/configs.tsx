import styled from 'styled-components';
import {
  Center, Loader
} from '@mantine/core';
import useConfigs from '../hooks/Configs/useConfigs';
import ConfigsTable from '../components/Layout/Pages/Configs/ConfigsTable';
import ViewConfigModal from '../components/Layout/Pages/Configs/ViewConfigModal';

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
    </Container>
  );
};

const Container = styled.div`
  max-height: 100%;
`;

export default Configs;
