import styled from 'styled-components';
import {
  Tabs, Grid, Loader, Group, Center
} from '@mantine/core';
import {
  IoCodeSlashSharp,
  IoLinkOutline,
  IoMan,
  IoPeople, IoTv
} from 'react-icons/io5';
import {
  useQueryClient, useMutation,
} from 'react-query';
import _ from 'lodash';
import CrowdMaskSettings from '../components/Layout/Pages/Config/Settings/CrowdMaskSettings';
import Preview from '../components/Layout/Pages/Config/Preview/Preview';
import PlayerMaskSettings from '../components/Layout/Pages/Config/Settings/PlayerMaskSettings';
import CannySettings from '../components/Layout/Pages/Config/Settings/CannySettings';
import HoughSettings from '../components/Layout/Pages/Config/Settings/HoughSettings';
import useConfig from '../hooks/useConfig';
import updateConfig from '../mutations/updateConfig';

const Config = () => {
  const queryClient = useQueryClient();
  const { data: config, status: configStatus } = useConfig();

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
        default:
          break;
      }
      if (stage) {
        mutateConfig.mutate({ preview: { stage } });
      }
    }
  };

  const mutateConfig = useMutation(updateConfig, {
    onMutate: async (updatedSetting) => {
      await queryClient.cancelQueries('config');
      const previousConfig = queryClient.getQueryData('config');

      queryClient.setQueryData('config', _.merge(previousConfig, updatedSetting));
      return { previousConfig };
    },
    onError: (err, updatedSetting, context: any) => {
      // notif.basic('error', t('errors:ftup'), err.toString());
      queryClient.setQueryData('config', context.previousConfig);
    },
    onSuccess: (res, updatedSetting, context: any) => {
      if (res.status === 429) {
        // notif.basic('error', t('errors:ftup'), t('errors:tmr'));
        queryClient.setQueryData('config', context.previousConfig);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('config');
    }
  });

  if (configStatus === 'loading' && config === undefined) {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (configStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
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
