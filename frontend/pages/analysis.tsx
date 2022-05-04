import styled from 'styled-components';
import {
  Text, Grid, Center, Loader, Button, Switch, Group, Paper, Stack
} from '@mantine/core';
import {
  IoCode,
  IoSave,
  IoStop
} from 'react-icons/io5';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BiAnalyse } from 'react-icons/bi';
import Livefeed from '../components/Layout/Pages/Home/LiveFeed/Livefeed';
import Minimap from '../components/Layout/Pages/Home/Minimap/Minimap';
import PlayerTable from '../components/Layout/Pages/Home/Players/PlayerTable';
import Stats from '../components/Layout/Pages/Home/Statistics/Stats';
import PlayerStatsModal from '../components/Layout/Pages/Home/PlayerStatsModal';
import useAnalysis from '../hooks/Analysis/useAnalysis';
import useStopAnalysis from '../hooks/Analysis/useStopAnalysis';
import useLiveSocket from '../hooks/useLiveSocket';
import Error from '../components/Common/Error/Error';
import useMatches from '../hooks/Matches/useMatches';
import NewConfigModal from '../components/Layout/Pages/Home/NewConfigModal';
import Config from '../components/Layout/Pages/Home/Config/Config';

const Analysis = () => {
  const { data: analysis, status: analysisStatus } = useAnalysis();
  const { data: matches, status: matchesStatus } = useMatches();
  const live = useLiveSocket();
  const useStop = useStopAnalysis();
  const router = useRouter();
  const [detections, setDetections] = useState(true);
  const [heatmap, setHeatmap] = useState(true);
  const [boundaries, setBoundaries] = useState(false);
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(false);

  useEffect(() => {
    if (analysis && !analysis.active) {
      router.push('/');
    }
  }, [analysis, analysisStatus, router]);

  if (analysisStatus === 'loading' || matchesStatus === 'loading' || live === null) {
    return (
      <Center sx={{ height: '100%' }}>
        <Group>
          <Loader />
          <Stack spacing={0}>
            <Text>Starting analysis...</Text>
            <Text size="sm" color="dimmed">Loading models</Text>
          </Stack>
        </Group>
      </Center>
    );
  }


  if (analysisStatus === 'error' || matchesStatus === 'error') {
    return (<Center sx={{ height: '100%' }}><Error /></Center>);
  }

  if (!analysis.active) {
    return (<Center sx={{ height: '100%' }}>No active analysis</Center>);
  }

  return (
    <Container>
      <Grid style={{ height: '100%', margin: 0 }}>
        <Grid.Col span={12}>
          <Paper p="sm" shadow="md">
            <Text
              size="lg"
            >
              {matches.find((match) => match._id === analysis.matchId)?.title}
            </Text>
          </Paper>
        </Grid.Col>
        {config ? (
          <Grid.Col span={12} style={{ height: 'calc(100% - 151.89px)' }}>
            <Config />
          </Grid.Col>
        ) : (
          <>
            <Grid.Col sm={12} md={6} lg={6} style={{ height: 'calc(100% - 151.89px)' }}>
              <Livefeed showDetections={detections} />
            </Grid.Col>
            <Grid.Col sm={12} md={6} lg={6} style={{ height: 'calc(100% - 151.89px)' }}>
              <Minimap heatmap={heatmap} boundaries={boundaries} />
              </Tabs> */}
            </Grid.Col>
          </>
        )}
        <Grid.Col span={12}>
          <Paper p="md" shadow="md">
            <Group dir="row" position="apart">
              <Group dir="row">
                <Button
                  onClick={() => useStop.mutate(analysis.matchId)}
                  leftIcon={<IoStop />}
                  color="red"
                >
                  Stop
                </Button>
                <Button
                  onClick={() => setConfig(!config)}
                  leftIcon={config ? <BiAnalyse /> : <IoCode />}
                >
                  {config ? 'Analysis' : 'Config'}
                </Button>
              </Group>
              {config ? (
                <Button
                  onClick={() => setOpen(true)}
                  leftIcon={<IoSave />}
                >
                  Save as New
                </Button>
              ) : (
                <Group dir="row">
                  <Switch
                    checked={detections}
                    onChange={(v) => setDetections(v.target.checked)}
                    label="Detections"
                  />
                  <Switch
                    checked={heatmap}
                    onChange={(v) => setHeatmap(v.target.checked)}
                    label="Heatmap"
                  />
                  <Switch
                    checked={boundaries}
                    onChange={(v) => setBoundaries(v.target.checked)}
                    label="Boundaries"
                  />
                </Group>
              )}
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
      <PlayerStatsModal />
      <NewConfigModal open={open} setOpen={setOpen} />
    </Container>
  );
};

const Container = styled.div`
  max-height: 100%;
  height: 100%;
`;

export default Analysis;
