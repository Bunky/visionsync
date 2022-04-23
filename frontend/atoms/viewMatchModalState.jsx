import { atom } from 'recoil';

export default atom({
  key: 'viewMatchModal',
  default: {
    open: false,
    matchId: ''
  }
});
