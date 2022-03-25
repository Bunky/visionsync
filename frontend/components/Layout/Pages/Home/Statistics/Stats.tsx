import {
  ScrollArea
} from '@mantine/core';
import StatRow from './StatRow';

const Stats = () => (
  <ScrollArea>
    <StatRow title="Possesion" data={[73, 27]} pct />
    <StatRow title="Shots" data={[8, 7]} count />
    <StatRow title="Shots on Target" data={[3, 2]} count />
    <StatRow title="Corners" data={[7, 2]} count />
    <StatRow title="Fouls" data={[17, 17]} count />
  </ScrollArea>
);
export default Stats;
