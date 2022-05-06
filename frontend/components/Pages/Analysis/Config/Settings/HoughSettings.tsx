import {
  Group, Slider, Title, Switch, ThemeIcon, Tooltip, ScrollArea, Paper, Text, Overlay, useMantineColorScheme
} from '@mantine/core';
import { IoHelp } from 'react-icons/io5';
import useConfig from '../../../../../hooks/Configs/useConfig';
import useUpdateConfig from '../../../../../hooks/Configs/useUpdateConfig';

const HoughSettings = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const updateConfig = useUpdateConfig();
  const { data: config } = useConfig();

  return (
    <ScrollArea
      sx={{ height: '100%' }}
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
              <Title order={5}>Hough Thresholds</Title>
              <Tooltip
                label="Thresholds used for hough transform"
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
            <Text size="sm" color="dimmed" weight={700}>Threshold</Text>
            <Slider
              max={255}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.lines.threshold}
              onChangeEnd={(v) => updateConfig.mutate({ lines: { threshold: v } })}
            />
            <Text size="sm" color="dimmed" weight={700}>Minimum Line Length</Text>
            <Slider
              max={255}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.lines.minLineLength}
              onChangeEnd={(v) => updateConfig.mutate({ lines: { minLineLength: v } })}
            />
            <Text size="sm" color="dimmed" weight={700}>Maximum Line Gap</Text>
            <Slider
              max={255}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.lines.maxLineGap}
              onChangeEnd={(v) => updateConfig.mutate({ lines: { maxLineGap: v } })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md" sx={{ position: 'relative', overflow: 'hidden' }}>
          {!config.lines.prune.enabled && <Overlay opacity={dark ? 0.5 : 0.15} color="#000" zIndex={5} />}
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>Prune Lines</Title>
              <Group direction="row">
                <Tooltip
                  label="Settings used for pruning detected lines"
                  transition="pop"
                  withArrow
                  wrapLines
                  width={220}
                >
                  <ThemeIcon variant="light" radius="xl" size="xs" sx={{ cursor: 'pointer', zIndex: 22345 }}>
                    <IoHelp />
                  </ThemeIcon>
                </Tooltip>
                <Switch
                  checked={config.lines.prune.enabled}
                  onChange={(v) => updateConfig.mutate({ lines: { prune: { enabled: v.target.checked } } })}
                  sx={{ zIndex: 7 }}
                />
              </Group>
            </Group>
            <Text size="sm" color="dimmed" weight={700}>Minimum Distance</Text>
            <Slider
              max={255}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.lines.prune.minDistance}
              onChangeEnd={(v) => updateConfig.mutate({ lines: { prune: { minDistance: v } } })}
            />
            <Text size="sm" color="dimmed" weight={700}>Minimum Angle</Text>
            <Slider
              max={255}
              step={1}
              min={0}
              sx={{ width: '100%' }}
              defaultValue={config.lines.prune.minAngle}
              onChangeEnd={(v) => updateConfig.mutate({ lines: { prune: { minAngle: v } } })}
            />
          </Group>
        </Paper>
        {/* <Paper shadow="md" radius="md" p="md">
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Title order={5}>Misc</Title>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Switch
                label="Prune lines"
                checked={config.lines.prune}
                onChange={(v) => updateConfig.mutate({ lines: { prune: v.target.checked } })}
              />
              <Tooltip
                label="Automatically filter and merge similar lines"
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
        </Paper> */}
      </Group>
    </ScrollArea>
  );
};

export default HoughSettings;
