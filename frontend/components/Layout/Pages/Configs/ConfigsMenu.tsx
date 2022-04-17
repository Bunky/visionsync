import { Menu, Divider } from '@mantine/core';
import {
  IoTrash,
  IoPencil
} from 'react-icons/io5';
import useDeleteConfig from '../../../../hooks/Configs/useDeleteConfig';

const ConfigsMenu = ({ configId }) => {
  const deleteConfig = useDeleteConfig();
  return (
    <Menu>
      <Menu.Label>Config</Menu.Label>
      <Menu.Item icon={<IoPencil size={14} />}>Edit Config</Menu.Item>
      <Divider />
      <Menu.Label>Danger Zone</Menu.Label>
      <Menu.Item
        color="red"
        icon={<IoTrash size={14} />}
        onClick={() => deleteConfig.mutate({ configId })}
      >
        Delete Config
      </Menu.Item>
    </Menu>
  );
};

export default ConfigsMenu;
