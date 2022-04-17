import { useEffect } from 'react';
import styled from 'styled-components';
import {
  Group, Paper, Title, Switch, Overlay, Select
} from '@mantine/core';
import useConfig from '../../../../../hooks/useConfig';
import useSettingsSocket from '../../../../../hooks/useSettingsSocket';
import useUpdateConfig from '../../../../../hooks/useUpdateConfig';

const Preview = () => {
  const { data: config } = useConfig();
  const socket = useSettingsSocket();
  const updateConfig = useUpdateConfig();

  useEffect(() => {
    document.getElementById('preview').setAttribute('src', `data:image/jpeg;base64,${socket.preview}`);
    document.getElementById('result').setAttribute('src', `data:image/jpeg;base64,${socket.result}`);
  }, [socket]);

  return (
    <Group direction="column" spacing="xs" sx={{ height: '100%' }} noWrap>
      <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
        {!config.preview.enabled && <Overlay opacity={0.5} color="#000" zIndex={5} />}
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
          {/* <AspectRatio ratio={16/9}> */}
          <PreviewWindow id="preview" width="640" height="360" />
          {/* </AspectRatio> */}
        </Group>
      </Paper>
      <Paper shadow="md" radius="md" p="md" sx={{ width: '100%' }}>
        <Group direction="column" spacing="xs">
          <Title order={5}>Result</Title>
          {/* <AspectRatio ratio={16/9}> */}
          <PreviewWindow id="result" width="640" height="360" />
          {/* </AspectRatio> */}
        </Group>
      </Paper>
    </Group>
  );
};

const PreviewWindow = styled.img`
  border-radius: .25rem;
  width: 100%;
  height: 100%;
`;

export default Preview;
