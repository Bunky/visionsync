import { atom } from 'recoil';

export default atom({
  key: 'viewAnalysisModal',
  default: {
    open: false,
    analysisId: ''
  }
});
