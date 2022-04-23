import { atom } from 'recoil';

export default atom({
  key: 'viewConfigModal',
  default: {
    open: false,
    configId: ''
  }
});
