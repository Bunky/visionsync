import {
  Table, ScrollArea, Group, Button, Image, AspectRatio, Center, Loader, LoadingOverlay
} from '@mantine/core';
import {
  IoBarChart,
  IoVideocam
} from 'react-icons/io5';
import VideoMenu from './VideoMenu';
import useMatches from '../../../../hooks/useMatches';

const VideoTable = () => {
  const { data: matches, status: matchesStatus } = useMatches();

  if (matchesStatus === 'loading' || matches === undefined) {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (matchesStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <ScrollArea sx={{ height: 600 }} offsetScrollbars>
      <Table verticalSpacing="xs">
        <thead>
          <tr>
            <th />
            <th>Title</th>
            {/* <th>Length</th> */}
            <th>Uploaded</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr key={match.matchId} style={{ position: 'relative' }}>
              <LoadingOverlay visible={match.loading} />
              <td>
                {match.thumbnail && (
                  <AspectRatio ratio={16 / 9} sx={{ width: 100 }}>
                    <Image src={match.thumbnail} radius="md" />
                  </AspectRatio>
                )}
              </td>
              <td>{match.title}</td>
              {/* <td>{match.length}</td> */}
              <td>{match.createdAt}</td>
              <td>
                {!match.loading && (
                  <Group position="right">
                    <Button
                      leftIcon={<IoVideocam />}
                      compact
                    >
                      Watch
                    </Button>
                    <Button
                      leftIcon={<IoBarChart />}
                      compact
                    >
                      Analyse
                    </Button>
                    <VideoMenu matchId={match.matchId} />
                  </Group>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollArea>
  );
};

export default VideoTable;
