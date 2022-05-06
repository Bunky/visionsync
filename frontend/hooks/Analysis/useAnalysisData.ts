import { useQuery } from 'react-query';
import fetchAnalysisData from '../../fetches/fetchAnalysisData';

type AnalysisData = Array<Array<{
  class: number;
  x: number;
  y: number;
  color: Array<Number>;
}>>;

const useAnalysisData = (analysisId, enabled) => useQuery<AnalysisData, Error>(['analysis', analysisId], () => fetchAnalysisData(analysisId), {
  enabled
});

export default useAnalysisData;
