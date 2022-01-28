import { forwardRef } from 'react';
import {
  Avatar, Text, UnstyledButtonProps, Group
} from '@mantine/core';
import styled from 'styled-components';

interface UserButtonProps extends UnstyledButtonProps {
  name: string;
}

const Menu = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ name, ...others }: UserButtonProps, ref) => (
    <Container spacing="sm" ref={ref} {...others}>
      <Avatar color="violet" radius="xl" size="sm">{name.split(' ')[0].substring(0, 1)}</Avatar>
      <Text size="sm" weight={400}>{name}</Text>
    </Container>
  )
);

const Container = styled(Group)`
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${({ theme }) => theme.spacing.xs}px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark[8]};
  }
`;

export default Menu;
