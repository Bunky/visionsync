import { useRecoilState, atom } from 'recoil';
import playerStatModelState from '../atoms/playerStatModalState';

const usePlayerStatModal = () => useRecoilState(atom(playerStatModelState));

export default usePlayerStatModal;
