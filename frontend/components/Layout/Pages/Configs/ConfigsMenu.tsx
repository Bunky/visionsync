import { Menu, Divider } from '@mantine/core';
import { useState } from 'react';
import {
  IoTrash,
  IoPencil
} from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import editConfigModalState from '../../../../atoms/editConfigModalState';
import useDeleteConfig from '../../../../hooks/Configs/useDeleteConfig';
import ConfirmDeleteModal from '../../../Common/ConfirmDeleteModal/ConfirmDeleteModal';

const ConfigsMenu = ({ configId }) => {
  const deleteConfig = useDeleteConfig();
  const [, setModal] = useRecoilState(editConfigModalState);
  const [delOpen, setDelOpen] = useState(false);

  return (
    <>
      <Menu>
        <Menu.Label>Config</Menu.Label>
        <Menu.Item
          icon={<IoPencil />}
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
          icon={<IoTrash />}
          onClick={() => setDelOpen(true)}
        >
          Delete Config
        </Menu.Item>
      </Menu>
      <ConfirmDeleteModal
        id={configId}
        open={delOpen}
        onClose={() => setDelOpen(false)}
        deleteMutation={deleteConfig}
        type="config"
      />
    </>
  );
};

export default ConfigsMenu;
