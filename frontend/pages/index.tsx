import styled from 'styled-components';
import {
  Center, Loader
} from '@mantine/core';
import useMatches from '../hooks/Matches/useMatches';
import MatchTable from '../components/Pages/Matches/MatchTable';
import MatchModal from '../components/Pages/Matches/MatchModal';
import ViewMatchModal from '../components/Pages/Matches/ViewMatchModal';
import Error from '../components/Common/Error/Error';

const Home = () => {
  const { status: matchesStatus } = useMatches();

  if (matchesStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (matchesStatus === 'error') {
    return (<Center sx={{ height: '100%' }}><Error /></Center>);
  }

  return (
    <Container>
      <MatchTable />
      <MatchModal />
      <ViewMatchModal />
    </Container>
  );
};

const Container = styled.div`
  max-height: 100%;
  height: 100%;
`;

export default Home;
