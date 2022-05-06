import {
  ThemeIcon, Text, Group, useMantineColorScheme
} from '@mantine/core';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Link from 'next/link';

const Route = ({ to, icon, children }) => {
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Link href={to} passHref>
      <Container spacing="sm" active={router.pathname === to} dark={dark}>
        <ThemeIcon color="violet" radius="sm" variant={router.pathname === to ? 'filled' : 'light'}>
          {icon}
        </ThemeIcon>
        <Text size="sm" weight={router.pathname === to ? 600 : 400}>{children}</Text>
      </Container>
    </Link>
  );
};

const Container = styled(Group)`
  border-radius: ${({ theme }) => theme.radius.sm}px;
  padding: ${({ theme }) => theme.spacing.xs}px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: ${({ theme, dark }) => (dark ? theme.colors.dark[8] : theme.colors.gray[0])};
  }
`;

export default Route;
