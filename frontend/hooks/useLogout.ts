import { useMutation, useQueryClient } from 'react-query';

const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation(async () => fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/logout`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  }), {
    onMutate: async () => {
      await queryClient.cancelQueries('user');

      // Optimistically clear user data
      const previousUser = queryClient.getQueryData('user');
      queryClient.setQueryData('user', { unauthorised: true });
      return previousUser;
    },
    onError: (err, variables, previousUser) => {
      // If error, reset user data
      queryClient.setQueryData('user', previousUser);
    },
    onSettled: () => {
      // Refetch after success or error
      queryClient.invalidateQueries('user');
    },
  });
};

export default useLogout;
