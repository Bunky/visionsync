import { useEffect } from 'react';
import styled from 'styled-components';
import {
  Group, Paper, Title, Switch, Overlay, Select, useMantineColorScheme
} from '@mantine/core';
import useConfig from '../../../../hooks/Configs/useConfig';
import useSettingsSocket from '../../../../hooks/useSettingsSocket';
import useUpdateConfig from '../../../../hooks/Configs/useUpdateConfig';

const Preview = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const { data: config } = useConfig();
  const socket = useSettingsSocket();
  const updateConfig = useUpdateConfig();

  useEffect(() => {
    document.getElementById('preview').setAttribute('src', `data:image/jpeg;base64,${socket}`);
  }, [socket]);

  return (
    <Paper
      shadow="md"
      radius="md"
      p="md"
      sx={{
        position: 'relative', overflow: 'hidden', minWidth: '40%'
      }}
    >
      {!config.preview.enabled && <Overlay opacity={dark ? 0.5 : 0.15} color="#000" zIndex={5} />}
      <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
        <Group position="apart" direction="row" sx={{ width: '100%' }}>
          <Title order={5}>Stage Preview</Title>
          <Group direction="row">
            <Switch
              checked={config.preview.follow}
              onChange={(v) => updateConfig.mutate({ preview: { follow: v.target.checked } })}
              sx={{ zIndex: 7 }}
              label="Follow"
            />
            <Select
              placeholder="Pick stage"
              defaultValue={config.preview.stage}
              onChange={(v) => updateConfig.mutate({
                preview: {
                  stage: v
                }
              })}
              data={[
                { value: 'crowdMask', label: 'Crowd Mask' },
                { value: 'playerMask', label: 'Player Mask' },
                { value: 'canny', label: 'Canny' },
                { value: 'lines', label: 'Hough Transform' },
                { value: 'circles', label: 'Hough Circles' },
                { value: 'intersections', label: 'Intersections' },
                { value: 'homography', label: 'Homography' },
                { value: 'detections', label: 'Players' }
              ]}
            />
            <Switch
              checked={config.preview.enabled}
              onChange={(v) => updateConfig.mutate({ preview: { enabled: v.target.checked } })}
              sx={{ zIndex: 7 }}
            />
          </Group>
        </Group>
        <PreviewWindow id="preview" width="640" height="360" />
      </Group>
    </Paper>
  );
};

const PreviewWindow = styled.img`
  border-radius: 8px;
  width: 100%;
  height: 100%;
`;

export default Preview;
