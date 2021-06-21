import { rem } from 'polished';
import { useMemo } from 'react';
import Select, { Theme, StylesConfig, createFilter } from 'react-select';
import { FormattedMessage } from 'react-intl';

import { Coin } from '../../../../components/Coin';
import { TextInput } from '../../../../components/TextInput';
import { NetworkId } from '../../../../modules/onboard';
import { size } from '../../../../modules/styles';
import { isNativeToken } from '../../../../modules/para-inch';

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

type CoinInfo = { symbol: string; address: string; logoUri: string | null; network: NetworkId };
export type CoinAmountInputValue = { coin: CoinInfo | null; amount: string | null };

type OptionType = { value: CoinInfo; label: JSX.Element };

type Props = {
  availableCoins: CoinInfo[];
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

const styles: StylesConfig<OptionType, false> = {
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
      availableCoins
        .map((coin) => {
          return {
            value: coin,
            label: (
              <div key={coin.address} css={coinContainer}>
                <span css={coinChainClass}>
                  {isNativeToken(coin.address) ? (
                    <FormattedMessage id="token.chain.native" />
                  ) : (
                    <FormattedMessage
                      id="token.chain.on-chain"
                      values={{
                        chain: (
                          <FormattedMessage
                            id={`network.${coin.network === 1 ? 'full' : 'short'}.${coin.network}`}
                          />
                        ),
                      }}
                    />
                  )}
                </span>
                <div css={coinWrapper}>
                  <Coin src={coin.logoUri} css={coinLogo} />
                  <span css={coinNameClass}>{coin.symbol}</span>
                </div>
              </div>
            ),
          };
        })
        .sort((a, b) => {
          if (isNativeToken(a.value.address)) {
            return -1;
          }

          if (isNativeToken(b.value.address)) {
            return 1;
          }

          return a.value.symbol.localeCompare(b.value.symbol);
        }),
    [availableCoins],
  );

  const selectValue = useMemo(
    () =>
      coins.find(
        (it) => value.coin && it.value.address.toLowerCase() === value.coin.address.toLowerCase(),
      ) ?? null,
    [coins, value.coin],
  );

  return (
    <div css={container} className={className}>
      <Select<OptionType>
        css={selectInput}
        theme={theme}
        styles={styles}
        value={selectValue}
        options={coins}
        onChange={(coin) => onChange?.({ amount: value.amount, coin: coin?.value ?? null })}
        filterOption={createFilter({
          stringify: (option: OptionType) => `${option.value.symbol} ${option.value.address}`,
        })}
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
