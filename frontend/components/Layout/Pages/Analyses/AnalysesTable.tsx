/* eslint-disable react/no-unstable-nested-components */
import {
  Group, Button
} from '@mantine/core';
import { IoCode } from 'react-icons/io5';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import { useMemo } from 'react';
import useAnalyses from '../../../../hooks/Analysis/useAnalyses';
import AnalysesMenu from './AnalysesMenu';
import viewAnalysisModalState from '../../../../atoms/viewAnalysisModalState';
import useMatches from '../../../../hooks/Matches/useMatches';
import useDeleteAnalyses from '../../../../hooks/Analysis/useDeleteAnalyses';
import Table from '../../../Common/Table/Table';

const AnalysesTable = () => {
  const { data: analyses } = useAnalyses();
  const { data: matches } = useMatches();
  const [, setModal] = useRecoilState(viewAnalysisModalState);
  const deleteAnalyses = useDeleteAnalyses();

  const columns = useMemo(() => [{
    Header: 'Match',
    accessor: 'matchId',
    Cell: ({ value }) => matches.find((match) => match._id === value).title || 'Deleted Match',
    minWidth: 200,
  }, {
    Header: 'Uploaded',
    accessor: 'createdAt',
    Cell: ({ value }) => format(new Date(value), 'dd/MM/yyyy HH:mm'),
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
          View Data
        </Button>
        <AnalysesMenu analysisId={row.original._id} />
      </Group>
    ),
    width: 183,
    maxWidth: 183,
    minWidth: 183,
    disableSortBy: true
  }], []);

  return (
    <Table
      data={analyses}
      columns={columns}
      deleteMutation={deleteAnalyses}
    />
  );
};

export default AnalysesTable;
