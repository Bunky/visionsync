import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import newConfig from '../../mutations/Configs/newConfig';

const useNewConfig = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(newConfig, {
    onMutate: async (newConfigParams) => {
      await queryClient.cancelQueries('configs');
      const previousConfigs = queryClient.getQueryData('configs');

      previousConfigs.push({
        createdAt: new Date(),
        config: {},
        ...newConfigParams
      });

      queryClient.setQueryData('configs', previousConfigs);
      return { previousConfigs };
    },
    onError: (err, newConfigParams, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to save new config!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('configs', context.previousConfigs);
    },
    onSuccess: (res, newConfigParams, context: any) => {
      if (res.status === 429 || res.status === 500) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to save new config!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('configs', context.previousConfigs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('configs');
    }
  });
};

export default useNewConfig;
