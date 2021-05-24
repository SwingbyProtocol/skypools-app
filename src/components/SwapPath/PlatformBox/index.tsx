import { cx } from '@linaria/core';
import { Big, BigSource } from 'big.js';
import { FormattedMessage, FormattedNumber } from 'react-intl';

import { Coin } from '../../Coin';

import {
  platformBox,
  itemLogo,
  item,
  itemName,
  itemFraction,
  withNamesBox,
  withFractionsBox,
} from './styles';

type Props = {
  className?: string;
  withFractions: boolean;
  withNames: boolean;
  value: Array<{ platform: string; fraction: BigSource }>;
};

export const PlatformBox = ({ withFractions, withNames, className, value }: Props) => {
  return (
    <div
      className={cx(
        platformBox,
        className,
        withNames && withNamesBox,
        withFractions && withFractionsBox,
      )}
    >
      {value.map((it) => {
        const fraction = (() => {
          try {
            return new Big(it.fraction).toNumber();
          } catch (e) {
            return null;
          }
        })();

        return (
          <div key={it.platform} className={item}>
            <Coin className={itemLogo} src={`/swap/platforms/${it.platform}.svg`} />
            {!!withNames && (
              <span className={itemName}>
                <FormattedMessage id={`generic.platform.${it.platform}`} />
              </span>
            )}
            {!!withFractions && (
              <span className={itemFraction}>
                {fraction === null ? (
                  '?'
                ) : (
                  <FormattedNumber
                    value={fraction}
                    style="percent" // eslint-disable-line react/style-prop-object
                    maximumFractionDigits={1}
                  />
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
