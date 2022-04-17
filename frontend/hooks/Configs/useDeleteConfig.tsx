import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import deleteConfig from '../../mutations/Configs/deleteConfig';

const useDeleteConfig = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(deleteConfig, {
    onMutate: async (delConfigs) => {
      await queryClient.cancelQueries('configs');

      const previousConfigs = queryClient.getQueryData('configs');
      queryClient.setQueryData('configs', previousConfigs.filter((config) => config._id !== delConfigs._id));
      return { previousConfigs };
    },
    onError: (err, newMatch, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to delete config!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('configs', context.previousConfigs);
    },
    onSuccess: (res, newMatch, context: any) => {
      if (res.status === 429) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to delete config!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('configs', context.previousConfigs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('configs');
    }
  });
};

export default useDeleteConfig;
