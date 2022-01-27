import { useQuery } from 'react-query';
import fetchUser from '../fetches/fetchUser';

type User = {
  name: string;
};

const useUser = () => useQuery<User, Error>('user', fetchUser);

export default useUser;
