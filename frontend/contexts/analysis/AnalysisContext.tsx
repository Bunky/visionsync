import { createContext } from 'react';

const AnalysisContext = createContext({
  livefeed: '',
  started: false,

  detections: [],
  positions: [],
  allPositions: [],
  corners: null,

  preview: ''
});

export default AnalysisContext;
