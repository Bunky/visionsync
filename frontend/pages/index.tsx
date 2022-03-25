import styled from 'styled-components';
import {
  Tabs, Grid
} from '@mantine/core';
import {
  IoMap, IoPerson, IoStatsChart, IoTv
} from 'react-icons/io5';
import Livefeed from '../components/Layout/Pages/Home/LiveFeed/Livefeed';
import Minimap from '../components/Layout/Pages/Home/Minimap/Minimap';
import PlayerTable from '../components/Layout/Pages/Home/Players/PlayerTable';
import Stats from '../components/Layout/Pages/Home/Statistics/Stats';
import PlayerStatsModal from '../components/Layout/Pages/Home/PlayerStatsModal';

const Home = () => (
  <Container>
    <Grid grow>
      <Grid.Col span={8}>
        <Tabs>
          <Tabs.Tab label="Live Feed" icon={<IoTv />}><Livefeed /></Tabs.Tab>
          <Tabs.Tab label="Minimap" icon={<IoMap />}><Minimap /></Tabs.Tab>
        </Tabs>
      </Grid.Col>
      <Grid.Col span={4}>
        <Tabs>
          <Tabs.Tab label="Players" icon={<IoPerson />}><PlayerTable /></Tabs.Tab>
          <Tabs.Tab label="Stats" icon={<IoStatsChart />}><Stats /></Tabs.Tab>
        </Tabs>
      </Grid.Col>
      <Grid.Col span={12}>3</Grid.Col>
    </Grid>
    <PlayerStatsModal />
  </Container>
);

const Container = styled.div`
  max-height: 100%;
`;

export default Home;
