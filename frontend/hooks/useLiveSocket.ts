import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import io from 'socket.io-client';
import useUser from './useUser';

const useLiveSocket = () => {
  const queryClient = useQueryClient();
  const { data: user, status: userStatus } = useUser();
  const [live, setLive] = useState(null);

  useEffect(() => {
    if (userStatus === 'success' && user && !user.unauthorised) {
      const socket = io('http://localhost:3001', { transports: ['websocket'] });

      socket.emit('create', user._id);

      socket.on('connect', () => {
        console.log('connected to live socket');
      });

      socket.on('live', (frame) => {
        setLive(frame);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [queryClient, user, userStatus]);

  return live;
};

export default useLiveSocket;
