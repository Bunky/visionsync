import { forwardRef } from 'react';
import {
  Avatar, Text, UnstyledButtonProps, Group
} from '@mantine/core';
import styled from 'styled-components';

interface UserButtonProps extends UnstyledButtonProps {
  firstName: string;
  lastName: string;
  dark: boolean;
}

const Menu = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ firstName, lastName, ...others }: UserButtonProps, ref) => (
    <Container spacing="sm" ref={ref} {...others}>
      <Avatar color="violet" radius="xl" size="sm">
        {firstName.substring(0, 1)}
        {lastName.substring(0, 1)}
      </Avatar>
      <Text size="sm" weight={400}>{`${firstName} ${lastName}`}</Text>
    </Container>
  )
);

const Container = styled(Group)`
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${({ theme }) => theme.spacing.xs}px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme, dark }) => (dark ? theme.colors.dark[8] : theme.colors.gray[0])};
  }
`;

export default Menu;
