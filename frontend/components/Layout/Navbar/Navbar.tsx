import { Navbar as NavbarContainer, Group } from '@mantine/core';
import {
  IoBarChartOutline,
  IoHomeOutline, IoSettingsOutline
} from 'react-icons/io5';
import Route from './Route';

const Navbar = ({ open }) => (
  <NavbarContainer width={{ sm: 150, lg: 200 }} height="100%" px="xs" hiddenBreakpoint="sm" hidden={!open}>
    <Group direction="column" spacing="xs" grow>
      <Route to="/" icon={<IoHomeOutline />}>Matches</Route>
      <Route to="/analyses" icon={<IoBarChartOutline />}>Analyses</Route>
      <Route to="/configs" icon={<IoSettingsOutline />}>Configs</Route>
      {/* <Route to="/settings" icon={<IoSettingsOutline />}>Settings</Route> */}
    </Group>
  </NavbarContainer>
);

export default Navbar;
