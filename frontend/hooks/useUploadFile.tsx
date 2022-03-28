import { useQueryClient, useMutation } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import uploadFile from '../mutations/uploadFile';

const useUploadFile = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  return useMutation(uploadFile, {
    onMutate: async (newMatch) => {
      await queryClient.cancelQueries('matches');

      const previousMatches = queryClient.getQueryData('matches');
      queryClient.setQueryData('matches', [...previousMatches, {
        matchId: 'uploading',
        title: newMatch.get('title'),
        thumbnail: 'https://images.indianexpress.com/2018/07/football-reuters-m.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        loading: true
      }]);
      return { previousMatches };
    },
    onError: (err, newMatch, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to upload match!', color: 'red', icon: <IoAlert />
      });
      queryClient.setQueryData('matches', context.previousMatches);
    },
    onSuccess: (res, newMatch, context: any) => {
      if (res.status === 429) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to upload match!', color: 'red', icon: <IoAlert />
        });
        queryClient.setQueryData('matches', context.previousMatches);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('matches');
    }
  });
};

export default useUploadFile;
