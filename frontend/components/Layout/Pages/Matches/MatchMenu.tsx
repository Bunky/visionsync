import { Menu, Divider } from '@mantine/core';
import { useState } from 'react';
import {
  IoTrash,
  IoPencil
} from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import editMatchModalState from '../../../../atoms/editMatchModalState';
import useDeleteMatch from '../../../../hooks/Matches/useDeleteMatch';
import ConfirmDeleteModal from '../../../Common/ConfirmDeleteModal/ConfirmDeleteModal';

const MatchMenu = ({ matchId }) => {
  const deleteMatch = useDeleteMatch();
  const [, setModal] = useRecoilState(editMatchModalState);
  const [delOpen, setDelOpen] = useState(false);

  return (
    <>
      <Menu>
        <Menu.Label>Video</Menu.Label>
        <Menu.Item
          icon={<IoPencil />}
          onClick={() => setModal({
            open: true,
            matchId
          })}
        >
          Edit Video
        </Menu.Item>
        <Divider />
        <Menu.Label>Danger Zone</Menu.Label>
        <Menu.Item
          color="red"
          icon={<IoTrash />}
          onClick={() => setDelOpen(true)}
        >
          Delete Match
        </Menu.Item>
      </Menu>
      <ConfirmDeleteModal
        id={matchId}
        open={delOpen}
        onClose={() => setDelOpen(false)}
        deleteMutation={deleteMatch}
        type="match"
      />
    </>
  );
};

export default MatchMenu;
