import { useState, useEffect } from 'react';

import { IChartDate } from '../..';
import { ParaInchToken } from '../../../para-inch';
import { getChartData } from '../../utils';

export const useGetChartData = (fromToken: ParaInchToken, toToken: ParaInchToken) => {
  const [chartData, setChartData] = useState<IChartDate[] | null | false>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isValidCondition = fromToken && toToken;

  useEffect(() => {
    isValidCondition &&
      (async () => {
        try {
          setIsLoading(true);
          const data = await getChartData(fromToken, toToken);
          setChartData(data);
        } catch (error) {
          console.log('error', error);
        } finally {
          setIsLoading(false);
        }
      })();
  }, [fromToken, toToken, isValidCondition]);
  return { chartData, isLoading };
};
