import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import deleteConfigs from '../../mutations/Configs/deleteConfigs';

const useDeleteConfigs = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(deleteConfigs, {
    onMutate: async (configIds) => {
      await queryClient.cancelQueries('configs');

      const previousConfigs = queryClient.getQueryData('configs');
      queryClient.setQueryData('configs', previousConfigs.filter((config) => configIds.indexOf(config._id) === -1));
      return { previousConfigs };
    },
    onError: (err, configIds, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to delete configs!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('configs', context.previousConfigs);
    },
    onSuccess: (res, configIds, context: any) => {
      if (res.status === 429 || res.status === 500) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to delete configs!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('configs', context.previousConfigs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('configs');
    }
  });
};

export default useDeleteConfigs;
