import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert, IoInformationCircle } from 'react-icons/io5';
import deleteConfig from '../../mutations/Configs/deleteConfig';

const useDeleteConfig = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(deleteConfig, {
    onMutate: async (configId) => {
      await queryClient.cancelQueries('configs');

      const previousConfigs = queryClient.getQueryData('configs');
      queryClient.setQueryData('configs', previousConfigs.filter((config) => config._id !== configId));
      return { previousConfigs };
    },
    onError: (err, configId, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to delete config!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('configs', context.previousConfigs);
    },
    onSuccess: (res, configId, context: any) => {
      if (res.status !== 200) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to delete config!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('configs', context.previousConfigs);
      }
      notifications.showNotification({
        title: 'Success', message: 'Successfully deleted the config!', color: 'green', icon: <IoInformationCircle />
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries('configs');
    }
  });
};

export default useDeleteConfig;
