import { atom } from 'recoil';

export default atom({
  key: 'editConfigModal',
  default: {
    open: false,
    configId: ''
  }
});
