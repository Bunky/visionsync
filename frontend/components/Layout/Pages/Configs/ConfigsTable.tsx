import {
  Table, ScrollArea, Group, Button, Center, Loader
} from '@mantine/core';
import { IoCode } from 'react-icons/io5';
import { format } from 'date-fns';
import { useRecoilState } from 'recoil';
import useConfigs from '../../../../hooks/Configs/useConfigs';
import ConfigsMenu from './ConfigsMenu';
import viewConfigModalState from '../../../../atoms/viewConfigModalState';
import EditConfigModal from './EditConfigModal';

const ConfigsTable = () => {
  const { data: configs, status: configsStatus } = useConfigs();
  const [, setModal] = useRecoilState(viewConfigModalState);

  if (configsStatus === 'loading') {
    return (<Center sx={{ height: '100%' }}><Loader /></Center>);
  }

  if (configsStatus === 'error') {
    return (<Center sx={{ height: '100%' }}>Error</Center>);
  }

  return (
    <ScrollArea sx={{ height: 600 }} offsetScrollbars>
      <Table verticalSpacing="xs">
        <thead>
          <tr>
            <th>Config</th>
            <th>Uploaded</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {configs && configs.map((config) => (
            <tr key={config._id} style={{ position: 'relative' }}>
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
