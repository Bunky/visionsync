import {
  Table, ScrollArea, Group, Button, Center, Loader, Checkbox
} from '@mantine/core';
import { IoCode } from 'react-icons/io5';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import { useState } from 'react';
import useConfigs from '../../../../hooks/Configs/useConfigs';
import ConfigsMenu from './ConfigsMenu';
import viewConfigModalState from '../../../../atoms/viewConfigModalState';
import EditConfigModal from './EditConfigModal';
import useDeleteConfigs from '../../../../hooks/Configs/useDeleteConfigs';

const ConfigsTable = () => {
  const { data: configs, status: configsStatus } = useConfigs();
  const [, setModal] = useRecoilState(viewConfigModalState);
  const deleteConfigs = useDeleteConfigs();
  const [selection, setSelection] = useState([]);

  // eslint-disable-next-line max-len
  const toggleRow = (analysisId) => setSelection((current) => (current.includes(analysisId) ? current.filter((item) => item !== analysisId) : [...current, analysisId]));
  const toggleAll = () => setSelection((current) => (current.length === configs.length ? [] : configs.map((item) => item._id)));

  if (configsStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (configsStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <ScrollArea sx={{ height: 600 }} offsetScrollbars>
      {selection.length > 0 && (
        <Button
          onClick={() => {
            deleteConfigs.mutate(selection);
            setSelection([]);
          }}
        >
          Delete Selected
        </Button>
      )}
      <Table verticalSpacing="xs">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <Checkbox
                onChange={toggleAll}
                checked={selection.length === configs.length}
                indeterminate={selection.length > 0 && selection.length !== configs.length}
              />
            </th>
            <th>Config</th>
            <th>Date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {configs && configs.map((config) => (
            <tr key={config._id} style={{ position: 'relative' }}>
              <td>
                <Checkbox
                  checked={selection.includes(config._id)}
                  onChange={() => toggleRow(config._id)}
                />
              </td>
              <td>{config.title}</td>
              <td>{format(new Date(config.createdAt), 'dd/MM/yyyy HH:mm')}</td>
              <td>
                <Group position="right">
                  <Button
                    onClick={() => setModal({
                      open: true,
                      configId: config._id
                    })}
                    leftIcon={<IoCode />}
                    compact
                  >
                    View Config
                  </Button>
                  <ConfigsMenu configId={config._id} />
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <EditConfigModal />
    </ScrollArea>
  );
};

export default ConfigsTable;
