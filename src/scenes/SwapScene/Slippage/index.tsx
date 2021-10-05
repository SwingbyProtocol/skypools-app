import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { TextInput } from '../../../components/TextInput';

import {
  container,
  label,
  selects,
  buttons,
  inputRight,
  buttonLeft,
  buttonRight,
  textInput,
  Button,
} from './styles';

export const Slippage = () => {
  const [slippage, setSlippage] = useState<string>('1');
  const [custom, setCustom] = useState<string>('');

  useEffect(() => {
    if (custom) {
      setSlippage(custom);
    }
    if (!custom) {
      setSlippage('1');
    }
  }, [custom]);

  return (
    <div css={container}>
      <div css={label}>
        <FormattedMessage id="widget.slippage" />
      </div>
      <div css={selects}>
        <div css={buttons}>
          <Button isActive={slippage === '0.5'} css={buttonLeft} onClick={() => setSlippage('0.5')}>
            <FormattedMessage id="slippage.percent" values={{ value: '0.5' }} />
          </Button>
          <Button isActive={slippage === '1'} onClick={() => setSlippage('1')}>
            <FormattedMessage id="slippage.percent" values={{ value: '1' }} />
          </Button>
          <Button isActive={slippage === '3'} css={buttonRight} onClick={() => setSlippage('3')}>
            <FormattedMessage id="slippage.percent" values={{ value: '3' }} />
          </Button>
        </div>
        <TextInput
          placeholder="Custom"
          css={textInput}
          size="city"
          value={custom}
          onChange={(evt) => {
            const value = Number(evt.target.value);
            if (!isNaN(value)) {
              setCustom(evt.target.value);
            }
          }}
          right={<span css={inputRight}>%</span>}
        />
      </div>
    </div>
  );
};
