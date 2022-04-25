import {
  ScrollArea, Table, Button, Group, createStyles
} from '@mantine/core';
import { IoVideocam } from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import PlayerMenu from './PlayerMenu';
import useDetectionSocket from '../../../../../hooks/useDetectionSocket';
import playerStatModalState from '../../../../../atoms/playerStatModalState';
import { useInterval } from '@mantine/hooks';

const useStyles = createStyles((theme) => ({
  header: {
    boxShadow: theme.shadows.sm,
    position: 'sticky',
    top: 0,
    backgroundColor: theme.colors.dark[8],
    zIndex: 1,
    transition: 'box-shadow 150ms ease',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${
        theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
      }`,
    },
  }
}));

const PlayerTable = () => {
  const { detections } = useDetectionSocket();
  const [, setModal] = useRecoilState(playerStatModalState);
  const { classes, cx } = useStyles();
  const [debouncedDetections, setDebouncedDetections] = useState([]);
  const [counter, setCounter] = useState(0);
  const interval = useInterval(() => setCounter((s) => s + 1), 1000);

  useEffect(() => {
    interval.start();
    return interval.stop;
  }, []);

  useEffect(() => {
    setDebouncedDetections(detections);
  }, [counter]);

  const rows = debouncedDetections.map((player, index) => (
    <tr key={`${player.name}-${player.confidence}`}>
      <td>{player.name}</td>
      <td>{player.confidence}</td>
      <td>
        <Group position="right">
          <Button
            leftIcon={<IoVideocam />}
            compact
            onClick={() => setModal({
              open: true,
              playerId: index
            })}
          >
            View
          </Button>
          <PlayerMenu />
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea sx={{ height: 600 }} offsetScrollbars>
      <Table verticalSpacing="xs">
        <thead className={cx(classes.header)}>
          <tr>
            <th>Detection</th>
            <th>Confidence</th>
            <th>
              <Group position="right">
                Actions
              </Group>
            </th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
};

export default PlayerTable;
