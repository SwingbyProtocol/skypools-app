import { useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Big } from 'big.js';

import { TextInput } from '../../../components/TextInput';

import {
  container,
  label,
  selector,
  selectorButtonsWrapper,
  inputRight,
  textInput,
  selectorButton,
  selectorButtonActive,
} from './styles';

const percentageProps: Intl.NumberFormatOptions = {
  style: 'percent',
  maximumFractionDigits: 1,
};

const DEFAULT_SLIPPAGES = ['0.1', '0.5', '3'];

export const Slippage = () => {
  const [slippage, setSlippage] = useState<string>(DEFAULT_SLIPPAGES[0]);
  const [usedCustom, setUsedCustom] = useState(false);

  return (
    <div css={container}>
      <div css={label}>
        <FormattedMessage id="widget.slippage" />
      </div>
      <div css={selector}>
        <div css={selectorButtonsWrapper}>
          {DEFAULT_SLIPPAGES.map((it) => (
            <button
              key={it}
              css={[selectorButton, slippage === it && selectorButtonActive]}
              onClick={() => {
                setUsedCustom(false);
                setSlippage(it);
              }}
            >
              <FormattedNumber {...percentageProps} value={+it / 100} />
            </button>
          ))}
        </div>
        <TextInput
          placeholder="Custom"
          css={textInput}
          size="city"
          state={(() => {
            try {
              new Big(slippage);
              return 'normal';
            } catch (e) {
              return 'danger';
            }
          })()}
          value={(() => {
            if (!usedCustom) return '';
            return slippage;
          })()}
          onChange={(evt) => {
            setUsedCustom(true);
            setSlippage(evt.target.value);
          }}
          right={<span css={inputRight}>%</span>}
        />
      </div>
    </div>
  );
};
