import styled from 'styled-components';
import {
  Center, Loader
} from '@mantine/core';
import useMatches from '../hooks/Matches/useMatches';
import MatchTable from '../components/Layout/Pages/Matches/MatchTable';
import NewMatchModal from '../components/Layout/Pages/Matches/NewMatchModal';
import ViewMatchModal from '../components/Layout/Pages/Matches/ViewMatchModal';
import EditMatchModal from '../components/Layout/Pages/Matches/EditMatchModal';

const Home = () => {
  const { status: matchesStatus } = useMatches();

  if (matchesStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (matchesStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <Container>
      <MatchTable />
      <NewMatchModal />
      <ViewMatchModal />
      <EditMatchModal />
    </Container>
  );
};

const Container = styled.div`
  max-height: 100%;
  height: 100%;
`;

export default Home;
