import { ThemeIcon, Text, Group } from '@mantine/core';
import styled from 'styled-components';
import Link from 'next/link';

const Route = ({ to, icon, children }) => (
  <Link href={to} passHref>
    <Container spacing="sm">
      <ThemeIcon color="violet" radius="sm" variant="light">
        {icon}
      </ThemeIcon>
      <Text size="sm" weight={600}>{children}</Text>
    </Container>
  </Link>
);

const Container = styled(Group)`
  border-radius: ${({ theme }) => theme.radius.sm}px;
  padding: ${({ theme }) => theme.spacing.xs}px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark[8]};
  }
`;

export default Route;
