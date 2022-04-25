import {
  Text, Group, Button, Modal, TextInput
} from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import editMatchModalState from '../../../../atoms/editMatchModalState';
import useEditMatch from '../../../../hooks/Matches/useEditMatch';
import useMatches from '../../../../hooks/Matches/useMatches';

const EditMatchModal = () => {
  const [modal, setModal] = useRecoilState(editMatchModalState);
  const { data: matches, status: matchesStatus } = useMatches();
  const editMatch = useEditMatch();

  const [error, setError] = useState(null);
  const form = useForm({
    initialValues: {
      title: '',
      // config: ''
    },
    validationRules: {
      title: (value) => /^.{5,35}$/.test(value),
    },
    errorMessages: {
      title: 'Invalid title'
    },
  });

  useEffect(() => {
    if (modal.open && modal.matchId !== '') {
      form.setFieldValue('title', matches.filter((match) => match._id === modal.matchId)[0].title);
      // form.setFieldValue('config', matches.filter((match) => match._id === modal.matchId)[0].config);
    }
  }, [modal.matchId]);

  const submitSave = () => {
    setError(null);
    editMatch.mutate({
      matchId: modal.matchId,
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
      matchId: modal.matchId
    });
  };

  return (
    <Modal
      opened={modal.open}
      onClose={handleClose}
      title="Edit Match"
    >
      <Group grow direction="column" spacing="sm">
        <TextInput
          required
          label="Title"
          placeholder=""
          {...form.getInputProps('title')}
        />
        {/* <Select
          label="Config"
          placeholder="Select a config"
          data={configsStatus === 'success' ? configs.map((config) => ({ value: config._id, label: config.title })) : []}
          {...form.getInputProps('config')}
          searchable
        /> */}
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

export default EditMatchModal;
