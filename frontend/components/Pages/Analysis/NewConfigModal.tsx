import {
  Text, Group, Button, Modal, TextInput
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { useState } from 'react';
import { IoSave } from 'react-icons/io5';
import useNewConfig from '../../../hooks/Configs/useNewConfig';

const validationSchema = z.object({
  title: z.string()
    .min(3, { message: 'The title should have at least 3 characters' })
    .max(50, { message: 'The title should have 50 or fewer characters' })
});

const NewConfigModal = ({ open, setOpen }) => {
  const newConfig = useNewConfig();
  const [error, setError] = useState(null);
  const form = useForm({
    initialValues: {
      title: '',
    },
    schema: zodResolver(validationSchema)
  });

  const submitSave = (values) => {
    setError(null);
    newConfig.mutate({
      title: values.title
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
      overlayBlur={3}
      size="lg"
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
              leftIcon={<IoSave />}
              type="submit"
            >
              Save
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
};

export default NewConfigModal;
