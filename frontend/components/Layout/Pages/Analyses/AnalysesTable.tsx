import {
  Table, ScrollArea, Group, Button, Center, Loader
} from '@mantine/core';
import { IoCode } from 'react-icons/io5';
import { format } from 'date-fns';
import useAnalyses from '../../../../hooks/Analysis/useAnalyses';
import useViewAnalysisModel from '../../../../hooks/Analysis/useViewAnalysisModal';
import AnalysesMenu from './AnalysesMenu';

const AnalysesTable = () => {
  const { data: analyses, status: analysesStatus } = useAnalyses();
  const [, setState] = useViewAnalysisModel();

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
            <th>Match ID</th>
            <th>Analysis ID</th>
            <th>Uploaded</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {analyses && analyses.map((analysis) => (
            <tr key={analysis.matchId} style={{ position: 'relative' }}>
              <td>{analysis.matchId}</td>
              <td>{analysis._id}</td>
              {/* <td>{analysis.length}</td> */}
              <td>{format(new Date(analysis.createdAt), 'dd/MM/yyyy HH:mm')}</td>
              <td>
                <Group position="right">
                  <Button
                    onClick={() => setState({
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
