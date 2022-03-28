import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import deleteMatch from '../../mutations/Matches/deleteMatch';

const useDeleteMatch = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(deleteMatch, {
    onMutate: async (delMatch) => {
      await queryClient.cancelQueries('matches');

      const previousMatches = queryClient.getQueryData('matches');
      queryClient.setQueryData('matches', previousMatches.filter((match) => match.matchId !== delMatch.matchId));
      return { previousMatches };
    },
    onError: (err, newMatch, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to delete match!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('matches', context.previousMatches);
    },
    onSuccess: (res, newMatch, context: any) => {
      if (res.status === 429) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to delete match!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('matches', context.previousMatches);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('matches');
    }
  });
};

export default useDeleteMatch;
