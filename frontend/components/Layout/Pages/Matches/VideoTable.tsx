import { useState } from 'react';
import {
  Table, ScrollArea, Group, Button, Image, AspectRatio, Center, Loader, LoadingOverlay
} from '@mantine/core';
import {
  IoBarChart,
  IoVideocam
} from 'react-icons/io5';
import { format } from 'date-fns';
import VideoMenu from './VideoMenu';
import useMatches from '../../../../hooks/Matches/useMatches';
import useViewMatchModal from '../../../../hooks/Matches/useViewMatchModal';
import useStartAnalysis from '../../../../hooks/Analysis/useStartAnalysis';

const VideoTable = () => {
  const { data: matches, status: matchesStatus } = useMatches();
  const [, setState] = useViewMatchModal();
  const useStart = useStartAnalysis();

  if (matchesStatus === 'loading') {
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
          {matches && matches.map((match) => (
            <tr key={match._id} style={{ position: 'relative' }}>
              <LoadingOverlay visible={match.loading} />
              <td>
                <AspectRatio ratio={16 / 9} sx={{ width: 100 }}>
                  <Image src={`http://d1pu8bxuwsqdvz.cloudfront.net/thumbnails/${match._id}.png`} radius="md" />
                </AspectRatio>
              </td>
              <td>{match.title}</td>
              {/* <td>{match.length}</td> */}
              <td>{format(new Date(match.createdAt), 'dd/MM/yyyy HH:mm')}</td>
              <td>
                {!match.loading && (
                  <Group position="right">
                    <Button
                      onClick={() => setState({
                        open: true,
                        matchId: match._id
                      })}
                      leftIcon={<IoVideocam />}
                      compact
                    >
                      Watch
                    </Button>
                    <Button
                      onClick={() => useStart.mutate(match._id)}
                      leftIcon={<IoBarChart />}
                      compact
                    >
                      Analyse
                    </Button>
                    <VideoMenu matchId={match._id} />
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
