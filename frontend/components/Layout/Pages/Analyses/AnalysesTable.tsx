import {
  Table, ScrollArea, Group, Button, Center, Loader
} from '@mantine/core';
import { IoCode } from 'react-icons/io5';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import useAnalyses from '../../../../hooks/Analysis/useAnalyses';
import AnalysesMenu from './AnalysesMenu';
import viewAnalysisModalState from '../../../../atoms/viewAnalysisModalState';
import useMatches from '../../../../hooks/Matches/useMatches';

const AnalysesTable = () => {
  const { data: analyses, status: analysesStatus } = useAnalyses();
  const { data: matches, status: matchesStatus } = useMatches();
  const [, setModal] = useRecoilState(viewAnalysisModalState);

  if (analysesStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (analysesStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <ScrollArea sx={{ height: 600 }} offsetScrollbars>
      <Table verticalSpacing="xs">
        <thead>
          <tr>
            <th>Match</th>
            <th>Uploaded</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {analyses && analyses.map((analysis) => (
            <tr key={analysis._id} style={{ position: 'relative' }}>
              <td>{matches && matches.filter((match) => match._id === analysis.matchId)[0].title}</td>
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
