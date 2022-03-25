import { useEffect, useState } from 'react';
import { useQueryClient } from 'react-query';
import io from 'socket.io-client';

const useSettingsSocket = () => {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:3001');
    socket.on('connect', () => {
      console.log('connected');
    });

    socket.on('preview', (frame) => {
      setPreview(frame);
    });

    socket.on('result', (frame) => {
      setResult(frame);
    });

    socket.on('updateConfig', (message) => {
      queryClient.setQueryData('config', () => message);
      // const update = (entity) => entity.id === data.id ? { ...entity, ...data.payload } : entity;
      // return Array.isArray(oldConfig) ? oldConfig.map(update) : update(oldConfig);
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return {
    preview,
    result
  };
};

export default useSettingsSocket;
