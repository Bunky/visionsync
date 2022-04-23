import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import io from 'socket.io-client';
import useUser from './Auth/useUser';

const useDetectionSocket = () => {
  const queryClient = useQueryClient();
  const { data: user, status: userStatus } = useUser();
  const [detections, setDetections] = useState([]);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (userStatus === 'success' && user && !user.unauthorised) {
      const socket = io('http://localhost:3001', { transports: ['websocket'] });

      socket.emit('create', user._id);

      socket.on('connect', () => {
        console.log('connected to detection socket');
      });

      socket.on('detections', (data) => {
        setDetections(data);
      });

      socket.on('positions', (data) => {
        console.log(data);
        setPositions(data);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [queryClient, user, userStatus]);

  return { detections, positions };
};

export default useDetectionSocket;
