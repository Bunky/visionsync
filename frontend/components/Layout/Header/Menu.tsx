import { useState } from 'react';
import {
  Menu as Dropdown, useMantineColorScheme
} from '@mantine/core';
import {
  IoLogOutOutline, IoSunnyOutline, IoMoonOutline
} from 'react-icons/io5';
import useUser from '../../../hooks/Auth/useUser';
import useLogout from '../../../hooks/Auth/useLogout';
import User from './User';

const Menu = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const logout = useLogout();
  const { data: user } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      control={<User firstName={user.firstName} lastName={user.lastName} dark={dark} />}
      opened={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      trigger="hover"
      transition="scale"
      placement="end"
    >
      <Dropdown.Label>Account</Dropdown.Label>
      <Dropdown.Item icon={dark ? <IoSunnyOutline /> : <IoMoonOutline />} onClick={() => toggleColorScheme()}>Theme</Dropdown.Item>
      <Dropdown.Item icon={<IoLogOutOutline />} onClick={() => logout.mutate()} color="red">Logout</Dropdown.Item>
    </Dropdown>
  );
};

export default Menu;
