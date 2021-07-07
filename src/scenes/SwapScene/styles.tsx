import { css } from '@emotion/react';
import { rem } from 'polished';

import { pulseAnimation, size } from '../../modules/styles';

export const swapScene = css`
  display: grid;
  grid-gap: ${rem(size.town)};
  grid-template-columns: 1fr;
  grid-template-rows: min-content min-content ${rem(300)} ${rem(200)};
  grid-template-areas:
    'header'
    'widget'
    'path'
    'history';
  padding: ${rem(size.town)};
  padding: ${rem(size.town)} var(--sp-app-inset-right) var(--sp-app-inset-bottom)
    var(--sp-app-inset-left);
  min-height: 100vh;

  @media (min-width: ${rem(768)}) {
    grid-template-columns: 1fr 1fr minmax(${rem(280)}, 1fr);
    grid-template-rows: min-content min-content min-content minmax(${rem(75)}, auto);
    grid-template-areas:
      'header header header'
      'path path widget'
      'path path widget'
      'path path history';
  }
`;

export const headerContainer = css`
  grid-area: header;
  margin: ${rem(-size.town)} ${rem(-size.town)} 0 ${rem(-size.town)};
  margin: ${rem(-size.town)} calc(-1 * var(--sp-app-inset-right)) 0
    calc(-1 * var(--sp-app-inset-left));
`;

export const priceAndPathCard = css`
  grid-area: path;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  overflow: hidden;
  z-index: 2;
`;

export const chartContainer = css`
  flex: 1;
  padding: ${rem(size.street)} ${rem(size.town)};
`;

export const swapPathContainer = css`
  background: hsl(var(--sp-color-bg-accent));
  padding: ${rem(size.street)} ${rem(size.town)};
`;

export const loadingPulseAnimation = css`
  ${pulseAnimation};
  filter: saturate(0%);
`;

export const widgetCard = css`
  grid-area: widget;
  display: flex;
  flex-direction: column;
  padding: ${rem(size.street)} ${rem(size.town)};
  align-self: stretch;
  justify-self: stretch;
  border: none;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
  z-index: 2;

  @media (prefers-color-scheme: dark) {
    box-shadow: none;
    border: 1px solid hsl(var(--sp-color-border-normal));
  }
`;

export const historyContainer = css`
  grid-area: history;
  position: relative;
  margin-top: ${rem(-size.town - size.room)};
  margin-bottom: ${rem(-size.town)};
  margin-bottom: calc(-1 * var(--sp-app-inset-bottom));
`;

export const historyCard = css`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
`;
