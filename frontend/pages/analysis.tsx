import {
  Text, Grid, Button, Switch, Group, Paper, Select
} from '@mantine/core';
import {
  IoPause,
  IoPlay,
  IoSave,
  IoSettingsOutline,
  IoStop
} from 'react-icons/io5';
import { useState } from 'react';
import { BiAnalyse } from 'react-icons/bi';
import Livefeed from '../components/Pages/Analysis/LiveFeed/Livefeed';
import Minimap from '../components/Pages/Analysis/Minimap/Minimap';
// import PlayerTable from '../components/Layout/Pages/Home/Players/PlayerTable';
// import Stats from '../components/Layout/Pages/Home/Statistics/Stats';
import PlayerStatsModal from '../components/Pages/Analysis/PlayerStatsModal';
import useAnalysis from '../hooks/Analysis/useAnalysis';
import useStopAnalysis from '../hooks/Analysis/useStopAnalysis';
import useMatches from '../hooks/Matches/useMatches';
import NewConfigModal from '../components/Pages/Analysis/NewConfigModal';
import Config from '../components/Pages/Analysis/Config/Config';
import AnalysisSocketProvider from '../contexts/analysis/AnalysisSocketProvider';
import AnalysisWrapper from '../components/Pages/Analysis/AnalysisWrapper';
import Preview from '../components/Pages/Analysis/Config/Preview';
import useUpdateConfig from '../hooks/Configs/useUpdateConfig';

const Analysis = () => {
  const { data: analysis } = useAnalysis();
  const { data: matches } = useMatches();
  const updateConfig = useUpdateConfig();

  const useStop = useStopAnalysis();
  const [detections, setDetections] = useState(true);
  const [heatmap, setHeatmap] = useState(false);
  const [boundaries, setBoundaries] = useState(true);
  const [performance, setPerformance] = useState(false);
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState(false);
  const [paused, setPaused] = useState(false);
  const [team, setTeam] = useState('both');

  const pauseAnalysis = () => {
    updateConfig.mutate({ analysis: { paused: !paused } });
    setPaused(!paused);
  };

  return (
    <AnalysisSocketProvider>
      <AnalysisWrapper stopped={useStop.isLoading || useStop.isSuccess}>
        <Grid style={{ height: '100%', margin: 0 }}>
          <Grid.Col span={12}>
            <Paper p="sm" shadow="md">
              <Group dir="row" position="apart">
                <Text
                  size="lg"
                >
                  {matches.find((match) => match._id === analysis.matchId)?.title}
                </Text>
                <Group dir="row" position="apart">
                  <Switch
                    checked={performance}
                    onChange={(v) => setPerformance(v.target.checked)}
                    label="Performance Mode"
                  />
                  <Button
                    onClick={() => setConfig(!config)}
                    leftIcon={config ? <BiAnalyse /> : <IoSettingsOutline />}
                  >
                    {config ? 'Analysis' : 'Config'}
                  </Button>
                </Group>
              </Group>
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
                <Livefeed showDetections={detections} performance={performance} />
              </Grid.Col>
              <Grid.Col sm={12} md={6} lg={6} style={{ height: 'calc(100% - 151.89px)' }}>
                <Minimap heatmap={heatmap} boundaries={boundaries} team={team} performance={performance} />
              </Grid.Col>
            </>
          )}
          {/* <Grid.Col span={12}>
          <PlayerTable />
        </Grid.Col> */}
          <Grid.Col span={12}>
            <Paper p="md" shadow="md">
              <Group dir="row" position="apart">
                <Group dir="row">
                  <Button
                    onClick={pauseAnalysis}
                    leftIcon={paused ? <IoPlay /> : <IoPause />}
                    color={paused ? 'green' : 'violet'}
                  >
                    {paused ? 'Play' : 'Pause'}
                  </Button>
                  <Button
                    onClick={() => useStop.mutate(analysis.matchId)}
                    leftIcon={<IoStop />}
                    color="red"
                  >
                    Stop
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
                    {heatmap && (
                      <Select
                        placeholder="Pick team"
                        value={team}
                        onChange={setTeam}
                        data={[
                          { value: 'both', label: 'Both Teams' },
                          { value: '1', label: 'Team 1' },
                          { value: '2', label: 'Team 2' },
                          { value: 'ball', label: 'Football' }
                        ]}
                      />
                    )}
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
