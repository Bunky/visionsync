import { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Group, Slider, Title, Switch, RadioGroup, Radio, RangeSlider, ThemeIcon, Tooltip, ScrollArea, Paper, Text, Loader, Overlay
} from '@mantine/core';
import useConfig from '../../../../../hooks/useConfig';
import { IoHelp } from 'react-icons/io5';
import useUpdateConfig from '../../../../../hooks/useUpdateConfig';

const CannySettings = () => {
  const updateConfig = useUpdateConfig();
  const { data: config } = useConfig();

  return (
    <ScrollArea
      sx={{ width: 'calc(60vw - 389px)', height: '100%' }}
      styles={{
        scrollbar: {
          zIndex: 6
        }
      }}
    >
      <Group direction="column" grow>
        <Paper shadow="md" radius="md" p="md">
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>Canny Thresholds</Title>
              <Tooltip
                label="Thresholds used for canny edge detection"
                transition="pop"
                withArrow
                wrapLines
                width={220}
              >
                <ThemeIcon variant="light" radius="xl" size="xs" sx={{ cursor: 'pointer', zIndex: 22345 }}>
                  <IoHelp />
                </ThemeIcon>
              </Tooltip>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Threshold One</Text>
            <Slider
              max={255}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.canny.thresholdOne}
              onChangeEnd={(v) => updateConfig.mutate({ canny: { thresholdOne: v }})}
            />
            <Text size="sm" color="dimmed" weight={700}>Threshold Two</Text>
            <Slider
              max={255}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.canny.thresholdTwo}
              onChangeEnd={(v) => updateConfig.mutate({ canny: { thresholdTwo: v }})}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden' }}>
          {!config.canny.blur.enabled && <Overlay opacity={0.5} color="#000" zIndex={5} />}
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>Blur</Title>
              <Group direction="row">
                <Tooltip
                  label="Blur the input frame to reduce noise in the output of canny"
                  transition="pop"
                  withArrow
                  wrapLines
                  width={220}
                  sx={{ display: 'flex' }}
                >
                  <ThemeIcon variant="light" radius="xl" size="xs" sx={{ cursor: 'pointer' }}>
                    <IoHelp />
                  </ThemeIcon>
                </Tooltip>
                <Switch
                  checked={config.canny.blur.enabled}
                  onChange={(v) => updateConfig.mutate({ canny: { blur: { enabled: v.target.checked }}})}
                  sx={{ zIndex: 7 }}
                />
              </Group>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Size</Text>
            <Slider
              max={50}
              step={1}
              min={1}
              sx={{ width: '100%' }}
              defaultValue={config.canny.blur.size}
              onChangeEnd={(v) => updateConfig.mutate({ canny: { blur: { size: v } }})}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden' }}>
          {!config.canny.closing.enabled && <Overlay opacity={0.5} color="#000" zIndex={5} />}
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>Closing</Title>
              <Group direction="row">
                <Tooltip
                  label="Closing is the contraction of the mask"
                  transition="pop"
                  withArrow
                  wrapLines
                  width={220}
                  sx={{ display: 'flex' }}
                >
                  <ThemeIcon variant="light" radius="xl" size="xs" sx={{ cursor: 'pointer' }}>
                    <IoHelp />
                  </ThemeIcon>
                </Tooltip>
                <Switch
                  checked={config.canny.closing.enabled}
                  onChange={(v) => updateConfig.mutate({ canny: { closing: { enabled: v.target.checked }}})}
                  sx={{ zIndex: 7 }}
                />
              </Group>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Shape</Text>
            <RadioGroup
              defaultValue={config.canny.closing.shape.toString()}
              onChange={(v) => updateConfig.mutate({ canny: { closing: { shape: parseInt(v) }}})}
              style={{ marginTop: -5 }}
            >
              <Radio value="0" label="Square" />
              <Radio value="1" label="Plus" />
              <Radio value="2" label="Circle" />
            </RadioGroup>
            <Text size="sm" color="dimmed" weight={700}>Size</Text>
            <Slider
              max={20}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.canny.closing.size}
              onChangeEnd={(v) => updateConfig.mutate({ canny: { closing: { size: v }}})}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden' }}>
          {!config.canny.opening.enabled && <Overlay opacity={0.5} color="#000" zIndex={5} />}
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>Opening</Title>
              <Group direction="row">
                <Tooltip
                  label="Opening is the contraction of the mask"
                  transition="pop"
                  withArrow
                  wrapLines
                  width={220}
                  sx={{ display: 'flex' }}
                >
                  <ThemeIcon variant="light" radius="xl" size="xs" sx={{ cursor: 'pointer' }}>
                    <IoHelp />
                  </ThemeIcon>
                </Tooltip>
                <Switch
                  checked={config.canny.opening.enabled}
                  onChange={(v) => updateConfig.mutate({ canny: { opening: { enabled: v.target.checked }}})}
                  sx={{ zIndex: 7 }}
                />
              </Group>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Shape</Text>
            <RadioGroup
              defaultValue={config.canny.opening.shape.toString()}
              onChange={(v) => updateConfig.mutate({ canny: { opening: { shape: parseInt(v) }}})}
              style={{ marginTop: -5 }}
            >
              <Radio value="0" label="Square" />
              <Radio value="1" label="Plus" />
              <Radio value="2" label="Circle" />
            </RadioGroup>
            <Text size="sm" color="dimmed" weight={700}>Size</Text>
            <Slider
              max={20}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.canny.opening.size}
              onChangeEnd={(v) => updateConfig.mutate({ canny: { opening: { size: v }}})}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden' }}>
          {!config.canny.erosion.enabled && <Overlay opacity={0.5} color="#000" zIndex={5} />}
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>Erosion</Title>
              <Group direction="row">
                <Tooltip
                  label="Erosion is the expansion of the mask"
                  transition="pop"
                  withArrow
                  wrapLines
                  width={220}
                  sx={{ display: 'flex' }}
                >
                  <ThemeIcon variant="light" radius="xl" size="xs" sx={{ cursor: 'pointer' }}>
                    <IoHelp />
                  </ThemeIcon>
                </Tooltip>
                <Switch
                  checked={config.canny.erosion.enabled}
                  onChange={(v) => updateConfig.mutate({ canny: { erosion: { enabled: v.target.checked }}})}
                  sx={{ zIndex: 7 }}
                />
              </Group>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Shape</Text>
            <RadioGroup
              defaultValue={config.canny.erosion.shape.toString()}
              onChange={(v) => updateConfig.mutate({ canny: { erosion: { shape: parseInt(v) }}})}
              style={{ marginTop: -5 }}
            >
              <Radio value="0" label="Square" />
              <Radio value="1" label="Plus" />
              <Radio value="2" label="Circle" />
            </RadioGroup>
            <Text size="sm" color="dimmed" weight={700}>Size</Text>
            <Slider
              max={20}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.canny.erosion.size}
              onChangeEnd={(v) => updateConfig.mutate({ canny: { erosion: { size: v } }})}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden' }}>
          {!config.canny.dilation.enabled && <Overlay opacity={0.5} color="#000" zIndex={5} />}
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>Dilation</Title>
              <Group direction="row">
                <Tooltip
                  label="Dilation is the contraction of the mask"
                  transition="pop"
                  withArrow
                  wrapLines
                  width={220}
                  sx={{ display: 'flex' }}
                >
                  <ThemeIcon variant="light" radius="xl" size="xs" sx={{ cursor: 'pointer' }}>
                    <IoHelp />
                  </ThemeIcon>
                </Tooltip>
                <Switch
                  checked={config.canny.dilation.enabled}
                  onChange={(v) => updateConfig.mutate({ canny: { dilation: { enabled: v.target.checked }}})}
                  sx={{ zIndex: 7 }}
                />
              </Group>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Shape</Text>
            <RadioGroup
              defaultValue={config.canny.dilation.shape.toString()}
              onChange={(v) => updateConfig.mutate({ canny: { dilation: { shape: parseInt(v) }}})}
              style={{ marginTop: -5 }}
            >
              <Radio value="0" label="Square" />
              <Radio value="1" label="Plus" />
              <Radio value="2" label="Circle" />
            </RadioGroup>
            <Text size="sm" color="dimmed" weight={700}>Size</Text>
            <Slider
              max={20}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.canny.dilation.size}
              onChangeEnd={(v) => updateConfig.mutate({ canny: { dilation: { size: v }}})}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md">
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Title order={5}>Misc</Title>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Switch
                label="Mask preview"
                checked={config.canny.masked}
                onChange={(v) => updateConfig.mutate({ canny: { masked: v.target.checked }})}
              />
              <Tooltip
                label="Applies to preview only - Applies the masks to the preview"
                transition="pop"
                withArrow
                wrapLines
                width={220}
              >
                <ThemeIcon variant="light" radius="xl" size="xs" sx={{ cursor: 'pointer' }}>
                  <IoHelp />
                </ThemeIcon>
              </Tooltip>
            </Group>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Switch
                label="Overlap footage"
                checked={config.canny.overlap}
                onChange={(v) => updateConfig.mutate({ canny: { overlap: v.target.checked }})}
              />
              <Tooltip
                label="Applies to preview only - Overlaps original frame to help define canny parameters"
                transition="pop"
                withArrow
                wrapLines
                width={220}
              >
                <ThemeIcon variant="light" radius="xl" size="xs" sx={{ cursor: 'pointer' }}>
                  <IoHelp />
                </ThemeIcon>
              </Tooltip>
            </Group>
          </Group>
        </Paper>
      </Group>
    </ScrollArea>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default CannySettings;
