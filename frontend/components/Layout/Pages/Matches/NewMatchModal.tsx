import { useState } from 'react';
import {
  Button, Group, Modal, TextInput, Text
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
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

      setOpened(false);
    } else {
      setError('Please select a file to upload!');
    }
  };

  return (
    <Group>
      <Button onClick={() => setOpened(true)}>
        New Match
      </Button>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
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
              accept={[MIME_TYPES.mp4]}
            >
              {(status) => (
                <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                  {/* {status.accepted && <IoCloudUpload />} */}
                  {status.rejected && <IoStop />}
                  <IoCloudUpload />

                  <div>
                    <Text size="xl" inline>
                      Drag images here or click to select files
                    </Text>
                    <Text size="sm" color="dimmed" inline mt={7}>
                      Attach as many files as you like, each file should not exceed 5mb
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
