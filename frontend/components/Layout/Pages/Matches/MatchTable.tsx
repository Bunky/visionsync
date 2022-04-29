/* eslint-disable react/no-unstable-nested-components */
import {
  Group, Button, Image, AspectRatio, Text
} from '@mantine/core';
import {
  IoBarChart,
  IoVideocam
} from 'react-icons/io5';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import { useMemo } from 'react';
import MatchMenu from './MatchMenu';
import useMatches from '../../../../hooks/Matches/useMatches';
import viewMatchModalState from '../../../../atoms/viewMatchModalState';
import useStartAnalysis from '../../../../hooks/Analysis/useStartAnalysis';
import Table from '../../../Common/Table/Table';
import useDeleteMatches from '../../../../hooks/Matches/useDeleteMatches';
import newMatchModalState from '../../../../atoms/newMatchModalState';

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
        <AspectRatio ratio={16 / 9} sx={{ width: 100 }}>
          <Image src={`http://d1pu8bxuwsqdvz.cloudfront.net/thumbnails/${row.original._id}.png`} radius="md" />
        </AspectRatio>
        <Text size="sm">{value}</Text>
      </Group>
    ),
    minWidth: 200
  }, {
    Header: 'Uploaded',
    accessor: 'createdAt',
    Cell: ({ value }) => (<Text size="sm">{format(new Date(value), 'dd/MM/yyyy HH:mm')}</Text>),
    maxWidth: 200,
    minWidth: 160,
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
        >
          Watch
        </Button>
        <Button
          onClick={() => useStart.mutate(row.original._id)}
          leftIcon={<IoBarChart />}
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
        open: true
      })}
    />
  );
};

export default MatchTable;
