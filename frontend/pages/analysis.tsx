import {
  Text, Grid, Button, Switch, Group, Paper
} from '@mantine/core';
import {
  IoCode,
  IoSave,
  IoStop
} from 'react-icons/io5';
import { useState } from 'react';
import { BiAnalyse } from 'react-icons/bi';
import Livefeed from '../components/Pages/Analysis/LiveFeed/Livefeed';
import Minimap from '../components/Pages/Analysis/Minimap/Minimap';
import PlayerStatsModal from '../components/Pages/Analysis/PlayerStatsModal';
import useAnalysis from '../hooks/Analysis/useAnalysis';
import useStopAnalysis from '../hooks/Analysis/useStopAnalysis';
import useMatches from '../hooks/Matches/useMatches';
import NewConfigModal from '../components/Pages/Analysis/NewConfigModal';
import Config from '../components/Pages/Analysis/Config/Config';
import AnalysisSocketProvider from '../contexts/analysis/AnalysisSocketProvider';
import AnalysisWrapper from '../components/Pages/Analysis/AnalysisWrapper';
import Preview from '../components/Pages/Analysis/Config/Preview';

const Analysis = () => {
  const { data: analysis } = useAnalysis();
  const { data: matches } = useMatches();

  const useStop = useStopAnalysis();
  const [detections, setDetections] = useState(true);
  const [heatmap, setHeatmap] = useState(false);
  const [boundaries, setBoundaries] = useState(false);
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(false);

  return (
    <AnalysisSocketProvider>
      <AnalysisWrapper>
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
            <>
              <Grid.Col sm={12} md={12} lg={7} style={{ height: 'calc(100% - 151.89px)' }}>
                <Config />
              </Grid.Col>
              <Grid.Col sm={12} md={12} lg={5} style={{ height: 'calc(100% - 151.89px)' }}>
                <Preview />
              </Grid.Col>
            </>
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
      </AnalysisWrapper>
    </AnalysisSocketProvider>
  );
};

export default Analysis;
