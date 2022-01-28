import { Navbar as NavbarContainer, Group } from '@mantine/core';
import {
  IoHomeOutline, IoSettingsOutline, IoMagnetOutline, IoBarChartOutline
} from 'react-icons/io5';
import Route from './Route';

const Navbar = ({ open }) => (
  <NavbarContainer width={{ sm: 150, lg: 200 }} height="100%" padding="xs" hiddenBreakpoint="sm" hidden={!open}>
    <Group direction="column" spacing="xs" grow>
      <Route to="/" icon={<IoHomeOutline />}>Home</Route>
      <Route to="/models" icon={<IoMagnetOutline />}>Models</Route>
      <Route to="/analysis" icon={<IoBarChartOutline />}>Analysis</Route>
      <Route to="/settings" icon={<IoSettingsOutline />}>Settings</Route>
    </Group>
  </NavbarContainer>
);

export default Navbar;