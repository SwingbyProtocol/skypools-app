import { rem } from 'polished';
import { useEffect, useMemo } from 'react';
import Select, { Theme, StylesConfig, OptionTypeBase } from 'react-select';

import { Coin } from '../../../../components/Coin';
import { TextInput } from '../../../../components/TextInput';
import { size } from '../../../../modules/styles';

import {
  container,
  selectInput,
  textInput,
  coinContainer,
  coinWrapper,
  coinChain as coinChainClass,
  coinName as coinNameClass,
  coinLogo,
} from './styles';

export type CoinAmountInputValue = { coin: string | null; amount: string | null };

type Props = {
  availableCoins: Array<{ symbol: string; address: string; logoUri: string }>;
  value: CoinAmountInputValue;
  onChange?: (value: CoinAmountInputValue) => void;
  className?: string;
};

const theme = (theme: Theme): Theme => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: 'hsl(var(--sp-color-primary-normal))',
    primary75: 'hsla(var(--sp-color-primary-normal), 75%)',
    primary50: 'hsla(var(--sp-color-primary-normal), 50%)',
    primary25: 'hsla(var(--sp-color-primary-normal), 25%)',
  },
});

const styles: StylesConfig<OptionTypeBase, false> = {
  option: (styles, { isSelected }) => ({
    ...styles,
    '--coin-chain-color': isSelected ? 'hsl(var(--sp-color-primary-text))' : undefined,
    '--coin-name-color': isSelected ? 'hsl(var(--sp-color-primary-text))' : undefined,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (styles) => ({
    ...styles,
    color: 'hsl(var(--sp-color-primary-normal))',
  }),
  control: (styles) => ({
    ...styles,
    borderRadius: rem(size.closet),
    height: rem(size.country),
    border: '2px solid hsl(var(--sp-color-border-normal))',
  }),
  valueContainer: (styles) => ({
    ...styles,
    height: '100%',
  }),
};

export const CoinAmountInput = ({ availableCoins, className, value, onChange }: Props) => {
  const coins = useMemo(
    () =>
      availableCoins.map((coin) => {
        return {
          value: coin.address,
          label: (
            <div key={coin.address} css={coinContainer}>
              <span css={coinChainClass}>aaa</span>
              <div css={coinWrapper}>
                <Coin src={coin.logoUri} css={coinLogo} />
                <span css={coinNameClass}>{coin.symbol}</span>
              </div>
            </div>
          ),
        };
      }),
    [availableCoins],
  );

  const selectValue = useMemo(
    () => coins.find((it) => it.value === value.coin) ?? null,
    [coins, value.coin],
  );

  useEffect(() => {
    if (selectValue) return;

    const coin = coins[0]?.value ?? null;
    if (!coin) return;

    onChange?.({ amount: value.amount, coin });
  }, [coins, selectValue, onChange, value.amount]);

  return (
    <div css={container} className={className}>
      <Select
        css={selectInput}
        theme={theme}
        styles={styles}
        value={selectValue}
        options={coins}
        onChange={(coin) => onChange?.({ amount: value.amount, coin: coin?.value ?? null })}
      />

      <TextInput
        css={textInput}
        size="country"
        value={value?.amount ?? ''}
        onChange={(evt) => onChange?.({ coin: value.coin, amount: evt.target.value ?? null })}
      />
    </div>
  );
};
