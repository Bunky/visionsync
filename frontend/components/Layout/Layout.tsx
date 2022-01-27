import { AppShell, useMantineTheme } from '@mantine/core';
import { ThemeProvider } from 'styled-components';
import Header from './Header';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const theme = useMantineTheme();

  return (
    <ThemeProvider theme={theme}>
      <AppShell
        padding="md"
        header={<Header />}
        navbar={<Navbar />}
        styles={{
          main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
        }}
      >
        {children}
      </AppShell>
    </ThemeProvider>
  );
};

export default Layout;
