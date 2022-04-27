import { Menu, Divider } from '@mantine/core';
import {
  IoTrash,
  IoPencil
} from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import editConfigModalState from '../../../../atoms/editConfigModalState';
import useDeleteConfig from '../../../../hooks/Configs/useDeleteConfig';

const ConfigsMenu = ({ configId }) => {
  const deleteConfig = useDeleteConfig();
  const [, setModal] = useRecoilState(editConfigModalState);

  return (
    <Menu>
      <Menu.Label>Config</Menu.Label>
      <Menu.Item
        icon={<IoPencil size={14} />}
        onClick={() => setModal({
          open: true,
          configId
        })}
      >
        Edit Config
      </Menu.Item>
      <Divider />
      <Menu.Label>Danger Zone</Menu.Label>
      <Menu.Item
        color="red"
        icon={<IoTrash size={14} />}
        onClick={() => deleteConfig.mutate(configId)}
      >
        Delete Config
      </Menu.Item>
    </Menu>
  );
};

export default ConfigsMenu;
