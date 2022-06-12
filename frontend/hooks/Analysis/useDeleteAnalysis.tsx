import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert, IoInformationCircle } from 'react-icons/io5';
import deleteAnalysis from '../../mutations/Analyses/deleteAnalysis';

const useDeleteAnalysis = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(deleteAnalysis, {
    onMutate: async (analysisId) => {
      await queryClient.cancelQueries('analyses');

      const previousAnalyses = queryClient.getQueryData('analyses');
      queryClient.setQueryData('analyses', previousAnalyses.filter((analysis) => analysis._id !== analysisId));
      return { previousAnalyses };
    },
    onError: (err, analysisId, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to delete analysis!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('analyses', context.previousAnalyses);
    },
    onSuccess: (res, analysisId, context: any) => {
      if (res.status !== 200) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to delete analysis!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('analyses', context.previousAnalyses);
      }
      notifications.showNotification({
        title: 'Success', message: 'Successfully deleted the analysis!', color: 'green', icon: <IoInformationCircle />
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries('analyses');
    }
  });
};

export default useDeleteAnalysis;
