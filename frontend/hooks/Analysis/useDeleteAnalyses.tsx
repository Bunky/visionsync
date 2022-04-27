import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import deleteAnalyses from '../../mutations/Analyses/deleteAnalyses';

const useDeleteAnalyses = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(deleteAnalyses, {
    onMutate: async (analysisIds) => {
      await queryClient.cancelQueries('analyses');

      const previousAnalyses = queryClient.getQueryData('analyses');
      queryClient.setQueryData('analyses', previousAnalyses.filter((analysis) => analysisIds.indexOf(analysis._id) === -1));
      return { previousAnalyses };
    },
    onError: (err, analysisIds, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to delete analyses!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('analyses', context.previousAnalyses);
    },
    onSuccess: (res, analysisIds, context: any) => {
      if (res.status === 429 || res.status === 500) {
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
