import React, { CSSProperties } from 'react';

//@ts-ignore-start
//eslint-disable-next-line import/no-internal-modules
import Sprite from '../../resources/icons-sprite.svg';
// @ts-ignore-end

import { SvgIcon } from './styled';

export type LogoIconNames = 'barnbridge';

export type TokenIconNames =
  | 'bond-square-token'
  | 'bond-add-token'
  | 'token-unknown'
  | 'token-eth'
  | 'token-btc'
  | 'token-weth'
  | 'token-wbtc'
  | 'token-renbtc'
  | 'token-usdc'
  | 'token-usdt'
  | 'token-dai'
  | 'token-rai'
  | 'token-susd'
  | 'token-gusd'
  | 'static/token-bond'
  | 'static/token-uniswap'
  | 'static/token-staked-aave'
  | 'token-wmatic'
  | 'compound'
  | 'static/aave'
  | 'cream_finance'
  | 'aave_polygon'
  | 'token-all'
  | 'polygon';

export type NavIconNames =
  | 'paper-bill-outlined'
  | 'paper-alpha-outlined'
  | 'chats-outlined'
  | 'forum-outlined'
  | 'bar-charts-outlined'
  | 'savings-outlined'
  | 'proposal-outlined'
  | 'treasury-outlined'
  | 'bank-outlined'
  | 'tractor-outlined'
  | 'wallet-outlined'
  | 'docs-outlined';

export type ThemeIconNames = 'moon' | 'sun' | 'weather';

export type IconNames =
  | LogoIconNames
  | TokenIconNames
  | NavIconNames
  | ThemeIconNames
  | 'mainnet-logo'
  | 'testnet-logo'
  | 'polygon-logo'
  | 'avalanche-logo'
  | 'binance-logo'
  | 'right-arrow-circle-outlined'
  | 'arrow-back'
  | 'down-arrow-circle'
  | 'plus-circle'
  | 'refresh'
  | 'notification'
  | 'chevron-right'
  | 'close-circle-outlined'
  | 'check-circle-outlined'
  | 'history-circle-outlined'
  | 'close'
  | 'close-tiny'
  | 'dropdown-arrow'
  | 'warning-outlined'
  | 'warning-circle-outlined'
  | 'gear'
  | 'node-status'
  | 'info-outlined'
  | 'network'
  | 'pencil-outlined'
  | 'rate-outlined'
  | 'plus-circle-outlined'
  | 'plus-square-outlined'
  | 'ribbon-outlined'
  | 'bin-outlined'
  | 'add-user'
  | 'search-outlined'
  | 'link-outlined'
  | 'arrow-top-right'
  | 'arrow-top-right-thin'
  | 'arrow-bottom-right-thin'
  | 'handshake-outlined'
  | 'stamp-outlined'
  | 'circle-plus-outlined'
  | 'circle-minus-outlined'
  | 'senior_tranche'
  | 'junior_tranche'
  | 'senior-side'
  | 'junior-side'
  | 'senior_tranche_simplified'
  | 'junior_tranche_simplified'
  | 'withdrawal_regular'
  | 'withdrawal_instant'
  | 'statistics'
  | 'filter'
  | 'tx-progress'
  | 'tx-success'
  | 'tx-failure'
  | 'burger'
  | 'hourglass'
  | 'history'
  | 'piggybank'
  | 'file'
  | 'add-file'
  | 'file-added'
  | 'file-deleted'
  | 'file-clock'
  | 'file-times'
  | 'wallet'
  | 'handshake'
  | 'padlock-unlock'
  | 'stopwatch'
  | 'judge'
  | 'certificate'
  | 'chart-up'
  | 'apy-up'
  | 'chart'
  | 'queue'
  | 'stake'
  | 'finance'
  | 'balance'
  | 'vertical-dots'
  | 'dropdown'
  | 'arrow-backward'
  | 'arrow-forward'
  | 'science'
  | 'building'
  | 'internet'
  | 'checkbox-checked'
  | 'checkbox'
  | 'loader'
  | 'insured'
  | 'arbitrum-logo'
  | 'warn-circle'
  | 'menu-faucet'
  | 'menu-yf'
  | 'menu-dao'
  | 'menu-sy'
  | 'menu-sa'
  | 'menu-se'
  | 'menu-docs'
  | 'menu-theme-light'
  | 'menu-theme-dark'
  | 'menu-theme-auto'
  | 'bond-square-token'
  | 'twitter'
  | 'discord'
  | 'github';

export type IconProps = {
  name: IconNames;
  width?: number | string;
  height?: number | string;
  color?: 'primary' | 'secondary' | 'red' | 'green' | 'blue' | 'inherit';
  rotate?: 0 | 90 | 180 | 270;
  className?: string;
  style?: CSSProperties;
};

export function Icon(props: IconProps) {
  const { name, width = 24, height = 24, rotate, color, className, style, ...rest } = props;

  return (
    <SvgIcon
      rotate={rotate ? rotate : 0}
      color={color}
      width={width}
      height={height ?? width}
      style={style}
      {...rest}
    >
      {name && <use xlinkHref={`${Sprite}#icon__${name}`} />}
    </SvgIcon>
  );
}
