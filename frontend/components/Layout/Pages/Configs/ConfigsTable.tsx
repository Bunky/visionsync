/* eslint-disable react/no-unstable-nested-components */
import {
  Group, Button
} from '@mantine/core';
import { IoCode } from 'react-icons/io5';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import { useMemo } from 'react';
import useConfigs from '../../../../hooks/Configs/useConfigs';
import ConfigsMenu from './ConfigsMenu';
import viewConfigModalState from '../../../../atoms/viewConfigModalState';
import useDeleteConfigs from '../../../../hooks/Configs/useDeleteConfigs';
import Table from '../../../Common/Table/Table';

const ConfigsTable = () => {
  const { data: configs } = useConfigs();
  const [, setModal] = useRecoilState(viewConfigModalState);
  const deleteConfigs = useDeleteConfigs();

  const columns = useMemo(() => [{
    Header: 'Title',
    accessor: 'title',
    minWidth: 200,
  }, {
    Header: 'Uploaded',
    accessor: 'createdAt',
    Cell: ({ value }) => format(new Date(value), 'dd/MM/yyyy HH:mm'),
    maxWidth: 200,
    minWidth: 160,
  }, {
    Header: '',
    accessor: 'actions',
    Cell: ({ row }) => (
      <Group position="right" noWrap sx={{ width: '100%' }}>
        <Button
          onClick={() => setModal({
            open: true,
            configId: row.original._id
          })}
          leftIcon={<IoCode />}
          compact
        >
          View Config
        </Button>
        <ConfigsMenu configId={row.original._id} />
      </Group>
    ),
    width: 173,
    maxWidth: 173,
    minWidth: 173,
    disableSortBy: true
  }], []);

  return (
    <Table
      data={configs}
      columns={columns}
      deleteMutation={deleteConfigs}
    />
  );
};

export default ConfigsTable;
