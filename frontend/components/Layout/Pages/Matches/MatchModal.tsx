import { useEffect, useState } from 'react';
import {
  Button, Group, Modal, TextInput, Text, Select
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useForm } from '@mantine/hooks';
import {
  IoCloudUpload, IoSave, IoStop
} from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import useCreateMatch from '../../../../hooks/Matches/useCreateMatch';
import useConfigs from '../../../../hooks/Configs/useConfigs';
import matchModalState from '../../../../atoms/matchModalState';
import useMatches from '../../../../hooks/Matches/useMatches';
import useEditMatch from '../../../../hooks/Matches/useEditMatch';

const NewMatchModal = () => {
  const [modal, setModal] = useRecoilState(matchModalState);
  const createMatch = useCreateMatch();
  const editMatch = useEditMatch();
  const { data: matches } = useMatches();
  const { data: configs, status: configsStatus } = useConfigs();

  const [error, setError] = useState(null);
  const [files, setFiles] = useState(null);
  const form = useForm({
    initialValues: {
      title: '',
      config: ''
    },
    validationRules: {
      title: (value) => /^.{5,35}$/.test(value),
    },
    errorMessages: {
      title: 'Invalid title'
    },
  });

  useEffect(() => {
    if (modal.open && modal.edit && modal.matchId !== '') {
      form.setFieldValue('title', matches.find((match) => match._id === modal.matchId).title);
    }
  }, [modal.matchId, modal.edit, modal.open]);

  const submitUpload = () => {
    setError(null);

    if (modal.edit) {
      editMatch.mutate({
        matchId: modal.matchId,
        changes: {
          title: form.values.title
        }
      });
      handleClose();
    } else if (files !== null) {
      const formData = new FormData();
      formData.append('match', files[0]);
      formData.append('title', form.values.title);
      formData.append('configId', form.values.config);
      createMatch.mutate(formData);
      handleClose();
    } else {
      setError('Please select a file to upload!');
    }
  };

  const handleClose = () => {
    setModal({
      open: false,
      edit: modal.edit,
      matchId: modal.matchId
    });
    setTimeout(() => {
      form.reset();
      setFiles(null);
      setError(null);
    }, 250);
  };

  return (
    <Modal
      opened={modal.open}
      onClose={handleClose}
      title={modal.edit ? 'Edit Match' : 'New Match'}
    >
      <Group grow direction="column" spacing="sm">
        <TextInput
          required
          label="Title"
          placeholder=""
          {...form.getInputProps('title')}
        />
        {!modal.edit && (
          <>
            <Select
              label="Config"
              placeholder="Select a config"
              data={configsStatus === 'success' ? configs.map((config) => ({ value: config._id, label: config.title })) : []}
              {...form.getInputProps('config')}
              searchable
              clearable
            />
            {files === null ? (
              <Dropzone
                onDrop={(file) => setFiles(file)}
                onReject={(file) => console.log('rejected files', file)}
                maxSize={300 * 1024 ** 2}
                multiple={false}
                accept={['video/x-matroska']}
              >
                {(status) => (
                  <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                    {status.rejected && <IoStop />}
                    <IoCloudUpload />
                    <div>
                      <Text inline>
                        Drag videos here or click to select
                      </Text>
                      <Text size="xs" color="dimmed" inline mt={7}>
                        The video should not exceed 500mb
                      </Text>
                    </div>
                  </Group>
                )}
              </Dropzone>
            ) : (
              `${files[0].name} | ${files[0].size}bytes`
            )}
          </>
        )}
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
            onClick={submitUpload}
            leftIcon={modal.edit ? <IoSave /> : <IoCloudUpload />}
          >
            {modal.edit ? 'Save' : 'Upload'}
          </Button>
        </Group>
      </Group>
    </Modal>
  );
};

export default NewMatchModal;
