import { useQuery } from 'react-query';
import fetchCoookies from '../../fetches/fetchCoookies';

const useCookies = () => useQuery('cookies', fetchCoookies);

export default useCookies;
