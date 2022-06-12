const mongoose = require('mongoose');

const { Schema } = mongoose;

const config = new Schema({
  preview: {
    enabled: {
      type: Boolean,
      required: true
    },
    stage: {
      type: String,
      trim: true,
      required: true
    },
    follow: {
      type: Boolean,
      required: true
    },
  },
  analysis: {
    paused: {
      type: Boolean,
      required: true
    },
  },
  crowdMask: {
    hsv: {
      lower: {
        type: [Number],
        required: true
      },
      upper: {
        type: [Number],
        required: true
      }
    },
    erosion: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    dilation: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    closing: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    opening: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    invert: {
      type: Boolean,
      required: true
    },
    overlap: {
      type: Boolean,
      required: true
    }
  },
  playerMask: {
    hsv: {
      lower: {
        type: [Number],
        required: true
      },
      upper: {
        type: [Number],
        required: true
      }
    },
    erosion: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    dilation: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    closing: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    opening: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    invert: {
      type: Boolean,
      required: true
    },
    overlap: {
      type: Boolean,
      required: true
    }
  },
  canny: {
    masked: {
      type: Boolean,
      required: true
    },
    blur: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      }
    },
    thresholdOne: {
      type: Number,
      required: true
    },
    thresholdTwo: {
      type: Number,
      required: true
    },
    closing: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    opening: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    dilation: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    erosion: {
      enabled: {
        type: Boolean,
        required: true
      },
      size: {
        type: Number,
        required: true
      },
      shape: {
        type: Number,
        required: true
      }
    },
    overlap: {
      type: Boolean,
      required: true
    }
  },
  lines: {
    threshold: {
      type: Number,
      required: true
    },
    minLineLength: {
      type: Number,
      required: true
    },
    maxLineGap: {
      type: Number,
      required: true
    },
    resolution: {
      type: Number,
      required: true
    },
    rho: {
      type: Number,
      required: true
    },
    prune: {
      enabled: {
        type: Boolean,
        required: true
      },
      minDistance: {
        type: Number,
        required: true
      },
      minAngle: {
        type: Number,
        required: true
      }
    }
  },
  lineClassifications: {
    centre: {
      angle: {
        type: [Number],
        required: true
      },
      length: {
        type: [Number],
        required: true
      }
    },
    side: {
      angle: {
        type: [Number],
        required: true
      },
      length: {
        type: [Number],
        required: true
      }
    },
    goal: {
      angle: {
        type: [Number],
        required: true
      },
      length: {
        type: [Number],
        required: true
      }
    },
    penaltyBox: {
      angle: {
        type: [Number],
        required: true
      },
      length: {
        type: [Number],
        required: true
      }
    },
    penaltyBoxSide: {
      angle: {
        type: [Number],
        required: true
      },
      length: {
        type: [Number],
        required: true
      }
    },
    sixYardLine: {
      angle: {
        type: [Number],
        required: true
      },
      length: {
        type: [Number],
        required: true
      }
    },
  },
  intersections: {

  }
}, {
  timestamps: true
});

const configSchema = new Schema({
  ownerId: {
    type: String,
    trim: true,
    required: true
  },
  title: {
    type: String,
    trim: true,
    required: true
  },
  config
}, {
  timestamps: true
});

module.exports = mongoose.models.Config || mongoose.model('Config', configSchema);
