import { useMutation, useQueryClient } from 'react-query';
import logout from '../../mutations/Auth/logout';

const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation(logout, {
    onMutate: async () => {
      await queryClient.cancelQueries('user');

      const previousUser = queryClient.getQueryData('user');
      queryClient.setQueryData('user', {});
      return previousUser;
    },
    onError: (err, variables, previousUser) => {
      queryClient.setQueryData('user', previousUser);
    },
    onSettled: () => {
      queryClient.resetQueries();
    },
  });
};

export default useLogout;
