import styled from 'styled-components';
import {
  Center, Loader
} from '@mantine/core';
import useAnalyses from '../hooks/Analysis/useAnalyses';
import AnalysesTable from '../components/Pages/Analyses/AnalysesTable';
import ViewAnalysisModal from '../components/Pages/Analyses/ViewAnalysisModal';
import useMatches from '../hooks/Matches/useMatches';
import Error from '../components/Common/Error/Error';

const Analyses = () => {
  const { status: analysesStatus } = useAnalyses();
  const { status: matchesStatus } = useMatches();

  if (analysesStatus === 'loading' || matchesStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (analysesStatus === 'error' || matchesStatus === 'error') {
    return (<Center sx={{ height: '100%' }}><Error /></Center>);
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
  height: 100%;
`;

export default Analyses;
