import { Navbar as NavbarContainer } from '@mantine/core';
import Link from 'next/link';

const Navbar = () => (
  <NavbarContainer width={{ base: 300 }} height={500} padding="xs">
    <Link href="/">
      home!
    </Link>
    <Link href="/about">
      about!
    </Link>
  </NavbarContainer>
);

export default Navbar;
