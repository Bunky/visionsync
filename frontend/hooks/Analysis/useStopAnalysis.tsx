import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import stopAnalysis from '../../mutations/stopAnalysis';

const useStopAnalysis = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const router = useRouter();

  return useMutation(stopAnalysis, {
    onMutate: async (updatedSetting) => {
      await queryClient.cancelQueries('analysis');
    },
    onError: (err, updatedSetting, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to start remote analysis!', color: 'red', icon: <IoAlert />
      });
    },
    onSuccess: (res, updatedSetting, context: any) => {
      if (res.status === 429 || res.status === 500) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to start remote analysis!', color: 'red', icon: <IoAlert />
        });
      }

      if (res.status === 200) {
        router.push('/');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('analysis');
    }
  });
};

export default useStopAnalysis;
