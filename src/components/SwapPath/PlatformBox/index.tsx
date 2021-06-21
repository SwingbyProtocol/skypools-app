import { Big, BigSource } from 'big.js';
import { FormattedNumber, useIntl } from 'react-intl';

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
  const { formatMessage } = useIntl();
  return (
    <div
      css={[platformBox, withNames && withNamesBox, withFractions && withFractionsBox]}
      className={className}
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
          <div key={it.platform} css={item}>
            <Coin css={itemLogo} src={`/swap/platforms/${it.platform}.svg`} />
            {!!withNames && (
              <span css={itemName}>
                {(() => {
                  const id = `generic.platform.${it.platform}`;
                  const result = formatMessage({ id });
                  if (result === id) {
                    return it.platform;
                  }

                  return result;
                })()}
              </span>
            )}
            {!!withFractions && (
              <span css={itemFraction}>
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
