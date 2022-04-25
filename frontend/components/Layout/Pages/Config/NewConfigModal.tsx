import {
  Text, Group, Button, Modal, TextInput
} from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { useState } from 'react';
import useNewConfig from '../../../../hooks/Configs/useNewConfig';

const NewConfigModal = ({ open, setOpen }) => {
  const newConfig = useNewConfig();
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

  const submitSave = () => {
    setError(null);
    newConfig.mutate({
      title: form.values.title
    });

    handleClose();
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      title="New Config"
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

export default NewConfigModal;
