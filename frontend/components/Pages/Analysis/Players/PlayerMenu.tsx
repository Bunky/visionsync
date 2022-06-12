import { Menu, Divider } from '@mantine/core';
import {
  IoTrash,
  IoPencil,
  IoStatsChart,
  IoFlashlight,
} from 'react-icons/io5';

const PlayerMenu = () => (
  <Menu
    menuButtonLabel="Player Options"
  >
    <Menu.Label>Player</Menu.Label>
    <Menu.Item icon={<IoPencil size={14} />}>Edit Player</Menu.Item>
    <Menu.Item icon={<IoStatsChart size={14} />}>Statistics</Menu.Item>
    <Menu.Item icon={<IoFlashlight size={14} />}>Highlight</Menu.Item>
    <Divider />
    <Menu.Label>Danger Zone</Menu.Label>
    <Menu.Item color="red" icon={<IoTrash size={14} />}>Delete Player</Menu.Item>
  </Menu>
);

export default PlayerMenu;
