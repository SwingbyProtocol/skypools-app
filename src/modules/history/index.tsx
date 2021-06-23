export { useGetChartData } from './hooks';

export interface IChartDate {
  time: string;
  value: number;
}

export interface ICoingeckoHistories {
  prices: Array<number[]>;
  market_caps: Array<number[]>;
  total_volumes: Array<number[]>;
}
