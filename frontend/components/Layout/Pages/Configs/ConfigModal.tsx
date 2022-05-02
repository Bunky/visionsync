import {
  Text, Group, Button, Modal, TextInput
} from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { IoCopy, IoSave } from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import configModalState from '../../../../atoms/configModalState';
import useConfigs from '../../../../hooks/Configs/useConfigs';
import useEditConfig from '../../../../hooks/Configs/useEditConfig';

const ConfigModal = () => {
  const [modal, setModal] = useRecoilState(configModalState);
  const { data: configs } = useConfigs();
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
    if (modal.open && modal.configId !== '' && !modal.duplicate) {
      form.setFieldValue('title', configs.find((config) => config._id === modal.configId).title);
    }
  }, [modal.configId, modal.duplicate, modal.open]);

  const submitSave = (values) => {
    setError(null);
    editConfig.mutate({
      configId: modal.configId,
      duplicate: modal.duplicate,
      changes: {
        title: values.title
      }
    });

    handleClose();
  };

  const handleClose = () => {
    setTimeout(() => {
      form.reset();
      setError(null);
    }, 250);
    setModal({
      open: false,
      duplicate: modal.duplicate,
      configId: modal.configId
    });
  };

  return (
    <Modal
      opened={modal.open}
      onClose={handleClose}
      title={modal.duplicate ? 'Duplicate Config' : 'Edit Config'}
    >
      <form onSubmit={form.onSubmit(submitSave)}>
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
          <Group noWrap position="right">
            <Button
              variant="default"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftIcon={modal.duplicate ? <IoCopy /> : <IoSave />}
            >
              {modal.duplicate ? 'Create' : 'Save'}
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
};

export default ConfigModal;