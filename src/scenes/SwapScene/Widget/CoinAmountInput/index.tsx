import { rem } from 'polished';
import { ReactNode, useMemo } from 'react';
import Select, { Theme, StylesConfig, createFilter, MenuListComponentProps } from 'react-select';
import { FormattedMessage } from 'react-intl';
import { FixedSizeList as List } from 'react-window';

import { Coin } from '../../../../components/Coin';
import { TextInput } from '../../../../components/TextInput';
import { size } from '../../../../modules/styles';
import { isFakeBtcToken, isFakeNativeToken } from '../../../../modules/para-inch';
import { Network } from '../../../../modules/networks';
import type { ParaInchToken } from '../../../../modules/para-inch';

import {
  container,
  selectInput,
  textInput,
  coinContainer,
  coinWrapper,
  coinChain as coinChainClass,
  coinName as coinNameClass,
  coinLogo,
  textInputContainer,
  info,
} from './styles';

type CoinInfo = Pick<ParaInchToken, 'symbol' | 'address' | 'logoUri' | 'network'>;
export type CoinAmountInputValue = {
  coin: CoinInfo | null;
  amount: string | null;
  amountInfo?: ReactNode;
};

type OptionType = { value: CoinInfo; label: JSX.Element };

type Props = {
  availableCoins: CoinInfo[];
  value: CoinAmountInputValue;
  onChange?: (value: CoinAmountInputValue) => void;
  className?: string;
  disabled?: 'amount' | 'all';
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

export const CoinAmountInput = ({
  availableCoins,
  className,
  value,
  onChange,
  disabled,
}: Props) => {
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
                            id={`network.${coin.network === Network.ETHEREUM ? 'full' : 'short'}.${
                              coin.network
                            }`}
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
            amount: value.amount,
            coin: coin?.value ?? null,
            amountInfo: value.amountInfo,
          })
        }
        filterOption={createFilter({
          stringify: (option: OptionType) => `${option.value.symbol} ${option.value.address}`,
        })}
        isDisabled={disabled === 'all'}
      />

      <div css={textInputContainer}>
        <TextInput
          css={textInput}
          size="country"
          value={value?.amount ?? ''}
          onChange={(evt) =>
            onChange?.({
              coin: value.coin,
              amount: evt.target.value ?? null,
              amountInfo: value.amountInfo,
            })
          }
          disabled={disabled === 'all' || disabled === 'amount'}
        />

        {!!value.amountInfo && <span css={info}>{value.amountInfo}</span>}
      </div>
    </div>
  );
};
