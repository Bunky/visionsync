import { useQuery } from 'react-query';
import fetchConfigs from '../../fetches/fetchConfigs';

type Config = {
  _id: string;
  title: string;
  ownerId: string;
  config: any;
  createdAt: Date;
};

const useConfigs = () => useQuery<Config[], Error>('configs', fetchConfigs);

export default useConfigs;
