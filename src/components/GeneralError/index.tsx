import { FallbackProps } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';

import { title, wrapper, errorCSS } from './styles';

export const GeneralError = ({ error }: FallbackProps) => {
  return (
    <div css={wrapper}>
      <FormattedMessage css={title} id="general-error" />
      <div css={errorCSS}>{error.toString()}</div>
    </div>
  );
};
