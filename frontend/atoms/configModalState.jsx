import { atom } from 'recoil';

export default atom({
  key: 'configModal',
  default: {
    open: false,
    duplicate: false,
    configId: ''
  }
});
