import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  AppShell, Dialog, useMantineTheme, Text, Button, Group
} from '@mantine/core';
import { ThemeProvider } from 'styled-components';
import Header from './Header/Header';
import Navbar from './Navbar/Navbar';
import useAnalysis from '../../hooks/Analysis/useAnalysis';

const Layout = ({ children }) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const [open, setOpen] = useState(false);
  const { data: analysis, status: analysisStatus } = useAnalysis();

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
      <Dialog
        opened={analysis && analysis.active && router.pathname !== '/analysis'}
        size="lg"
        radius="md"
      >
        <Group dir="row" position="apart">
          <Text>You have an active analysis!</Text>
          <Button onClick={() => router.push('/analysis')}>Open</Button>
        </Group>
      </Dialog>
    </ThemeProvider>
  );
};

export default Layout;
