import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';
import { useNotifications } from '@mantine/notifications';
import { IoAlert } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import startAnalysis from '../../mutations/startAnalysis';
import useAnalysis from './useAnalysis';

const useStartAnalysis = () => {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const router = useRouter();
  const { data: analysis, status: analysisStatus } = useAnalysis();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (analysisStatus === 'success' && analysis.active && redirect) {
      router.push('/analysis');
      setRedirect(false);
    }
  }, [analysis, analysisStatus, redirect]);

  return useMutation(startAnalysis, {
    onMutate: async (updatedSetting) => {
      await queryClient.cancelQueries('analysis');
    },
    onError: (err, updatedSetting, context: any) => {
      notifications.showNotification({
        title: 'Error', message: 'Failed to start remote analysis!', color: 'red', icon: <IoAlert />
      });
    },
    onSuccess: (res, updatedSetting, context: any) => {
      if (res.status === 429 || res.status === 500) {
        notifications.showNotification({
          title: 'Error', message: 'Failed to start remote analysis!', color: 'red', icon: <IoAlert />
        });
      }

      if (res.status === 200) {
        setRedirect(true);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('analysis');
    }
  });
};

export default useStartAnalysis;
