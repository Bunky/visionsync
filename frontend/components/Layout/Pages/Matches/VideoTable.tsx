import {
  Table, ScrollArea, Group, Button, Image, AspectRatio, Center, Loader, LoadingOverlay, Checkbox
} from '@mantine/core';
import {
  IoBarChart,
  IoVideocam
} from 'react-icons/io5';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import VideoMenu from './VideoMenu';
import useMatches from '../../../../hooks/Matches/useMatches';
import viewMatchModalState from '../../../../atoms/viewMatchModalState';
import useStartAnalysis from '../../../../hooks/Analysis/useStartAnalysis';
import EditMatchModal from './EditMatchModal';
import useDeleteMatches from '../../../../hooks/Matches/useDeleteMatches';

const VideoTable = () => {
  const { data: matches, status: matchesStatus } = useMatches();
  const [, setModal] = useRecoilState(viewMatchModalState);
  const deleteMatches = useDeleteMatches();
  const [selection, setSelection] = useState([]);
  const useStart = useStartAnalysis();

  // eslint-disable-next-line max-len
  const toggleRow = (analysisId) => setSelection((current) => (current.includes(analysisId) ? current.filter((item) => item !== analysisId) : [...current, analysisId]));
  const toggleAll = () => setSelection((current) => (current.length === configs.length ? [] : configs.map((item) => item._id)));

  if (matchesStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (matchesStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <ScrollArea sx={{ height: 600 }} offsetScrollbars>
      {selection.length > 0 && (
        <Button
          onClick={() => {
            deleteMatches.mutate(selection);
            setSelection([]);
          }}
        >
          Delete Selected
        </Button>
      )}
      <Table verticalSpacing="xs">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <Checkbox
                onChange={toggleAll}
                checked={selection.length === matches.length}
                indeterminate={selection.length > 0 && selection.length !== matches.length}
              />
            </th>
            <th />
            <th>Title</th>
            <th>Uploaded</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {matches && matches.map((match) => (
            <tr key={match._id} style={{ position: 'relative' }}>
              <LoadingOverlay visible={match.loading} />
              <td>
                <Checkbox
                  checked={selection.includes(match._id)}
                  onChange={() => toggleRow(match._id)}
                />
              </td>
              <td>
                <AspectRatio ratio={16 / 9} sx={{ width: 100 }}>
                  <Image src={`http://d1pu8bxuwsqdvz.cloudfront.net/thumbnails/${match._id}.png`} radius="md" />
                </AspectRatio>
              </td>
              <td>{match.title}</td>
              <td>{format(new Date(match.createdAt), 'dd/MM/yyyy HH:mm')}</td>
              <td>
                {!match.loading && (
                  <Group position="right">
                    <Button
                      onClick={() => setModal({
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
      <EditMatchModal />
    </ScrollArea>
  );
};

export default VideoTable;
