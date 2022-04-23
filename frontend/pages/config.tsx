import styled from 'styled-components';
import {
  Tabs, Grid, Loader, Group, Center
} from '@mantine/core';
import {
  IoCodeSlashSharp,
  IoLinkOutline,
  IoMan,
  IoPeople, IoSyncCircle, IoTv
} from 'react-icons/io5';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import CrowdMaskSettings from '../components/Layout/Pages/Config/Settings/CrowdMaskSettings';
import Preview from '../components/Layout/Pages/Config/Preview/Preview';
import PlayerMaskSettings from '../components/Layout/Pages/Config/Settings/PlayerMaskSettings';
import CannySettings from '../components/Layout/Pages/Config/Settings/CannySettings';
import HoughSettings from '../components/Layout/Pages/Config/Settings/HoughSettings';
import useConfig from '../hooks/Configs/useConfig';
import useUpdateConfig from '../hooks/Configs/useUpdateConfig';
import useAnalysis from '../hooks/Analysis/useAnalysis';

const Config = () => {
  const { data: analysis, status: analysisStatus } = useAnalysis();
  const { data: config, status: configStatus } = useConfig();
  const updateConfig = useUpdateConfig();
  const router = useRouter();

  useEffect(() => {
    if (analysisStatus === 'success' && !analysis.active) {
      router.push('/');
    }
  }, [analysis, analysisStatus, router]);

  const updatePreview = (index) => {
    if (config.preview.follow) {
      let stage;
      switch (index) {
        case 0:
          stage = 'crowdMask';
          break;
        case 1:
          stage = 'playerMask';
          break;
        case 2:
          stage = 'canny';
          break;
        case 3:
          stage = 'lines';
          break;
        case 4:
          stage = 'circles';
          break;
        case 5:
          stage = 'intersections';
          break;
        case 6:
          stage = 'homography';
          break;
        case 7:
          stage = 'detections';
          break;
        default:
          break;
      }
      if (stage) {
        updateConfig.mutate({ preview: { stage } });
      }
    }
  };

  if (configStatus === 'loading' || analysisStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (configStatus === 'error' || analysisStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  if (!analysis.active) {
    return (<Center sx={{ height: '100%' }}>No active analysis</Center>);
  }

  return (
    <Container>
      <Grid sx={{ height: '100%', margin: 0 }}>
        <Grid.Col span={7} sx={{ height: '100%' }}>
          <Group direction="row" sx={{ height: '100%' }} noWrap>
            <Tabs
              orientation="vertical"
              sx={{ height: '100%', width: '100%' }}
              styles={{
                body: {
                  width: '100%'
                },
                tabsListWrapper: {
                  width: '100%'
                },
                tabLabel: {
                  whiteSpace: 'nowrap'
                }
              }}
              onTabChange={updatePreview}
            >
              <Tabs.Tab label="Crowd Mask" icon={<IoPeople />}><CrowdMaskSettings /></Tabs.Tab>
              <Tabs.Tab label="Player Mask" icon={<IoMan />}><PlayerMaskSettings /></Tabs.Tab>
              <Tabs.Tab label="Canny" icon={<IoLinkOutline />}><CannySettings /></Tabs.Tab>
              <Tabs.Tab label="Hough Transform" icon={<IoTv />}><HoughSettings /></Tabs.Tab>
              <Tabs.Tab label="Line Classification" icon={<IoCodeSlashSharp />}>Sliders to define lines etc</Tabs.Tab>
              <Tabs.Tab label="Intersections" icon={<IoSyncCircle />}>Intersections</Tabs.Tab>
            </Tabs>
            {/* <Divider orientation='vertical' /> */}
          </Group>
        </Grid.Col>
        <Grid.Col span={5} sx={{ height: '100%' }}>
          <Preview />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

const Container = styled.div`
  height: calc(100vh - 70px - 32px);
  max-height: calc(100vh - 70px - 32px);
  overflow: hidden;
`;

export default Config;
