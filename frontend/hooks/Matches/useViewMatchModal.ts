import { useRecoilState, atom } from 'recoil';
import viewMatchModalState from '../../atoms/viewMatchModalState';

const useViewMatchModal = () => useRecoilState(atom(viewMatchModalState));

export default useViewMatchModal;
