import { useQuery } from 'react-query';
import fetchAnalysis from '../fetches/fetchAnalysis';

type Analysis = {
  active: boolean;
};

const useAnalysis = () => useQuery<Analysis, Error>('analysis', fetchAnalysis);

export default useAnalysis;
