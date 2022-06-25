import { atom } from 'recoil';

export default atom({
  key: 'analysisHoverState',
  default: {
    playerId: -1
  }
});
