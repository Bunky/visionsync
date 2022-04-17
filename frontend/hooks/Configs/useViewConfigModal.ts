import { useRecoilState, atom } from 'recoil';
import viewConfigModalState from '../../atoms/viewConfigModalState';

const useViewConfigModal = () => useRecoilState(atom(viewConfigModalState));

export default useViewConfigModal;
