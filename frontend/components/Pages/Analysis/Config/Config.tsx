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
import CrowdMaskSettings from './Settings/CrowdMaskSettings';
import Preview from './Preview';
import PlayerMaskSettings from './Settings/PlayerMaskSettings';
import CannySettings from './Settings/CannySettings';
import HoughSettings from './Settings/HoughSettings';
import useConfig from '../../../../hooks/Configs/useConfig';
import useUpdateConfig from '../../../../hooks/Configs/useUpdateConfig';
import Error from '../../../Common/Error/Error';

const Config = () => {
  const { data: config, status: configStatus } = useConfig();
  const updateConfig = useUpdateConfig();

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

  if (configStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (configStatus === 'error') {
    return (<Center sx={{ height: '100%' }}><Error /></Center>);
  }

  return (
    <Container dir="row" noWrap>
      <Tabs
        orientation="vertical"
        sx={{ height: '100%', width: '100%' }}
        styles={{
          body: {
            width: '100%'
          },
          tabsListWrapper: {
            width: 200
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
      <Preview />
    </Container>
  );
};

const Container = styled(Group)`
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  align-items: flex-start;
`;

export default Config;
