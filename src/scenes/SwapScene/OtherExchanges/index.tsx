import { Fragment } from 'react';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Big } from 'big.js';

import { useParaInch } from '../../../modules/para-inch-react';
import { PlatformLogo } from '../../../components/PlatformLogo';

import {
  comparison,
  comparisonBetter,
  comparisonMatch,
  comparisonWorse,
  container,
  exchange,
  exchangeLogo,
} from './styles';

export const OtherExchanges = ({ className }: { className?: string }) => {
  const { swapQuote } = useParaInch();

  if (!swapQuote || swapQuote.otherRoutes.length < 1) {
    return <></>;
  }

  return (
    <div css={container} className={className}>
      {swapQuote.otherRoutes.map((it, index) => {
        const isMatch = it.fractionOfBest.eq(1);
        const isWorse = it.fractionOfBest.lt(1);
        const isBetter = it.fractionOfBest.gt(1);
        return (
          <Fragment key={index}>
            <div css={exchange}>
              <PlatformLogo css={exchangeLogo} name={it.path?.[0]?.[0]?.exchange} />
              {it.path?.[0]?.[0]?.exchange}
            </div>

            <div>
              <FormattedNumber value={it.toTokenAmount.toNumber()} maximumSignificantDigits={6} />
            </div>

            <div
              css={[
                comparison,
                isMatch && comparisonMatch,
                isWorse && comparisonWorse,
                isBetter && comparisonBetter,
              ]}
            >
              {isMatch ? (
                <FormattedMessage id="comparison.match" />
              ) : (
                <FormattedNumber
                  value={new Big(-1).add(it.fractionOfBest).toNumber()}
                  style="percent" // eslint-disable-line react/style-prop-object
                  maximumFractionDigits={2}
                />
              )}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};
