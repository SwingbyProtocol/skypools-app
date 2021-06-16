import { rem } from 'polished';
import { Global, css } from '@emotion/react';

import { size } from '../styles';

export const OnboardGlobalStyles = () => (
  <Global
    styles={css`
      .bn-onboard-custom {
        z-index: 100;

        .bn-onboard-modal-content {
          max-width: none;
          max-height: none;
          width: calc(100vw - ${rem(size.room)});
          height: calc(100vh - ${rem(size.room)});
          padding: ${rem(size.room)};
          border-radius: 0;

          @media (min-height: ${rem(600)}) {
            max-width: 37em;
            max-height: none;
            width: auto;
            height: auto;
            padding: ${rem(size.room)};
            border-radius: ${rem(size.closet)};
          }
        }
      }
    `}
  />
);
