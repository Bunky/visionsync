import styled from 'styled-components';
import {
  Tabs, Grid, Center, Loader, Button
} from '@mantine/core';
import {
  IoMap, IoPerson, IoStatsChart, IoTv
} from 'react-icons/io5';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Livefeed from '../components/Layout/Pages/Home/LiveFeed/Livefeed';
import Minimap from '../components/Layout/Pages/Home/Minimap/Minimap';
import PlayerTable from '../components/Layout/Pages/Home/Players/PlayerTable';
import Stats from '../components/Layout/Pages/Home/Statistics/Stats';
import PlayerStatsModal from '../components/Layout/Pages/Home/PlayerStatsModal';
import useAnalysis from '../hooks/Analysis/useAnalysis';
import useStopAnalysis from '../hooks/Analysis/useStopAnalysis';

const Analysis = () => {
  const { data: analysis, status: analysisStatus } = useAnalysis();
  const useStop = useStopAnalysis();
  const router = useRouter();

  useEffect(() => {
    if (analysisStatus === 'success' && !analysis.active) {
      router.push('/');
    }
  }, [analysis, analysisStatus, router]);

  if (analysisStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (analysisStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  if (!analysis.active) {
    return (<Center sx={{ height: '100%' }}>No active analysis</Center>);
  }

  return (
    <Container>
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
            onClick={() => useStop.mutate(analysis.matchId)}
          >
            Stop analysis
          </Button>
          <Button
            onClick={() => router.push('/config')}
            ml="sm"
          >
            Config
          </Button>
        </Grid.Col>
      </Grid>
      <PlayerStatsModal />
    </Container>
  );
};

const Container = styled.div`
  max-height: 100%;
`;

export default Analysis;
