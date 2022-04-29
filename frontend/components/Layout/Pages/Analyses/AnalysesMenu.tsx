import { Menu } from '@mantine/core';
import { useState } from 'react';
import {
  IoTrash
} from 'react-icons/io5';
import useDeleteAnalysis from '../../../../hooks/Analysis/useDeleteAnalysis';
import ConfirmDeleteModal from '../../../Common/ConfirmDeleteModal/ConfirmDeleteModal';

const AnalysesMenu = ({ analysisId }) => {
  const deleteAnalysis = useDeleteAnalysis();
  const [delOpen, setDelOpen] = useState(false);

  return (
    <>
      <Menu>
        <Menu.Label>Danger Zone</Menu.Label>
        <Menu.Item
          color="red"
          icon={<IoTrash />}
          onClick={() => setDelOpen(true)}
        >
          Delete
        </Menu.Item>
      </Menu>
      <ConfirmDeleteModal
        id={analysisId}
        open={delOpen}
        onClose={() => setDelOpen(false)}
        deleteMutation={deleteAnalysis}
        type="analysis"
      />
    </>
  );
};

export default AnalysesMenu;
