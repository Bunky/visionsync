import { Navbar as NavbarContainer, Stack } from '@mantine/core';
import {
  IoAnalytics,
  IoFootball,
  IoSettingsOutline
} from 'react-icons/io5';
import Route from './Route';

const Navbar = ({ open }) => (
  <NavbarContainer
    width={{ sm: 200 }}
    height="100%"
    p="xs"
    hiddenBreakpoint="sm"
    hidden={!open}
    sx={() => ({
      '@media (max-width: 768px)': {
        position: 'fixed',
        width: 200
      }
    })}
  >
    <Stack justify="flex-start" spacing="xs">
      <Route to="/" icon={<IoFootball />}>Matches</Route>
      <Route to="/analyses" icon={<IoAnalytics />}>Analyses</Route>
      <Route to="/configs" icon={<IoSettingsOutline />}>Configs</Route>
    </Stack>
  </NavbarContainer>
);

export default Navbar;
