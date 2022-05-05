import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import io from 'socket.io-client';
import useUser from './Auth/useUser';

const useDetectionSocket = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const [detections, setDetections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [corners, setCorners] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:3001', { transports: ['websocket'] });

    socket.emit('create', user._id);

    socket.on('connect', () => {
      console.log('connected to detection socket');
    });

    socket.on('detections', (data) => {
      setDetections(data);
    });

    socket.on('positions', (data) => {
      setPositions(data.positions);
      setAllPositions((old) => [...old, data.positions]);
      setCorners(data.corners);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, user]);

  return {
    detections, positions, corners, allPositions
  };
};

export default useDetectionSocket;
