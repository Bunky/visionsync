import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import deleteAnalysis from '../../mutations/Analyses/deleteAnalysis';

const useDeleteAnalyses = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(deleteAnalysis, {
    onMutate: async (delAnalyses) => {
      await queryClient.cancelQueries('analyses');

      const previousAnalyses = queryClient.getQueryData('analyses');
      queryClient.setQueryData('analyses', previousAnalyses.filter((analysis) => analysis._id !== delAnalyses._id));
      return { previousAnalyses };
    },
    onError: (err, newMatch, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to delete analyses!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('analyses', context.previousAnalyses);
    },
    onSuccess: (res, newMatch, context: any) => {
      if (res.status === 429) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to delete analyses!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('analyses', context.previousAnalyses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('analyses');
    }
  });
};

export default useDeleteAnalyses;
