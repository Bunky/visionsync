import { Menu, Divider } from '@mantine/core';
import { useState } from 'react';
import {
  IoTrash,
  IoPencil,
  IoCopy
} from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import editConfigModalState from '../../../../atoms/configModalState';
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
            duplicate: false,
            configId
          })}
        >
          Edit
        </Menu.Item>
        <Menu.Item
          icon={<IoCopy />}
          onClick={() => setModal({
            open: true,
            duplicate: true,
            configId
          })}
        >
          Duplicate
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
