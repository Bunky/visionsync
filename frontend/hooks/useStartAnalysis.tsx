import { useMutation, useQueryClient } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import startAnalysis from '../mutations/startAnalysis';

const useStartAnalysis = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(startAnalysis, {
    onMutate: async (updatedSetting) => {
      await queryClient.cancelQueries('analysis');
    },
    onError: (err, updatedSetting, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to stop remote analysis!', color: 'red', icon: <IoAlert />
      });
    },
    onSuccess: (res, updatedSetting, context: any) => {
      if (res.status === 429) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to stop remote analysis!', color: 'red', icon: <IoAlert />
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('analysis');
    }
  });
};

export default useStartAnalysis;
