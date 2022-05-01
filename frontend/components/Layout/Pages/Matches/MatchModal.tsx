import { useEffect, useState } from 'react';
import {
  Button, Group, Modal, TextInput, Text, Select, Stack, ActionIcon
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useForm } from '@mantine/hooks';
import {
  IoAlert, IoClose, IoCloudUpload, IoSave, IoStop, IoVideocam
} from 'react-icons/io5';
import { AiOutlineFile } from 'react-icons/ai';
import { useRecoilState } from 'recoil';
import { useNotifications } from '@mantine/notifications';
import prettyBytes from 'pretty-bytes';
import useCreateMatch from '../../../../hooks/Matches/useCreateMatch';
import useConfigs from '../../../../hooks/Configs/useConfigs';
import matchModalState from '../../../../atoms/matchModalState';
import useMatches from '../../../../hooks/Matches/useMatches';
import useEditMatch from '../../../../hooks/Matches/useEditMatch';

const NewMatchModal = () => {
  const notifications = useNotifications();
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
            <Stack justify="flex-start" spacing={0}>
              <Text mb={4}>
                File
              </Text>
              {files === null ? (
                <Dropzone
                  onDrop={(file) => setFiles(file)}
                  onReject={(rejectedFiles) => {
                    notifications.showNotification({
                      title: 'Error', message: rejectedFiles[0].errors[0].message, color: 'red', icon: <IoAlert />
                    });
                  }}
                  maxSize={500 * 1024 ** 2}
                  multiple={false}
                  accept={['video/x-matroska']}
                >
                  {(status) => (
                    <Group position="center" spacing="xl" style={{ minHeight: 80, pointerEvents: 'none' }}>
                      <Text size="xl" color="dimmed">
                        {status.rejected && <IoStop />}
                        <IoVideocam />
                      </Text>
                      <Stack spacing={0}>
                        <Text>
                          Drag videos here or click to select
                        </Text>
                        <Text size="xs" color="dimmed">
                          The video should not exceed 500mb
                        </Text>
                      </Stack>
                    </Group>
                  )}
                </Dropzone>
              ) : (
                <Group position="apart">
                  <Group>
                    <Text size="xl" color="dimmed" inline>
                      <AiOutlineFile />
                    </Text>
                    <Text>
                      {files[0].name}
                    </Text>
                  </Group>
                  <Group>
                    <Text>
                      {prettyBytes(files[0].size)}
                    </Text>
                    <ActionIcon
                      onClick={() => setFiles(null)}
                    >
                      <IoClose />
                    </ActionIcon>
                  </Group>
                </Group>
              )}
            </Stack>
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
