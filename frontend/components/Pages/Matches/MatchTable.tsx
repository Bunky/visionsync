/* eslint-disable react/no-unstable-nested-components */
import {
  Group, Button, Image, AspectRatio, Text, Paper, Center
} from '@mantine/core';
import { IoImage, IoVideocam } from 'react-icons/io5';
import { BiAnalyse } from 'react-icons/bi';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import { useMemo } from 'react';
import MatchMenu from './MatchMenu';
import useMatches from '../../../hooks/Matches/useMatches';
import viewMatchModalState from '../../../atoms/viewMatchModalState';
import useStartAnalysis from '../../../hooks/Analysis/useStartAnalysis';
import Table from '../../Common/Table/Table';
import useDeleteMatches from '../../../hooks/Matches/useDeleteMatches';
import newMatchModalState from '../../../atoms/matchModalState';

const MatchTable = () => {
  const { data: matches } = useMatches();
  const [, setModal] = useRecoilState(viewMatchModalState);
  const [, setNewModal] = useRecoilState(newMatchModalState);
  const useStart = useStartAnalysis();
  const deleteMatches = useDeleteMatches();

  const columns = useMemo(() => [{
    Header: 'Match',
    accessor: 'title',
    Cell: ({ value, row }) => (
      <Group dir="row" noWrap sx={{ width: '100%' }}>
        <AspectRatio ratio={16 / 9} sx={{ width: 100, minWidth: 100 }}>
          <Image
            src={`http://d1pu8bxuwsqdvz.cloudfront.net/thumbnails/${row.original._id}.png`}
            width={100}
            withPlaceholder
            placeholder={(
              <Paper
                sx={{
                  width: 100,
                  height: 56.25,
                }}
              >
                <Center style={{ height: 56.25 }}>
                  <IoImage />
                </Center>
              </Paper>
            )}
            radius="sm"
          />
        </AspectRatio>
        <Text
          size="sm"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {value}
        </Text>
      </Group>
    ),
    minWidth: 200
  }, {
    Header: 'Uploaded',
    accessor: 'createdAt',
    Cell: ({ value }) => (<Text size="sm">{format(new Date(value), 'dd/MM/yyyy HH:mm')}</Text>),
    maxWidth: 200,
    minWidth: 160
  }, {
    Header: '',
    accessor: 'actions',
    Cell: ({ row }) => (
      <Group spacing="sm" position="right" noWrap sx={{ width: '100%' }}>
        <Button
          onClick={() => setModal({
            open: true,
            matchId: row.original._id
          })}
          leftIcon={<IoVideocam />}
          compact
          variant="outline"
        >
          Watch
        </Button>
        <Button
          onClick={() => useStart.mutate(row.original._id)}
          leftIcon={<BiAnalyse />}
          compact
        >
          Analyse
        </Button>
        <MatchMenu matchId={row.original._id} />
      </Group>
    ),
    width: 268,
    maxWidth: 268,
    minWidth: 268,
    disableSortBy: true
  }], []);

  return (
    <Table
      data={matches}
      columns={columns}
      deleteMutation={deleteMatches}
      openCreateModal={() => setNewModal({
        open: true,
        edit: false,
        matchId: null
      })}
      openCreateDisabled={!!matches.find((match) => match._id === 'uploading')}
      hiddenColumns={['createdAt']}
    />
  );
};

export default MatchTable;
