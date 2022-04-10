import { useQuery } from 'react-query';
import fetchAnalysis from '../fetches/fetchAnalysis';

type Analysis = {
  active: boolean;
  room: string;
  matchId?: string;
};

const useAnalysis = () => useQuery<Analysis, Error>('analysis', fetchAnalysis);

export default useAnalysis;
