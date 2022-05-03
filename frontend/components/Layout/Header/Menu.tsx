import { useState } from 'react';
import {
  Menu as Dropdown, Skeleton, Group
} from '@mantine/core';
import {
  IoSettingsOutline, IoLogOutOutline
} from 'react-icons/io5';
import useUser from '../../../hooks/Auth/useUser';
import useLogout from '../../../hooks/Auth/useLogout';
import User from './User';

const Menu = () => {
  const logout = useLogout();
  const { data: user, status: userStatus } = useUser();
  const [open, setOpen] = useState(false);

  if (userStatus === 'success') {
    return (
      <Dropdown
        control={<User firstName={user.firstName} lastName={user.lastName} />}
        opened={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        trigger="hover"
        transition="scale"
        placement="end"
      >
        <Dropdown.Label>Account</Dropdown.Label>
        <Dropdown.Item icon={<IoSettingsOutline />}>User Settings</Dropdown.Item>
        <Dropdown.Item icon={<IoLogOutOutline />} onClick={() => logout.mutate()} color="red">Logout</Dropdown.Item>
      </Dropdown>
    );
  }

  return (
    <Group>
      <Skeleton height={32} circle />
      <Skeleton height={16} width={75} />
    </Group>
  );
};

export default Menu;
