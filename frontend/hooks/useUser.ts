import { useQuery } from 'react-query';
import fetchUser from '../fetches/fetchUser';

type User = {
  email: string;
  firstName: string;
  lastName: string;
  unauthorised: string;
};

const useUser = () => useQuery<User, Error>('user', fetchUser);

export default useUser;
