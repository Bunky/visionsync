import {
  Group, Title, ThemeIcon, Tooltip, ScrollArea, Paper, Text, RangeSlider
} from '@mantine/core';
import { IoHelp } from 'react-icons/io5';
import useConfig from '../../../../../hooks/Configs/useConfig';
import useUpdateConfig from '../../../../../hooks/Configs/useUpdateConfig';

const LineClassification = () => {
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
              <Title order={5}>Centre Line (Dark Blue)</Title>
              <Tooltip
                label="Thresholds used for line classification"
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
            <Text size="sm" color="dimmed" weight={700}>Angle</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={180}
              step={1}
              defaultValue={[config.lineClassifications.centre.angle[0], config.lineClassifications.centre.angle[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  centre: {
                    angle: [v[0], v[1]],
                    length: [config.lineClassifications.centre.length[0], config.lineClassifications.centre.length[1]]
                  }
                }
              })}
            />
            <Text size="sm" color="dimmed" weight={700}>Length</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={1000}
              step={1}
              defaultValue={[config.lineClassifications.centre.length[0], config.lineClassifications.centre.length[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  centre: {
                    angle: [config.lineClassifications.centre.angle[0], config.lineClassifications.centre.angle[1]],
                    length: [v[0], v[1]]
                  }
                }
              })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md">
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>Side Line (Yellow)</Title>
              <Tooltip
                label="Thresholds used for line classification"
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
            <Text size="sm" color="dimmed" weight={700}>Angle</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={180}
              step={1}
              defaultValue={[config.lineClassifications.side.angle[0], config.lineClassifications.side.angle[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  side: {
                    angle: [v[0], v[1]],
                    length: [config.lineClassifications.side.length[0], config.lineClassifications.side.length[1]]
                  }
                }
              })}
            />
            <Text size="sm" color="dimmed" weight={700}>Length</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={1000}
              step={1}
              defaultValue={[config.lineClassifications.side.length[0], config.lineClassifications.side.length[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  side: {
                    angle: [config.lineClassifications.side.angle[0], config.lineClassifications.side.angle[1]],
                    length: [v[0], v[1]]
                  }
                }
              })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md">
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>Goal Line (Green)</Title>
              <Tooltip
                label="Thresholds used for line classification"
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
            <Text size="sm" color="dimmed" weight={700}>Angle</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={180}
              step={1}
              defaultValue={[config.lineClassifications.goal.angle[0], config.lineClassifications.goal.angle[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  goal: {
                    angle: [v[0], v[1]],
                    length: [config.lineClassifications.goal.length[0], config.lineClassifications.goal.length[1]]
                  }
                }
              })}
            />
            <Text size="sm" color="dimmed" weight={700}>Length</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={1000}
              step={1}
              defaultValue={[config.lineClassifications.goal.length[0], config.lineClassifications.goal.length[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  goal: {
                    angle: [config.lineClassifications.goal.angle[0], config.lineClassifications.goal.angle[1]],
                    length: [v[0], v[1]]
                  }
                }
              })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md">
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>18 Yard Line (Red)</Title>
              <Tooltip
                label="Thresholds used for line classification"
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
            <Text size="sm" color="dimmed" weight={700}>Angle</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={180}
              step={1}
              defaultValue={[config.lineClassifications.penaltyBox.angle[0], config.lineClassifications.penaltyBox.angle[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  penaltyBox: {
                    angle: [v[0], v[1]],
                    length: [config.lineClassifications.penaltyBox.length[0], config.lineClassifications.penaltyBox.length[1]]
                  }
                }
              })}
            />
            <Text size="sm" color="dimmed" weight={700}>Length</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={1000}
              step={1}
              defaultValue={[config.lineClassifications.penaltyBox.length[0], config.lineClassifications.penaltyBox.length[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  penaltyBox: {
                    angle: [config.lineClassifications.penaltyBox.angle[0], config.lineClassifications.penaltyBox.angle[1]],
                    length: [v[0], v[1]]
                  }
                }
              })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md">
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>Box Side Line (Cyan)</Title>
              <Tooltip
                label="Thresholds used for line classification"
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
            <Text size="sm" color="dimmed" weight={700}>Angle</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={180}
              step={1}
              defaultValue={[config.lineClassifications.penaltyBoxSide.angle[0], config.lineClassifications.penaltyBoxSide.angle[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  penaltyBoxSide: {
                    angle: [v[0], v[1]],
                    length: [config.lineClassifications.penaltyBoxSide.length[0], config.lineClassifications.penaltyBoxSide.length[1]]
                  }
                }
              })}
            />
            <Text size="sm" color="dimmed" weight={700}>Length</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={1000}
              step={1}
              defaultValue={[config.lineClassifications.penaltyBoxSide.length[0], config.lineClassifications.penaltyBoxSide.length[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  penaltyBoxSide: {
                    angle: [config.lineClassifications.penaltyBoxSide.angle[0], config.lineClassifications.penaltyBoxSide.angle[1]],
                    length: [v[0], v[1]]
                  }
                }
              })}
            />
          </Group>
        </Paper>
        <Paper shadow="md" radius="md" p="md">
          <Group position="left" direction="column" spacing="xs" sx={{ width: '100%' }}>
            <Group position="apart" direction="row" sx={{ width: '100%' }}>
              <Title order={5}>6 Yard Line (Purple)</Title>
              <Tooltip
                label="Thresholds used for line classification"
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
            <Text size="sm" color="dimmed" weight={700}>Angle</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={180}
              step={1}
              defaultValue={[config.lineClassifications.sixYardLine.angle[0], config.lineClassifications.sixYardLine.angle[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  sixYardLine: {
                    angle: [v[0], v[1]],
                    length: [config.lineClassifications.sixYardLine.length[0], config.lineClassifications.sixYardLine.length[1]]
                  }
                }
              })}
            />
            <Text size="sm" color="dimmed" weight={700}>Length</Text>
            <RangeSlider
              sx={{ width: '100%' }}
              min={0}
              max={1000}
              step={1}
              defaultValue={[config.lineClassifications.sixYardLine.length[0], config.lineClassifications.sixYardLine.length[1]]}
              onChangeEnd={(v) => updateConfig.mutate({
                lineClassifications: {
                  sixYardLine: {
                    angle: [config.lineClassifications.sixYardLine.angle[0], config.lineClassifications.sixYardLine.angle[1]],
                    length: [v[0], v[1]]
                  }
                }
              })}
            />
          </Group>
        </Paper>
      </Group>
    </ScrollArea>
  );
};

export default LineClassification;
