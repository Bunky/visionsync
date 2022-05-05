import { Menu, Divider } from '@mantine/core';
import { useState } from 'react';
import {
  IoTrash,
  IoPencil
} from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import matchModalState from '../../../atoms/matchModalState';
import useDeleteMatch from '../../../hooks/Matches/useDeleteMatch';
import ConfirmDeleteModal from '../../Common/ConfirmDeleteModal/ConfirmDeleteModal';

const MatchMenu = ({ matchId }) => {
  const deleteMatch = useDeleteMatch();
  const [, setModal] = useRecoilState(matchModalState);
  const [delOpen, setDelOpen] = useState(false);

  return (
    <>
      <Menu>
        <Menu.Label>Match</Menu.Label>
        <Menu.Item
          icon={<IoPencil />}
          onClick={() => setModal({
            open: true,
            edit: true,
            matchId
          })}
        >
          Edit
        </Menu.Item>
        <Divider />
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
