import { useMutation } from 'react-query';
import login from '../../mutations/Auth/login';

const useLogin = () => useMutation(login);

export default useLogin;
