import { useState } from 'react';
import styled from 'styled-components';
import {
  ScrollArea, Table, Button, Group, createStyles
} from '@mantine/core';
import { IoVideocam } from 'react-icons/io5';
import PlayerMenu from './PlayerMenu';
import usePlayerStatModal from '../../../../../hooks/usePlayerStatModal';
import useTempDetections from '../../../../../hooks/useTempDetections';

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
  const [tempDetections] = useTempDetections();
  const [state, setState] = usePlayerStatModal();
  const { classes, cx } = useStyles();
  
  const rows = tempDetections.map((player, index) => (
    <tr key={player.name}>
      <td>{player.name}</td>
      <td>{player.position}</td>
      <td>
        <Group position="right">
          <Button leftIcon={<IoVideocam />} compact onClick={() => setState({
            open: true,
            playerId: index
          })}>
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
            <th>Player</th>
            <th>Position</th>
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