import { useRecoilState, atom } from 'recoil';
import tempDetections from '../atoms/tempDetections';

const useTempDetections = () => useRecoilState(atom(tempDetections));

export default useTempDetections;
