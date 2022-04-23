import { useEffect, useState } from 'react';
// import { useMutation, useQueryClient } from 'react-query';
import { useRouter } from 'next/router';
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
  // const queryClient = useQueryClient();
  const router = useRouter();
  const logout = useLogout();
  const { data: user, status: userStatus } = useUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (userStatus === 'success') {
      if (user && user.unauthorised) {
        router.push('/login');
      }
    }
  }, [user]);

  // const mutateLogout = useMutation(async () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/logout`, {
  //   method: 'GET',
  //   credentials: 'include',
  //   headers: {
  //     Accept: 'application/json',
  //   },
  // }), {
  //   onMutate: async () => {
  //     await queryClient.cancelQueries('user');

  //     // Optimistically clear user data
  //     const previousUser = queryClient.getQueryData('user');
  //     queryClient.setQueryData('user', { unauthorised: true });
  //     return previousUser;
  //   },
  //   onError: (err, variables, previousUser) => {
  //     // If error, reset user data
  //     queryClient.setQueryData('user', previousUser);
  //     alert(`Failed to logout? ${err}`);
  //   },
  //   onSettled: () => {
  //     // Refetch after success or error
  //     queryClient.invalidateQueries('user');
  //   },
  // });

  if (userStatus === 'success' && !user.unauthorised) {
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
        {/* <Dropdown.Label>Application</Dropdown.Label>
        <Dropdown.Item
          icon={<IoSearchOutline />}
          rightSection={<Text size="xs" color="dimmed">⌘K</Text>}
        >
          Search
        </Dropdown.Item>
        <Dropdown.Item icon={<IoSettingsOutline />}>Settings</Dropdown.Item>

        <Divider /> */}

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
