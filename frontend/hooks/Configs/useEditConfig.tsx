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
      let previousConfigs = queryClient.getQueryData('configs');

      if (updatedConfig.duplicate) {
        const config = previousConfigs.find((pConfig) => pConfig._id === updatedConfig.configId);
        previousConfigs = [...previousConfigs, {
          ...config, _id: 'temp', title: updatedConfig.changes.title, createdAt: new Date()
        }];
      } else {
        previousConfigs = previousConfigs.map((config) => {
          if (config._id === updatedConfig.configId) {
            return { ...config, ...updatedConfig.changes };
          }
          return { ...config };
        });
      }

      queryClient.setQueryData('configs', previousConfigs);
      return { previousConfigs };
    },
    onError: (err, newConfig, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to edit config!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('configs', context.previousConfigs);
    },
    onSuccess: (res, newConfig, context: any) => {
      if (res.status === 429 || res.status === 500) {
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
