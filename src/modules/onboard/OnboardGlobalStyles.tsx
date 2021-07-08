import { rem } from 'polished';
import { Global, css } from '@emotion/react';

import { size } from '../styles';

export const OnboardGlobalStyles = () => (
  <Global
    styles={css`
      .bn-onboard-custom {
        z-index: 100;

        .bn-onboard-modal-content {
          max-inline-size: none;
          max-block-size: none;
          inline-size: calc(100vw - ${rem(size.room)});
          block-size: calc(100vh - ${rem(size.room)});
          padding: ${rem(size.room)};
          border-radius: 0;

          @media (min-height: ${rem(600)}) {
            max-inline-size: 37em;
            max-block-size: none;
            inline-size: auto;
            block-size: auto;
            padding: ${rem(size.room)};
            border-radius: ${rem(size.closet)};
          }
        }
      }
    `}
  />
);
