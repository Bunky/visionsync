/* eslint-disable react/no-unstable-nested-components */
import {
  Group, Button, Text
} from '@mantine/core';
import { IoCode } from 'react-icons/io5';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import { useMemo } from 'react';
import useAnalyses from '../../../hooks/Analysis/useAnalyses';
import AnalysesMenu from './AnalysesMenu';
import viewAnalysisModalState from '../../../atoms/viewAnalysisModalState';
import useMatches from '../../../hooks/Matches/useMatches';
import useDeleteAnalyses from '../../../hooks/Analysis/useDeleteAnalyses';
import Table from '../../Common/Table/Table';

const AnalysesTable = () => {
  const { data: analyses } = useAnalyses();
  const { data: matches } = useMatches();
  const [, setModal] = useRecoilState(viewAnalysisModalState);
  const deleteAnalyses = useDeleteAnalyses();

  const columns = useMemo(() => [{
    Header: 'Match',
    accessor: 'matchId',
    Cell: ({ value }) => (
      <Text
        size="sm"
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        {matches.find((match) => match._id === value)?.title || 'Deleted Match'}
      </Text>
    ),
    minWidth: 200,
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
            analysisId: row.original._id
          })}
          leftIcon={<IoCode />}
          compact
        >
          View
        </Button>
        <AnalysesMenu analysisId={row.original._id} />
      </Group>
    ),
    width: 148,
    maxWidth: 148,
    minWidth: 148,
    disableSortBy: true
  }], []);

  return (
    <Table
      data={analyses}
      columns={columns}
      deleteMutation={deleteAnalyses}
      hiddenColumns={['createdAt']}
    />
  );
};

export default AnalysesTable;
