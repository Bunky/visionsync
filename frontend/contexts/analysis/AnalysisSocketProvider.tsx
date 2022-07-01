import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useQueryClient } from 'react-query';
import AnalysisContext from './AnalysisContext';
import useUser from '../../hooks/Auth/useUser';

const AnalysisSocketProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  const [value, setValue] = useState({
    livefeed: '',
    started: false,

    detections: [],
    positions: [],
    allPositions: [],
    corners: [],

    preview: ''
  });

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL, { transports: ['websocket'] });
    socket.emit('create', user._id);
    socket.on('connect', () => {
      console.log('connected to context socket');
    });

    socket.on('live', (frame) => {
      if (!value.started && frame) setValue((prev) => ({ ...prev, started: true }));

      if (frame === false) {
        queryClient.invalidateQueries('analysis');
      } else {
        setValue((prev) => ({ ...prev, livefeed: frame }));
      }
    });

    socket.on('detections', (data) => {
      setValue((prev) => ({
        ...prev,
        detections: data.detections,
        positions: data.positions,
        allPositions: [...prev.allPositions, data.positions],
        corners: data.corners,
      }));
    });

    socket.on('preview', (frame) => {
      setValue((prev) => ({ ...prev, preview: frame }));
    });

    return () => {
      socket.disconnect();
      console.log('disconnected from context socket');
    };
  }, []);

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export default AnalysisSocketProvider;
