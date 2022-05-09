import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Center, Group, TextInput, LoadingOverlay, Button, PasswordInput, Paper, Anchor, Text, useMantineColorScheme
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IoLockClosedOutline, IoLogInOutline, IoMailOutline } from 'react-icons/io5';
import styled from 'styled-components';
import { useQueryClient } from 'react-query';
import useUser from '../hooks/Auth/useUser';
import useLogin from '../hooks/Auth/useLogin';

const validationSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string()
    .min(0, { message: 'Your password should have at least 8 characters' })
    .max(64, { message: 'Your password should be 64 characters or fewer' }),
});

const Login = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const router = useRouter();
  const queryClient = useQueryClient();
  const login = useLogin();
  const { data: user, status: userStatus } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const form = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    schema: zodResolver(validationSchema)
  });

  useEffect(() => {
    if (userStatus === 'success' && user?._id) {
      router.push('/');
    }
  }, [userStatus, user]);

  const submitLogin = (data) => {
    setError(null);
    setLoading(true);
    login.mutate(data, {
      onError: ({ error: queryError }) => {
        setError(queryError.toString());
      },
      onSuccess: async (res) => {
        const json = await res.json();
        if (!res.ok) {
          setError(json.error);
        } else if (json.message) {
          setError(json.message);
        }
      },
      onSettled: async () => {
        await queryClient.invalidateQueries('user');
        setLoading(false);
      }
    });
  };

  return (
    <Center>
      <StyledPaper
        p="md"
        shadow="sm"
        radius="md"
        dark={dark}
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
              <Button
                type="submit"
                leftIcon={<IoLogInOutline />}
              >
                Login
              </Button>
            </Group>
          </Group>
        </form>
      </StyledPaper>
    </Center>
  );
};

const StyledPaper = styled(Paper)`
  background-color: ${({ theme, dark }) => (dark ? theme.colors.dark[8] : theme.colors.gray[0])};
  position: relative;
  overflow: hidden;
`;

export default Login;
