import { useRecoilState, atom } from 'recoil';
import viewAnalysisModelState from '../../atoms/viewAnalysisModalState';

const useViewAnalysisModel = () => useRecoilState(atom(viewAnalysisModelState));

export default useViewAnalysisModel;
