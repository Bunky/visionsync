import { Menu, Divider } from '@mantine/core';
import {
  IoTrash,
  IoPencil
} from 'react-icons/io5';
import useDeleteAnalyses from '../../../../hooks/Analysis/useDeleteAnalysis';

const AnalysesMenu = ({ analysisId }) => {
  const deleteAnalysis = useDeleteAnalyses();
  return (
    <Menu>
      <Menu.Label>Analysis</Menu.Label>
      <Menu.Item icon={<IoPencil size={14} />}>Edit Analysis</Menu.Item>
      <Divider />
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
