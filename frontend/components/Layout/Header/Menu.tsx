import { useState } from 'react';
import {
  Text, Menu as Dropdown, Divider
} from '@mantine/core';
import {
  IoSettingsOutline, IoSearchOutline, IoLogOutOutline
} from 'react-icons/io5';
import useUser from '../../../hooks/useUser';
import User from './User';

const Menu = () => {
  const { data: user, status } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      control={<User name={status === 'success' && user.name} />}
      opened={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      <Dropdown.Label>Application</Dropdown.Label>
      <Dropdown.Item
        icon={<IoSearchOutline />}
        rightSection={<Text size="xs" color="dimmed">⌘K</Text>}
      >
        Search
      </Dropdown.Item>
      <Dropdown.Item icon={<IoSettingsOutline />}>Settings</Dropdown.Item>

      <Divider />

      <Dropdown.Label>Account</Dropdown.Label>
      <Dropdown.Item icon={<IoSettingsOutline />}>User Settings</Dropdown.Item>
      <Dropdown.Item icon={<IoLogOutOutline />}>Logout</Dropdown.Item>
    </Dropdown>
  );
};

export default Menu;
