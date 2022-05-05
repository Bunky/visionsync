import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import io from 'socket.io-client';
import useUser from './Auth/useUser';

const useLiveSocket = () => {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const [live, setLive] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3001', { transports: ['websocket'] });

    socket.emit('create', user._id);

    socket.on('connect', () => {
      console.log('connected to live socket');
    });

    socket.on('live', (frame) => {
      if (frame === false) {
        queryClient.invalidateQueries('analysis');
      } else {
        setLive(frame);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, user]);

  return live;
};

export default useLiveSocket;
