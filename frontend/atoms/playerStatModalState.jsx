import { atom } from 'recoil';

export default atom({
  key: 'playerStatModal',
  default: {
    open: false,
    playerId: 0
  }
});
