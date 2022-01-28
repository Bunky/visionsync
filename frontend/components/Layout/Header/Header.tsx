import { Header as HeaderContainer, Burger, MediaQuery } from '@mantine/core';
// import Image from 'next/image';
import styled from 'styled-components';
import Menu from './Menu';
// import logo from '../../../public/images/logo.png';

const Header = ({ open, setOpen }) => (
  <Container height={70} padding="xs">
    <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
      <Burger
        opened={open}
        onClick={() => setOpen(!open)}
        size="sm"
        mr="xl"
      />
    </MediaQuery>
    {/* <Image src={logo} width={80} height={40} alt="Logo" placeholder="blur" /> */}
    VisionSync
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
