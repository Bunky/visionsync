import { useEffect, useState } from 'react';
import {
  ScrollArea, Progress, Text
} from '@mantine/core';
import {
  IoDuplicate, IoMap, IoTv
} from 'react-icons/io5';

interface Stats {
  data: Array<number>;
  title: string;
  pct?: Boolean;
  count?: Boolean;
}

const StatRow = ({ data, title, pct, count }: Stats) => {
  const segments = data.map((segment, index) => ({
    value: count ? segment / data.reduce((a, b) => a + b, 0) * 100 : segment,
    color: index === 0 ? 'red' : 'blue',
    label: pct ? segment > 10 && `${segment}%` : segment / data.reduce((a, b) => a + b, 0) * 100 > 10 && `${segment}`
  }));

  return (
    <ScrollArea>
      <Text>{title}</Text>
      <Progress
        sections={segments}
        size={32}
      />
    </ScrollArea>
  );
};
export default StatRow;
