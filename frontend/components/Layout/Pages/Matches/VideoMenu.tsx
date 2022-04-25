import { Menu, Divider } from '@mantine/core';
import {
  IoTrash,
  IoPencil
} from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import editMatchModalState from '../../../../atoms/editMatchModalState';
import useDeleteMatch from '../../../../hooks/Matches/useDeleteMatch';

const VideoMenu = ({ matchId }) => {
  const deleteMatch = useDeleteMatch();
  const [, setModal] = useRecoilState(editMatchModalState);

  return (
    <Menu>
      <Menu.Label>Video</Menu.Label>
      <Menu.Item
        icon={<IoPencil size={14} />}
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
        icon={<IoTrash size={14} />}
        onClick={() => deleteMatch.mutate({ matchId })}
      >
        Delete Video
      </Menu.Item>
    </Menu>
  );
};

export default VideoMenu;
