import {
  Group, Slider, Title, Switch, RadioGroup, Radio, RangeSlider, ThemeIcon, Tooltip, ScrollArea, Paper, Text, Overlay
} from '@mantine/core';
import { IoHelp } from 'react-icons/io5';
import useConfig from '../../../../../../hooks/Configs/useConfig';
import useUpdateConfig from '../../../../../../hooks/Configs/useUpdateConfig';

const CrowdMaskSettings = () => {
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
              <Title order={5}>HSV Thresholds</Title>
              <Tooltip
                label="Thresholds used to determine the lower and upper bounds of the mask"
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
            <Text size="sm" color="dimmed" weight={700}>Hue</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={255}
              step={1}
              defaultValue={[config.crowdMask.hsv.lower[0], config.crowdMask.hsv.upper[0]]}
              onChangeEnd={(v) => updateConfig.mutate({
                crowdMask: {
                  hsv: {
                    lower: [v[0], config.crowdMask.hsv.lower[1], config.crowdMask.hsv.lower[2]],
                    upper: [v[1], config.crowdMask.hsv.upper[1], config.crowdMask.hsv.upper[2]]
                  }
                }
              })}
            />
            <Text size="sm" color="dimmed" weight={700}>Saturation</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={255}
              step={1}
              defaultValue={[config.crowdMask.hsv.lower[1], config.crowdMask.hsv.upper[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                crowdMask: {
                  hsv: {
                    lower: [config.crowdMask.hsv.lower[0], v[0], config.crowdMask.hsv.lower[2]],
                    upper: [config.crowdMask.hsv.upper[0], v[1], config.crowdMask.hsv.upper[2]]
                  }
                }
              })}
            />
            <Text size="sm" color="dimmed" weight={700}>Value</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={255}
              step={1}
              defaultValue={[config.crowdMask.hsv.lower[2], config.crowdMask.hsv.upper[2]]}
              onChangeEnd={(v) => updateConfig.mutate({
                crowdMask: {
                  hsv: {
                    lower: [config.crowdMask.hsv.lower[0], config.crowdMask.hsv.lower[1], v[0]],
                    upper: [config.crowdMask.hsv.upper[0], config.crowdMask.hsv.upper[1], v[1]]
                  }
                }
              })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden' }}>
          {!config.crowdMask.erosion.enabled && <Overlay opacity={0.5} color="#000" zIndex={5} />}
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
                  checked={config.crowdMask.erosion.enabled}
                  onChange={(v) => updateConfig.mutate({ crowdMask: { erosion: { enabled: v.target.checked } } })}
                  sx={{ zIndex: 7 }}
                />
              </Group>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Shape</Text>
            <RadioGroup
              defaultValue={config.crowdMask.erosion.shape.toString()}
              onChange={(v) => updateConfig.mutate({ crowdMask: { erosion: { shape: parseInt(v, 10) } } })}
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
              defaultValue={config.crowdMask.erosion.size}
              onChangeEnd={(v) => updateConfig.mutate({ crowdMask: { erosion: { size: v } } })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden' }}>
          {!config.crowdMask.dilation.enabled && <Overlay opacity={0.5} color="#000" zIndex={5} />}
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
                  checked={config.crowdMask.dilation.enabled}
                  onChange={(v) => updateConfig.mutate({ crowdMask: { dilation: { enabled: v.target.checked } } })}
                  sx={{ zIndex: 7 }}
                />
              </Group>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Shape</Text>
            <RadioGroup
              defaultValue={config.crowdMask.dilation.shape.toString()}
              onChange={(v) => updateConfig.mutate({ crowdMask: { dilation: { shape: parseInt(v, 10) } } })}
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
              defaultValue={config.crowdMask.dilation.size}
              onChangeEnd={(v) => updateConfig.mutate({ crowdMask: { dilation: { size: v } } })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden' }}>
          {!config.crowdMask.closing.enabled && <Overlay opacity={0.5} color="#000" zIndex={5} />}
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
                  checked={config.crowdMask.closing.enabled}
                  onChange={(v) => updateConfig.mutate({ crowdMask: { closing: { enabled: v.target.checked } } })}
                  sx={{ zIndex: 7 }}
                />
              </Group>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Shape</Text>
            <RadioGroup
              defaultValue={config.crowdMask.closing.shape.toString()}
              onChange={(v) => updateConfig.mutate({ crowdMask: { closing: { shape: parseInt(v, 10) } } })}
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
              defaultValue={config.crowdMask.closing.size}
              onChangeEnd={(v) => updateConfig.mutate({ crowdMask: { closing: { size: v } } })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden' }}>
          {!config.crowdMask.opening.enabled && <Overlay opacity={0.5} color="#000" zIndex={5} />}
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
                  checked={config.crowdMask.opening.enabled}
                  onChange={(v) => updateConfig.mutate({ crowdMask: { opening: { enabled: v.target.checked } } })}
                  sx={{ zIndex: 7 }}
                />
              </Group>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Shape</Text>
            <RadioGroup
              defaultValue={config.crowdMask.opening.shape.toString()}
              onChange={(v) => updateConfig.mutate({ crowdMask: { opening: { shape: parseInt(v, 10) } } })}
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
              defaultValue={config.crowdMask.opening.size}
              onChangeEnd={(v) => updateConfig.mutate({ crowdMask: { opening: { size: v } } })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md">
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Title order={5}>Misc</Title>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Switch
                label="Invert mask"
                checked={config.crowdMask.invert}
                onChange={(v) => updateConfig.mutate({ crowdMask: { invert: v.target.checked } })}
              />
              <Tooltip
                label="Invert the generated mask"
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
                checked={config.crowdMask.overlap}
                onChange={(v) => updateConfig.mutate({ crowdMask: { overlap: v.target.checked } })}
              />
              <Tooltip
                label="Applies to preview only - Overlaps original frame to help define mask parameters"
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

export default CrowdMaskSettings;
