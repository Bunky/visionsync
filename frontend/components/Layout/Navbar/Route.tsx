import { ThemeIcon, Text, Group } from '@mantine/core';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Link from 'next/link';

const Route = ({ to, icon, children }) => {
  const router = useRouter();

  return (
    <Link href={to} passHref>
      <Container spacing="sm" active={router.pathname === to}>
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
    background-color: ${({ theme }) => theme.colors.dark[8]};
  }
`;

export default Route;
