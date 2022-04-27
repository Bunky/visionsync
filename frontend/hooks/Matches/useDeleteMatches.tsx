import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import deleteMatches from '../../mutations/Matches/deleteMatches';

const useDeleteMatches = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(deleteMatches, {
    onMutate: async (matchIds) => {
      await queryClient.cancelQueries('matches');

      const previousMatches = queryClient.getQueryData('matches');
      queryClient.setQueryData('matches', previousMatches.filter((match) => matchIds.indexOf(match._id) === -1));
      return { previousMatches };
    },
    onError: (err, matchIds, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to delete matches!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('matches', context.previousMatches);
    },
    onSuccess: (res, matchIds, context: any) => {
      if (res.status === 429 || res.status === 500) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to delete matches!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('matches', context.previousMatches);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('matches');
    }
  });
};

export default useDeleteMatches;
