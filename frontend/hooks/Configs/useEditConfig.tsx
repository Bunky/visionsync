import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import editConfig from '../../mutations/Configs/editConfig';

const useEditConfig = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(editConfig, {
    onMutate: async (updatedConfig) => {
      await queryClient.cancelQueries('configs');
      const previousConfigs = queryClient.getQueryData('configs');

      const updatedConfigs = previousConfigs.map((config) => {
        if (config._id === updatedConfig.configId) {
          return { ...config, ...updatedConfig.changes };
        }
        return { ...config };
      });

      queryClient.setQueryData('configs', updatedConfigs);
      return { previousConfigs: updatedConfigs };
    },
    onError: (err, newConfig, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to edit config!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('configs', context.previousConfigs);
    },
    onSuccess: (res, newConfig, context: any) => {
      if (res.status === 429) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to edit config!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('configs', context.previousConfigs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('configs');
    }
  });
};

export default useEditConfig;
