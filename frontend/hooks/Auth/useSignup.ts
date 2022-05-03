import { useMutation } from 'react-query';
import signup from '../../mutations/Auth/signup';

const useSignup = () => useMutation(signup);

export default useSignup;
