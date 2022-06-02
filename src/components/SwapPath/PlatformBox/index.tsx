import { Big } from 'big.js';
import { FormattedNumber, useIntl } from 'react-intl';

import { SwapQuoteQueryResult } from '../../../generated/skypools-graphql';
import { PlatformLogo } from '../../PlatformLogo';

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
  value: NonNullable<
    SwapQuoteQueryResult['data']
  >['swapQuote']['bestRoute']['path'][number]['swaps'][number]['exchanges'];
};

export const PlatformBox = ({ withFractions, withNames, className, value }: Props) => {
  const { formatMessage } = useIntl();
  return (
    <div
      css={[platformBox, withNames && withNamesBox, withFractions && withFractionsBox]}
      className={className}
    >
      {value.map((it, index) => {
        const fraction = (() => {
          try {
            return new Big(it.fraction).toNumber();
          } catch (e) {
            return null;
          }
        })();

        return (
          <div key={`${it.exchange}-${index}`} css={item}>
            <PlatformLogo css={itemLogo} name={it.exchange} />
            {!!withNames && (
              <span css={itemName}>
                {(() => {
                  const id = `generic.platform.${it.exchange}`;
                  const result = formatMessage({ id });
                  if (result === id) {
                    return it.exchange;
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
