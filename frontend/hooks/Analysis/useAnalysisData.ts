import { useQuery } from 'react-query';
import fetchAnalysisData from '../../fetches/fetchAnalysisData';

type AnalysisData = Array<Array<{
  class: number;
  x: number;
  y: number;
  team?: number;
  color: Array<Number>;
}>>;

const useAnalysisData = (analysisId, enabled) => useQuery<AnalysisData, Error>(['analysis', analysisId], () => fetchAnalysisData(analysisId), {
  enabled,
  staleTime: 5 * 60 * 1000,
});

export default useAnalysisData;
