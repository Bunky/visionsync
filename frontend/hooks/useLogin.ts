import { useMutation, useQueryClient } from 'react-query';

const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation(async (credentials) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  }), {
    onMutate: async () => {
      await queryClient.cancelQueries('user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries('user');
    }
  });
};

export default useLogin;
