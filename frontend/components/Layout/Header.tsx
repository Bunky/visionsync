import { Header as HeaderContainer } from '@mantine/core';
import Image from 'next/image';
import styled from 'styled-components';
import useUser from '../../hooks/useUser';

const Header = () => {
  const { data: user, status } = useUser();
  return (
    <Container height={60} padding="xs">
      <Image src="/images/logo.png" width={80} height={40} />
      VisionSync
      {status === 'success' && <Name>{user.name}</Name>}
    </Container>
  );
};

const Container = styled(HeaderContainer)`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Name = styled.div`
  font-weight: 600;
  background-color: ${({ theme }) => theme.colors.red};
`;

export default Header;
