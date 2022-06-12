/* eslint-disable no-nested-ternary */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Center,
  Group,
  TextInput,
  LoadingOverlay,
  Button,
  PasswordInput,
  Paper,
  Checkbox,
  Anchor,
  Popover,
  Text,
  ThemeIcon,
  Progress,
  Loader,
  useMantineColorScheme
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import {
  IoAlertCircleOutline, IoCheckmark, IoLockClosedOutline, IoLogInOutline, IoMailOutline
} from 'react-icons/io5';
import styled from 'styled-components';
import { useQueryClient } from 'react-query';
import useUser from '../hooks/Auth/useUser';
import useSignup from '../hooks/Auth/useSignup';
import useUniqueEmail from '../hooks/Auth/useUniqueEmail';

const validationSchema = z.object({
  firstName: z.string()
    .min(2, { message: 'Should have at least 2 characters' })
    .max(32, { message: 'Should be 32 characters or fewer' }),
  lastName: z.string()
    .min(2, { message: 'Should have at least 2 characters' })
    .max(32, { message: 'Should be 32 characters or fewer' }),
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Invalid password' }),
  confirmPassword: z.string()
    .min(0, { message: 'Your password should have at least 8 characters' })
    .max(64, { message: 'Your password should be 64 characters or fewer' }),
  termsOfService: z.boolean()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
}).refine((data) => data.termsOfService === true, {
  message: 'You must accept the terms of service',
  path: ['termsOfService'],
});

const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
  { re: /^.{8,}$/, label: 'Minimum 8 characters' }
];

const getStrength = (password: string) => {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
};

const Signup = () => {
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, status: userStatus } = useUser();
  const signup = useSignup();
  const uniqueEmail = useUniqueEmail();
  const [loading, setLoading] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [error, setError] = useState(null);
  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsOfService: false
    },
    schema: zodResolver(validationSchema)
    // validationRules: {
    //   firstName: (value) => value.trim().length >= 2,
    //   lastName: (value) => value.trim().length >= 2,
    //   email: (value) => validateEmail(value),
    //   password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value),
    //   confirmPassword: (val, values) => val === values.password,
    //   termsOfService: (val) => val
    // },
    // errorMessages: {
    //   firstName: 'First name is required',
    //   lastName: 'Last name is required',
    //   email: 'Invalid email',
    //   password: 'Invalid password',
    //   confirmPassword: "Passwords don't match",
    //   termsOfService: 'Must agree'
    // },
  });

  useEffect(() => {
    if (userStatus === 'success' && user?._id) {
      router.push('/');
    }
  }, [userStatus, user]);

  // eslint-disable-next-line max-len, no-control-regex
  const validateEmail = (email) => /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email);

  const submitSignup = (data) => {
    setError(null);
    setLoading(true);

    const { confirmPassword, ...newAccount } = data;
    signup.mutate(newAccount, {
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

  const checkEmail = () => {
    form.validateField('email');
    if (form.values.email) {
      setLoadingEmail(true);
      uniqueEmail.mutate(form.values.email, {
        onSuccess: async (data) => {
          const res = await data.json();
          if (res.ok && !res.unique) {
            form.setFieldError('email', 'Email taken');
          }
        },
        onSettled: () => {
          setLoadingEmail(false);
        }
      });
    }
  };

  const strength = getStrength(form.values.password);
  // eslint-disable-next-line no-nested-ternary
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

  return (
    <Center>
      <StyledPaper
        p="md"
        shadow="sm"
        radius="md"
        dark={dark}
      >
        <form onSubmit={form.onSubmit(submitSignup)}>
          <LoadingOverlay visible={loading} />
          <Group grow direction="column" spacing="sm">
            <Group grow>
              <TextInput
                data-autofocus
                required
                placeholder="Your first name"
                label="First name"
                onBlur={() => form.validateField('firstName')}
                {...form.getInputProps('firstName')}
              />
              <TextInput
                required
                placeholder="Your last name"
                label="Last name"
                onBlur={() => form.validateField('lastName')}
                {...form.getInputProps('lastName')}
              />
            </Group>
            <TextInput
              required
              label="Email"
              placeholder="your@email.com"
              icon={<IoMailOutline />}
              onBlur={checkEmail}
              {...form.getInputProps('email')}
              rightSection={
                loadingEmail
                  ? <Loader size="xs" />
                  : form.errors.email
                    ? <IoAlertCircleOutline />
                    : validateEmail(form.values.email) && <ThemeIcon color="teal" variant="light"><IoCheckmark /></ThemeIcon>
              }
            />
            <Popover
              opened={popoverOpened}
              trapFocus={false}
              withArrow
              radius="md"
              onFocusCapture={() => setPopoverOpened(true)}
              onBlurCapture={() => setPopoverOpened(false)}
              target={(
                <PasswordInput
                  required
                  label="Password"
                  placeholder="Your password"
                  icon={<IoLockClosedOutline />}
                  onBlur={() => form.validateField('password')}
                  {...form.getInputProps('password')}
                />
              )}
            >
              <Group direction="column" spacing="sm" grow>
                <Progress color={color} value={strength} size={5} />
                {requirements.map((req) => (
                  <Group spacing="sm">
                    <ThemeIcon color={req.re.test(form.values.password) ? 'teal' : 'red'} variant="light">
                      {req.re.test(form.values.password) ? <IoCheckmark /> : <IoAlertCircleOutline />}
                    </ThemeIcon>
                    <Text
                      color={req.re.test(form.values.password) ? 'teal' : 'red'}
                      sx={{ display: 'flex', alignItems: 'center' }}
                      size="sm"
                    >
                      {req.label}
                    </Text>
                  </Group>
                ))}
              </Group>
            </Popover>
            <PasswordInput
              required
              label="Confirm Password"
              placeholder="Confirm password"
              icon={<IoLockClosedOutline />}
              onBlur={() => form.validateField('confirmPassword')}
              {...form.getInputProps('confirmPassword')}
            />
            <Popover
              opened={!!form.errors.termsOfService}
              target={(
                <Checkbox
                  label="I agree to some conditions"
                  {...form.getInputProps('termsOfService', { type: 'checkbox' })}
                />
              )}
              width={260}
              position="left"
              placement="center"
              radius="md"
              withArrow
            >
              <Group>
                <ThemeIcon color="red" variant="light">
                  <IoAlertCircleOutline />
                </ThemeIcon>
                <Text size="sm" color="red">
                  Please read and agree!
                </Text>
              </Group>
            </Popover>
            {!!error && (
              <Text color="red" size="sm">
                {error}
              </Text>
            )}
            <Group position="apart">
              <Link href="/login" passHref>
                <Anchor
                  component="button"
                  type="button"
                  color="gray"
                  size="sm"
                >
                  Have an account? Login
                </Anchor>
              </Link>
              <Button
                type="submit"
                leftIcon={<IoLogInOutline />}
              >
                Signup
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

export default Signup;
