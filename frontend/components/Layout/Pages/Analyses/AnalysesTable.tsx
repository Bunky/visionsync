import {
  Table, ScrollArea, Group, Button, Center, Loader, Checkbox
} from '@mantine/core';
import { IoCode } from 'react-icons/io5';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import useAnalyses from '../../../../hooks/Analysis/useAnalyses';
import AnalysesMenu from './AnalysesMenu';
import viewAnalysisModalState from '../../../../atoms/viewAnalysisModalState';
import useMatches from '../../../../hooks/Matches/useMatches';
import useDeleteAnalyses from '../../../../hooks/Analysis/useDeleteAnalyses';

const AnalysesTable = () => {
  const { data: analyses, status: analysesStatus } = useAnalyses();
  const { data: matches, status: matchesStatus } = useMatches();
  const [, setModal] = useRecoilState(viewAnalysisModalState);
  const deleteAnalyses = useDeleteAnalyses();
  const [selection, setSelection] = useState([]);

  // eslint-disable-next-line max-len
  const toggleRow = (analysisId) => setSelection((current) => (current.includes(analysisId) ? current.filter((item) => item !== analysisId) : [...current, analysisId]));
  const toggleAll = () => setSelection((current) => (current.length === analyses.length ? [] : analyses.map((item) => item._id)));

  if (analysesStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (analysesStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <ScrollArea sx={{ height: 600 }} offsetScrollbars>
      {selection.length > 0 && (
        <Button
          onClick={() => {
            deleteAnalyses.mutate(selection);
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
                checked={selection.length === analyses.length}
                indeterminate={selection.length > 0 && selection.length !== analyses.length}
              />
            </th>
            <th>Match</th>
            <th>Date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {analyses && analyses.map((analysis) => (
            <tr key={analysis._id} style={{ position: 'relative' }}>
              <td>
                <Checkbox
                  checked={selection.includes(analysis._id)}
                  onChange={() => toggleRow(analysis._id)}
                />
              </td>
              <td>{matches && (matches.filter((match) => match._id === analysis.matchId)[0]?.title || 'Deleted Match')}</td>
              <td>{format(new Date(analysis.createdAt), 'dd/MM/yyyy HH:mm')}</td>
              <td>
                <Group position="right">
                  <Button
                    onClick={() => setModal({
                      open: true,
                      analysisId: analysis._id
                    })}
                    leftIcon={<IoCode />}
                    compact
                  >
                    View Data
                  </Button>
                  <AnalysesMenu analysisId={analysis._id} />
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollArea>
  );
};

export default AnalysesTable;
