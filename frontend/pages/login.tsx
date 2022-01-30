import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Center, Group, TextInput, LoadingOverlay, Button, PasswordInput, Paper, Anchor, Text
} from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { IoLockClosedOutline, IoMailOutline } from 'react-icons/io5';
import styled from 'styled-components';
import useUser from '../hooks/useUser';

const Login = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: user, status: userStatus } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validationRules: {
      // eslint-disable-next-line max-len, no-control-regex
      email: (value) => /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(value),
      password: (value) => value.trim().length >= 8,
    },
    errorMessages: {
      email: 'Invalid email',
      password: 'Invalid password'
    },
  });

  useEffect(() => {
    if (userStatus === 'success') {
      if (user && !user.unauthorised) {
        router.push('/');
      }
    }
  }, [user]);

  const mutateLogin = useMutation(async (newAccount) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newAccount),
  }), {
    onMutate: async () => {
      setLoading(true);
      await queryClient.cancelQueries('user');
    },
    onError: ({ error: queryError }) => {
      setError(queryError.toString());
    },
    onSuccess: async (data) => {
      const json = await data.json();
      if (json.authenticated) {
        queryClient.invalidateQueries('user');
      } else {
        setError(json.message);
      }
    },
    onSettled: () => {
      setLoading(false);
    }
  });

  const submitLogin = (data) => {
    setError(null);
    mutateLogin.mutate(data);
  };

  return (
    <Center>
      <StyledPaper
        padding="md"
        shadow="sm"
        radius="md"
      >
        <form onSubmit={form.onSubmit(submitLogin)}>
          <LoadingOverlay visible={loading} />
          <Group grow direction="column" spacing="sm">
            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              icon={<IoMailOutline />}
              {...form.getInputProps('email')}
            />
            <PasswordInput
              required
              label="Password"
              placeholder="Password"
              icon={<IoLockClosedOutline />}
              {...form.getInputProps('password')}
            />
            {!!error && (
              <Text color="red" size="sm">
                {error}
              </Text>
            )}
            <Group position="apart">
              <Link href="/signup" passHref>
                <Anchor
                  component="button"
                  type="button"
                  color="gray"
                  size="sm"
                >
                  Don&apos;t have an account? Register
                </Anchor>
              </Link>
              <Button type="submit">Login</Button>
            </Group>
          </Group>
        </form>
      </StyledPaper>
    </Center>
  );
};

const StyledPaper = styled(Paper)`
  background-color: ${({ theme }) => theme.colors.dark[8]};
  position: relative;
  overflow: hidden;
`;

export default Login;
