import { rem } from 'polished';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import Select, { createFilter, MenuListComponentProps, StylesConfig, Theme } from 'react-select';
import { FixedSizeList as List } from 'react-window';

import { TokensQuery, Network as GQLNetwork } from '../../generated/skypools-graphql';
import { isFakeBtcToken, isFakeNativeToken } from '../../modules/para-inch';
import { size } from '../../modules/styles';
import { Coin } from '../Coin';

import {
  coinChain as coinChainClass,
  coinContainer,
  coinLogo,
  coinName as coinNameClass,
  coinWrapper,
  container,
  selectInput,
} from './styles';

export type CoinInfo = TokensQuery['tokens']['edges'][number]['node'];

export type CoinAmountInputValue = {
  coin: CoinInfo | null;
};

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
    danger: 'hsl(var(--sp-color-danger-normal))',
    dangerLight: 'hsla(var(--sp-color-danger-normal), 50%)',
    // These are all `white` so that we can spot them easily and fix them with the `styles` object below.
    neutral0: 'white',
    neutral5: 'white',
    neutral10: 'white',
    neutral20: 'white',
    neutral30: 'white',
    neutral40: 'white',
    neutral50: 'white',
    neutral60: 'white',
    neutral70: 'white',
    neutral80: 'white',
    neutral90: 'white',
  },
});

const styles: StylesConfig<OptionType, false> = {
  option: (styles, { isSelected }) => ({
    ...styles,
    '--coin-chain-color': isSelected ? 'hsl(var(--sp-color-primary-text))' : undefined,
    '--coin-name-color': isSelected ? 'hsl(var(--sp-color-primary-text))' : undefined,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (styles, { isDisabled }) => ({
    ...styles,
    display: isDisabled ? 'none' : undefined,
    color: 'hsl(var(--sp-color-primary-normal))',
    ':hover': {
      color: 'hsl(var(--sp-color-primary-active))',
    },
  }),
  control: (styles, { isFocused, isDisabled }) => ({
    ...styles,
    borderRadius: rem(size.closet),
    blockSize: rem(size.country),
    borderColor: isDisabled
      ? 'transparent'
      : isFocused
      ? 'hsl(var(--sp-color-primary-normal))'
      : 'hsl(var(--sp-color-border-normal))',
    boxShadow: 'none',
    backgroundColor: isDisabled
      ? 'hsla(var(--sp-color-input-bg), 75%)'
      : 'hsl(var(--sp-color-input-bg))',
    ':hover': {
      borderColor: isDisabled
        ? 'transparent'
        : isFocused
        ? 'hsl(var(--sp-color-primary-active))'
        : 'hsl(var(--sp-color-border-hover))',
    },
  }),
  valueContainer: (styles) => ({
    ...styles,
    blockSize: '100%',
  }),
  input: (styles) => ({
    ...styles,
    caretColor: 'inherit',
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: 'hsl(var(--sp-color-input-bg))',
  }),
};

const SELECT_ITEM_HEIGHT = 60;

const MenuList = ({
  options,
  children,
  maxHeight,
  getValue,
}: MenuListComponentProps<OptionType, false>) => {
  const [value] = getValue();
  const initialOffset = options.indexOf(value) * SELECT_ITEM_HEIGHT;

  return (
    <List
      width="100%"
      height={maxHeight}
      itemCount={(children as any).length}
      itemSize={SELECT_ITEM_HEIGHT}
      initialScrollOffset={initialOffset}
    >
      {({ index, style }) => <div style={style}>{(children as any)[index]}</div>}
    </List>
  );
};

export const CoinInput = ({ availableCoins, className, value, onChange }: Props) => {
  const coins = useMemo(
    () =>
      availableCoins
        .map((coin) => {
          return {
            value: coin,
            label: (
              <div key={coin.address} css={coinContainer}>
                <span css={coinChainClass}>
                  {isFakeNativeToken(coin.address) || isFakeBtcToken(coin.address) ? (
                    <FormattedMessage id="token.chain.native" />
                  ) : (
                    <FormattedMessage
                      id="token.chain.on-chain"
                      values={{
                        chain: (
                          <FormattedMessage
                            id={`network.${
                              coin.network === GQLNetwork.ETHEREUM ? 'full' : 'short'
                            }.${coin.network}`}
                          />
                        ),
                      }}
                    />
                  )}
                </span>
                <div css={coinWrapper}>
                  <Coin src={coin.logoUri} css={coinLogo} loading="eager" />
                  <span css={coinNameClass}>{coin.symbol}</span>
                </div>
              </div>
            ),
          };
        })
        .sort((a, b) => {
          if (isFakeNativeToken(a.value.address)) {
            return -1;
          }

          if (isFakeNativeToken(b.value.address)) {
            return 1;
          }

          if (isFakeBtcToken(a.value.address)) {
            return -1;
          }

          if (isFakeBtcToken(b.value.address)) {
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
        components={{ MenuList }}
        css={selectInput}
        theme={theme}
        styles={styles}
        value={selectValue}
        options={coins}
        onChange={(coin) =>
          onChange?.({
            coin: coin?.value ?? null,
          })
        }
        filterOption={createFilter({
          stringify: (option: OptionType) => `${option.value.symbol} ${option.value.address}`,
        })}
      />
    </div>
  );
};
