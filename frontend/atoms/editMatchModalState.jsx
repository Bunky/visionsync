import { atom } from 'recoil';

export default atom({
  key: 'editMatchModal',
  default: {
    open: false,
    matchId: ''
  }
});
