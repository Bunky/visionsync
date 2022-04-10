import styled from 'styled-components';
import {
  Center, Loader
} from '@mantine/core';
import useAnalysis from '../hooks/useAnalysis';
import VideoTable from '../components/Layout/Pages/Matches/VideoTable';
import NewMatchModal from '../components/Layout/Pages/Matches/NewMatchModal';
import ViewMatchModal from '../components/Layout/Pages/Matches/ViewMatchModal';

const Home = () => {
  const { status: analysisStatus } = useAnalysis();

  if (analysisStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (analysisStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <Container>
      <NewMatchModal />
      <VideoTable />
      <ViewMatchModal />
    </Container>
  );
};

const Container = styled.div`
  max-height: 100%;
`;

export default Home;
