import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
// import _ from 'lodash';
import updateConfig from '../mutations/updateConfig';

const useUpdateConfig = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(updateConfig, {
    onMutate: async (updatedSetting) => {
      await queryClient.cancelQueries('config');
      // const previousConfig = queryClient.getQueryData('config');

      // queryClient.setQueryData('config', _.merge(previousConfig, updatedSetting));
      // return { previousConfig };
    },
    onError: (err, updatedSetting, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to update settings remotely!', color: 'red', icon: <IoAlert />
      });
      // queryClient.setQueryData('config', context.previousConfig);
    },
    onSuccess: (res, updatedSetting, context: any) => {
      if (res.status === 429) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to update settings remotely!', color: 'red', icon: <IoAlert />
        });
        // queryClient.setQueryData('config', context.previousConfig);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('config');
    }
  });
};

export default useUpdateConfig;
