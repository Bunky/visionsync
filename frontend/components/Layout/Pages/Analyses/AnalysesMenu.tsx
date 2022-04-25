import { Menu } from '@mantine/core';
import {
  IoTrash
} from 'react-icons/io5';
import useDeleteAnalyses from '../../../../hooks/Analysis/useDeleteAnalysis';

const AnalysesMenu = ({ analysisId }) => {
  const deleteAnalysis = useDeleteAnalyses();
  return (
    <Menu>
      <Menu.Label>Danger Zone</Menu.Label>
      <Menu.Item
        color="red"
        icon={<IoTrash size={14} />}
        onClick={() => deleteAnalysis.mutate({ analysisId })}
      >
        Delete Analysis
      </Menu.Item>
    </Menu>
  );
};

export default AnalysesMenu;
