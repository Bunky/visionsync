import { useQuery } from 'react-query';
import fetchConfig from '../../fetches/fetchConfig';

type Config = {
  preview: {
    enabled: boolean;
    stage: string;
    follow: boolean;
  }
  crowdMask: {
    hsv: {
      upper: Array<number>;
      lower: Array<number>;
    }
    erosion: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    dilation: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    closing: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    opening: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    invert: boolean;
    overlap: boolean;
  }
  playerMask: {
    hsv: {
      upper: Array<number>;
      lower: Array<number>;
    }
    erosion: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    dilation: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    closing: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    opening: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    invert: boolean;
    overlap: boolean;
  }
  canny: {
    masked: boolean;
    blur: {
      enabled: boolean;
      size: number;
    }
    thresholdOne: number;
    thresholdTwo: number;
    overlap: boolean;
    erosion: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    dilation: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    closing: {
      enabled: boolean;
      size: number;
      shape: number;
    }
    opening: {
      enabled: boolean;
      size: number;
      shape: number;
    }
  }
  lines: {
    threshold: number;
    minLineLength: number;
    maxLineGap: number;
    resolution: number;
    rho: number;
    prune: {
      enabled: boolean;
      minDistance: number;
      minAngle: number;
    }
  }
  lineClassifications: {
    centre: {
      angle: Array<number>;
      length: Array<number>;
    }
    side: {
      angle: Array<number>;
      length: Array<number>;
    }
    goal: {
      angle: Array<number>;
      length: Array<number>;
    }
    penaltyBox: {
      angle: Array<number>;
      length: Array<number>;
    }
    penaltyBoxSide: {
      angle: Array<number>;
      length: Array<number>;
    }
    sixYardLine: {
      angle: Array<number>;
      length: Array<number>;
    }
  }
};

const useConfig = () => useQuery<Config, Error>('config', fetchConfig);

export default useConfig;
