import {
  Header as HeaderContainer, Burger, MediaQuery, Group, Text
} from '@mantine/core';
import Image from 'next/image';
import styled from 'styled-components';
import Menu from './Menu';
import logo from '../../../public/logo.svg';

const Header = ({ open, setOpen }) => (
  <Container height={70} p="md">
    <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
      <Burger
        opened={open}
        onClick={() => setOpen(!open)}
        size="sm"
        mr="xl"
      />
    </MediaQuery>
    <Group>
      <Image src={logo} width={25} height={25} alt="Logo" />
      <Text
        size="lg"
        weight={700}
        variant="gradient"
        gradient={{ from: 'violet', to: 'cyan', deg: 45 }}
        style={{ fontFamily: 'Raleway, sans-serif' }}
      >
        VisionSync
      </Text>
    </Group>
    <Menu />
  </Container>
);

const Container = styled(HeaderContainer)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export default Header;
