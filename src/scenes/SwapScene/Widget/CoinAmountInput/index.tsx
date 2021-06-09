import { transparentize } from 'polished';
import React from 'react';
import { useIntl } from 'react-intl';
import Select from 'react-select';

import { Coin } from '../../../../components/Coin';
import { TextInput } from '../../../../components/TextInput';

import {
  coinContainer,
  coinWrapper,
  coinChain as coinChainClass,
  coinName as coinNameClass,
  coinLogo,
} from './styles';

type Props = {
  availableCoins: string[];
  selectedCoin: null;
  value: string;
};

export const CoinAmountInput = ({ availableCoins }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div>
      <Select
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: 'var(--sp-color-primary-normal)',
            primary75: 'red',
            primary50: 'green',
            primary25: 'blue',
          },
        })}
        styles={{
          option: (styles, { isSelected }) => ({
            ...styles,
            '--coin-chain-color': isSelected ? 'var(--sp-color-primary-text)' : undefined,
            '--coin-name-color': isSelected ? 'var(--sp-color-primary-text)' : undefined,
          }),
        }}
        options={availableCoins.map((coin) => {
          const coinName = (() => {
            const id = `generic.coin-name.${coin}`;
            const value = formatMessage({ id });
            if (!value || value === id) {
              return coin;
            }

            return value;
          })();

          const coinChain = (() => {
            const id = `generic.coin-chain.${coin}`;
            const value = formatMessage({ id });
            if (!value || value === id) {
              return 'aaa';
            }

            return value;
          })();

          return {
            value: coin,
            label: (
              <div key={coin} className={coinContainer}>
                <span className={coinChainClass}>{coinChain}</span>
                <div className={coinWrapper}>
                  <Coin src={`/swap/coins/${coin}.svg`} className={coinLogo} />
                  <span className={coinNameClass}>{coinName}</span>
                </div>
              </div>
            ),
          };
        })}
      />
      <TextInput size="country" value="" />
    </div>
  );
};
