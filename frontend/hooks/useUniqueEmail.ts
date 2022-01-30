import { useMutation } from 'react-query';

const useUniqueEmail = () => useMutation(async (email) => fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/email`, {
  method: 'POST',
  credentials: 'include',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email })
}));

export default useUniqueEmail;
