import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert, IoInformationCircle } from 'react-icons/io5';
import editMatch from '../../mutations/Matches/editMatch';

const useEditMatch = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(editMatch, {
    onMutate: async (updatedMatch) => {
      await queryClient.cancelQueries('matches');
      const previousMatches = queryClient.getQueryData('matches');

      const updatedMatches = previousMatches.map((match) => {
        if (match._id === updatedMatch.matchId) {
          return { ...match, ...updatedMatch.changes };
        }
        return { ...match };
      });

      queryClient.setQueryData('matches', updatedMatches);
      return { previousMatches: updatedMatches };
    },
    onError: (err, newMatch, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to edit match!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('matches', context.previousMatches);
    },
    onSuccess: (res, newMatch, context: any) => {
      if (res.status !== 200) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to edit match!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('matches', context.previousMatches);
      }
      notifications.showNotification({
        title: 'Success', message: 'Successfully edited the match!', color: 'green', icon: <IoInformationCircle />
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries('matches');
    }
  });
};

export default useEditMatch;
