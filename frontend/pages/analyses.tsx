import styled from 'styled-components';
import {
  Center, Loader
} from '@mantine/core';
import useAnalyses from '../hooks/Analysis/useAnalyses';
import AnalysesTable from '../components/Layout/Pages/Analyses/AnalysesTable';
import ViewAnalysisModal from '../components/Layout/Pages/Analyses/ViewAnalysisModal';

const Analyses = () => {
  const { status: analysesStatus } = useAnalyses();

  if (analysesStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (analysesStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <Container>
      <AnalysesTable />
      <ViewAnalysisModal />
    </Container>
  );
};

const Container = styled.div`
  max-height: 100%;
`;

export default Analyses;
