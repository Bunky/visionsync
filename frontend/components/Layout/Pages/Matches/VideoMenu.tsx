import { Menu, Divider } from '@mantine/core';
import {
  IoTrash,
  IoPencil
} from 'react-icons/io5';
import useDeleteMatch from '../../../../hooks/Matches/useDeleteMatch';

const VideoMenu = ({ matchId }) => {
  const deleteMatch = useDeleteMatch();
  return (
    <Menu>
      <Menu.Label>Video</Menu.Label>
      <Menu.Item icon={<IoPencil size={14} />}>Edit Video</Menu.Item>
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
