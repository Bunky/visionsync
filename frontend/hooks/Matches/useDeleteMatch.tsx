import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert, IoInformationCircle } from 'react-icons/io5';
import deleteMatch from '../../mutations/Matches/deleteMatch';

const useDeleteMatch = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(deleteMatch, {
    onMutate: async (matchId) => {
      await queryClient.cancelQueries('matches');

      const previousMatches = queryClient.getQueryData('matches');
      queryClient.setQueryData('matches', previousMatches.filter((match) => match._id !== matchId));
      return { previousMatches };
    },
    onError: (err, matchId, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to delete match!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('matches', context.previousMatches);
    },
    onSuccess: (res, matchId, context: any) => {
      if (res.status !== 200) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to delete match!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('matches', context.previousMatches);
      }
      notifications.showNotification({
        title: 'Success', message: 'Successfully deleted the match!', color: 'green', icon: <IoInformationCircle />
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries('matches');
    }
  });
};

export default useDeleteMatch;
