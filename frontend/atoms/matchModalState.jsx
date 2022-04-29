import { atom } from 'recoil';

export default atom({
  key: 'matchModal',
  default: {
    open: false,
    edit: false,
    matchId: ''
  }
});
