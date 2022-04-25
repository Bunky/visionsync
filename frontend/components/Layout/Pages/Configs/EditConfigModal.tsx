import {
  Text, Group, Button, Modal, TextInput
} from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import editConfigModalState from '../../../../atoms/editConfigModalState';
import useConfigs from '../../../../hooks/Configs/useConfigs';
import useEditConfig from '../../../../hooks/Configs/useEditConfig';

const EditConfigModal = () => {
  const [modal, setModal] = useRecoilState(editConfigModalState);
  const { data: configs, status: configsStatus } = useConfigs();
  const editConfig = useEditConfig();

  const [error, setError] = useState(null);
  const form = useForm({
    initialValues: {
      title: '',
    },
    validationRules: {
      title: (value) => /^.{5,35}$/.test(value),
    },
    errorMessages: {
      title: 'Invalid title'
    },
  });

  useEffect(() => {
    if (modal.open && modal.configId !== '') {
      form.setFieldValue('title', configs.filter((config) => config._id === modal.configId)[0].title);
    }
  }, [modal.configId]);

  const submitSave = () => {
    setError(null);
    editConfig.mutate({
      configId: modal.configId,
      changes: {
        title: form.values.title
      }
    });

    handleClose();
  };

  const handleClose = () => {
    form.reset();
    setModal({
      open: false,
      configId: modal.configId
    });
  };

  return (
    <Modal
      opened={modal.open}
      onClose={handleClose}
      title="Edit Config"
    >
      <Group grow direction="column" spacing="sm">
        <TextInput
          required
          label="Title"
          placeholder=""
          {...form.getInputProps('title')}
        />
        {!!error && (
          <Text color="red" size="sm">
            {error}
          </Text>
        )}
        <Button onClick={submitSave}>Save</Button>
      </Group>
    </Modal>
  );
};

export default EditConfigModal;
