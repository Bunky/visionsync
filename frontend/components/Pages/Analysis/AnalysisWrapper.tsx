import styled from 'styled-components';
import {
  Text, Center, Loader, Group, Stack
} from '@mantine/core';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import useAnalysis from '../../../hooks/Analysis/useAnalysis';
import Error from '../../Common/Error/Error';
import useMatches from '../../../hooks/Matches/useMatches';
import AnalysisContext from '../../../contexts/analysis/AnalysisContext';

const AnalysisWrapper = ({ children }) => {
  const { started } = useContext(AnalysisContext);
  const { data: analysis, status: analysisStatus } = useAnalysis();
  const { status: matchesStatus } = useMatches();
  const router = useRouter();

  useEffect(() => {
    if (analysis && !analysis.active) {
      router.push('/');
    }
  }, [analysis, analysisStatus, router]);

  if (analysisStatus === 'loading' || matchesStatus === 'loading' || !started) {
    return (
      <Center sx={{ height: '100%' }}>
        <Group>
          <Loader />
          <Stack spacing={0}>
            <Text>Starting analysis...</Text>
            <Text size="sm" color="dimmed">Loading models</Text>
          </Stack>
        </Group>
      </Center>
    );
  }

  if (analysisStatus === 'error' || matchesStatus === 'error') {
    return (<Center sx={{ height: '100%' }}><Error /></Center>);
  }

  if (!analysis.active) {
    return (<Center sx={{ height: '100%' }}>No active analysis</Center>);
  }

  return (
    <Container>
      {children}
    </Container>
  );
};

const Container = styled.div`
  max-height: 100%;
  height: 100%;
`;

export default AnalysisWrapper;
