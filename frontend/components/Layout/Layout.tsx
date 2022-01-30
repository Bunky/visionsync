import { useState } from 'react';
import { useRouter } from 'next/router';
import { AppShell, useMantineTheme } from '@mantine/core';
import { ThemeProvider } from 'styled-components';
import Header from './Header/Header';
import Navbar from './Navbar/Navbar';

const Layout = ({ children }) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const [open, setOpen] = useState(false);

  if (router.pathname === '/login' || router.pathname === '/signup') {
    return (
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <AppShell
        padding="md"
        header={<Header open={open} setOpen={setOpen} />}
        navbar={<Navbar open={open} />}
        styles={{
          main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
          body: {
            height: 'calc(100% - 70px)'
          }
        }}
      >
        {children}
      </AppShell>
    </ThemeProvider>
  );
};

export default Layout;
