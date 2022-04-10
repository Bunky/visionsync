import { useState } from 'react';
import {
  Button, Group, Modal, TextInput, Text
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { useForm } from '@mantine/hooks';
import { IoCloudUpload, IoStop } from 'react-icons/io5';
import useUploadFile from '../../../../hooks/useUploadFile';

const NewMatchModal = () => {
  const uploadFile = useUploadFile();

  const [opened, setOpened] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState(null);
  const form = useForm({
    initialValues: {
      title: ''
    },
    validationRules: {
      title: (value) => /^.{5,35}$/.test(value),
    },
    errorMessages: {
      title: 'Invalid title'
    },
  });

  const submitUpload = () => {
    setError(null);

    if (files !== null) {
      const formData = new FormData();
      formData.append('match', files[0]);
      formData.append('title', form.values.title);
      uploadFile.mutate(formData);

      handleClose();
    } else {
      setError('Please select a file to upload!');
    }
  };

  const handleClose = () => {
    setOpened(false);
    setTimeout(() => {
      form.reset();
      setFiles(null);
      setError(null);
    }, 250);
  };

  return (
    <Group>
      <Button onClick={() => setOpened(true)}>
        New Match
      </Button>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="New Match"
      >
        <Group grow direction="column" spacing="sm">
          <TextInput
            required
            label="Title"
            placeholder=""
            {...form.getInputProps('title')}
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
          {!!error && (
            <Text color="red" size="sm">
              {error}
            </Text>
          )}
          <Button onClick={submitUpload}>Upload</Button>
        </Group>
      </Modal>
    </Group>
  );
};

export default NewMatchModal;
