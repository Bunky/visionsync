import { useQuery } from 'react-query';
import fetchAnalyses from '../../fetches/fetchAnalyses';

type Analysis = {
  matchId: string;
  createdAt: string;
  _id: string;
};

const useAnalyses = () => useQuery<Analysis[], Error>('analyses', fetchAnalyses);

export default useAnalyses;
