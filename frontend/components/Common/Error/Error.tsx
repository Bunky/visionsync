import { Group, Stack, Text } from '@mantine/core';
import { IoAlert } from 'react-icons/io5';

const Error = () => (
  <Group>
    <Text color="red" size="xl">
      <IoAlert />
    </Text>
    <Stack spacing={0}>
      <Text>
        Error fetching data!
      </Text>
      <Text size="xs" color="dimmed">
        Please try again later.
      </Text>
    </Stack>
  </Group>
);

export default Error;
