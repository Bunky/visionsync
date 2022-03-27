import styled from 'styled-components';
import {
  Tabs, Grid, Center, Loader, Button
} from '@mantine/core';
import {
  IoMap, IoPerson, IoStatsChart, IoTv
} from 'react-icons/io5';
import Livefeed from '../components/Layout/Pages/Home/LiveFeed/Livefeed';
import Minimap from '../components/Layout/Pages/Home/Minimap/Minimap';
import PlayerTable from '../components/Layout/Pages/Home/Players/PlayerTable';
import Stats from '../components/Layout/Pages/Home/Statistics/Stats';
import PlayerStatsModal from '../components/Layout/Pages/Home/PlayerStatsModal';
import useAnalysis from '../hooks/useAnalysis';
import useStartAnalysis from '../hooks/useStartAnalysis';
import useStopAnalysis from '../hooks/useStopAnalysis';

const Home = () => {
  const { data: analysis, status: analysisStatus } = useAnalysis();
  const useStart = useStartAnalysis();
  const useStop = useStopAnalysis();

  if (analysisStatus === 'loading' || analysis === undefined) {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (analysisStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <Container>
      {analysis.active ? (
        <>
          <Grid grow>
            <Grid.Col span={8}>
              <Tabs>
                <Tabs.Tab label="Live Feed" icon={<IoTv />}><Livefeed /></Tabs.Tab>
                <Tabs.Tab label="Minimap" icon={<IoMap />}><Minimap /></Tabs.Tab>
              </Tabs>
            </Grid.Col>
            <Grid.Col span={4}>
              <Tabs>
                <Tabs.Tab label="Players" icon={<IoPerson />}><PlayerTable /></Tabs.Tab>
                <Tabs.Tab label="Stats" icon={<IoStatsChart />}><Stats /></Tabs.Tab>
              </Tabs>
            </Grid.Col>
            <Grid.Col span={12}>
              <Button
                onClick={() => useStop.mutate()}
              >
                Stop analysis
              </Button>
            </Grid.Col>
          </Grid>
          <PlayerStatsModal />
        </>
      ) : (
        <Button
          onClick={() => useStart.mutate()}
        >
          Start analysis
        </Button>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-height: 100%;
`;

export default Home;
