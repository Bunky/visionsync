import { useQuery } from 'react-query';
import fetchMatches from '../fetches/fetchMatches';

type Match = {
  _id?: string;
  title: string;
  loading?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const useMatches = () => useQuery<Match[], Error>('matches', fetchMatches);

export default useMatches;
