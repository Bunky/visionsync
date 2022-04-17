import { useRecoilState, atom } from 'recoil';
import viewAnalysisModelState from '../../atoms/viewAnalysisModelState';

const useViewAnalysisModel = () => useRecoilState(atom(viewAnalysisModelState));

export default useViewAnalysisModel;
