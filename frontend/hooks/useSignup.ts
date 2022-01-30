import { useMutation, useQueryClient } from 'react-query';

const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation(async (newAccount) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newAccount),
  }), {
    onMutate: async () => {
      await queryClient.cancelQueries('user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries('user');
    }
  });
};

export default useSignup;
