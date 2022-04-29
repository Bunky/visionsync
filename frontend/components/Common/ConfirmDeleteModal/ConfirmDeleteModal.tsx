import {
  Group,
  Modal,
  Button,
  Text,
  Stack
} from '@mantine/core';
import { IoClose, IoTrash } from 'react-icons/io5';

const ConfirmDeleteModal = ({
  id, deleteMutation, open, onClose, type
}) => (
  <Modal
    opened={open}
    onClose={onClose}
    centered
    title="Confirm Deletion"
  >
    <Stack>
      <Text size="sm">
        {`Are you sure you want to delete this ${type}?`}
      </Text>
      <Group noWrap position="right">
        <Button
          variant="default"
          leftIcon={<IoClose />}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          loading={deleteMutation.isLoading}
          color="red"
          leftIcon={<IoTrash />}
          onClick={() => {
            deleteMutation.mutate(id);
            onClose();
          }}
        >
          Delete
        </Button>
      </Group>
    </Stack>
  </Modal>
);

export default ConfirmDeleteModal;
