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

// These should be exactly the same as the icon file names in `/public`.
const ICONS = ['pancakeswap', 'skybridge', 'sushiswap', 'uniswap'];

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

        const logo = (() => {
          return (
            ICONS.find((iconName) =>
              it.platform
                .toLowerCase()
                .replace(/[_\s]/gi, '')
                .includes(iconName.replace('swap', '')),
            ) ?? it.platform
          );
        })();

        return (
          <div key={it.platform} css={item}>
            <Coin css={itemLogo} src={`/swap/platforms/${logo}.svg`} />
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
