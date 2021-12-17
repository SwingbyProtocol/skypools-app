import { useState } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';

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

const DEFAULT_SLIPPAGES = ['0.5', '1', '3'];

export const SkypoolsSlippage = ({
  slippage,
  setSlippage,
}: {
  slippage: string;
  setSlippage: (slippage: string) => void;
}) => {
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
              <FormattedNumber
                // eslint-disable-next-line react/style-prop-object
                style="percent"
                value={Number(it) * 0.01}
                minimumFractionDigits={0}
                maximumFractionDigits={1}
              />
            </button>
          ))}
        </div>
        <TextInput
          placeholder="Custom"
          css={textInput}
          size="city"
          state={(() => {
            if (isNaN(Number(slippage))) {
              return 'danger';
            }
            return 'normal';
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
