import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import io from 'socket.io-client';
import useUser from './useUser';

const useDetectionSocket = () => {
  const queryClient = useQueryClient();
  const { data: user, status: userStatus } = useUser();
  const [detections, setDetections] = useState([]);

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

      return () => {
        socket.disconnect();
      };
    }
  }, [queryClient, user, userStatus]);

  return detections;
};

export default useDetectionSocket;
