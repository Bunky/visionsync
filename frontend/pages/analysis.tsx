import styled from 'styled-components';
import {
  Tabs, Grid, Center, Loader, Button, Switch, Group
} from '@mantine/core';
import {
  IoCode,
  IoMap, IoPerson, IoStatsChart, IoStop, IoTv
} from 'react-icons/io5';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Livefeed from '../components/Layout/Pages/Home/LiveFeed/Livefeed';
import Minimap from '../components/Layout/Pages/Home/Minimap/Minimap';
import PlayerTable from '../components/Layout/Pages/Home/Players/PlayerTable';
import Stats from '../components/Layout/Pages/Home/Statistics/Stats';
import PlayerStatsModal from '../components/Layout/Pages/Home/PlayerStatsModal';
import useAnalysis from '../hooks/Analysis/useAnalysis';
import useStopAnalysis from '../hooks/Analysis/useStopAnalysis';
import useLiveSocket from '../hooks/useLiveSocket';

const Analysis = () => {
  const { data: analysis, status: analysisStatus } = useAnalysis();
  const live = useLiveSocket();
  const useStop = useStopAnalysis();
  const router = useRouter();
  const [showDetections, setShowDetections] = useState(true);

  useEffect(() => {
    if (analysisStatus === 'success' && !analysis.active) {
      router.push('/');
    }
  }, [analysis, analysisStatus, router]);

  if (analysisStatus === 'loading' || live === null) {
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
            <Tabs.Tab label="Live Feed" icon={<IoTv />}><Livefeed showDetections={showDetections} /></Tabs.Tab>
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
          <Group dir="row">
            <Button
              onClick={() => useStop.mutate(analysis.matchId)}
              leftIcon={<IoStop />}
            >
              Stop
            </Button>
            <Button
              onClick={() => router.push('/config')}
              leftIcon={<IoCode />}
            >
              Config
            </Button>
            <Switch
              checked={showDetections}
              onChange={(v) => setShowDetections(v.target.checked)}
              label="Show detections"
            />
          </Group>
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
