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
  padding-block: ${rem(size.town)};
  padding-inline: ${rem(size.town)};
  padding-block-start: var(--sp-app-inset-top);
  padding-block-end: var(--sp-app-inset-bottom);
  padding-inline-start: var(--sp-app-inset-left);
  padding-inline-end: var(--sp-app-inset-right);
  min-height: 100vh;
  min-width: 100vw;

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
  margin-block: ${rem(-size.town)} 0;
  margin-inline: ${rem(-size.town)};
  margin-inline-start: calc(-1 * var(--sp-app-inset-left));
  margin-inline-end: calc(-1 * var(--sp-app-inset-right));
`;

export const priceAndPathCard = css`
  grid-area: path;
  display: flex;
  flex-direction: column;
  max-inline-size: 100%;
  overflow: hidden;
  z-index: 2;
`;

export const chartContainer = css`
  flex: 1;
  padding-block: ${rem(size.street)};
  padding-inline: ${rem(size.town)};
  writing-mode: horizontal-tb;
`;

export const swapPathContainer = css`
  background: hsl(var(--sp-color-bg-accent));
  padding-block: ${rem(size.street)};
  padding-inline: ${rem(size.town)};
`;

export const loadingPulseAnimation = css`
  ${pulseAnimation};
  filter: saturate(0%);
`;

export const widgetCard = css`
  grid-area: widget;
  display: flex;
  flex-direction: column;
  padding-block: ${rem(size.street)};
  padding-inline: ${rem(size.town)};
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
  margin-block-start: ${rem(-size.town - size.room)};
  margin-block-end: ${rem(-size.town)};
  margin-block-end: calc(-1 * var(--sp-app-inset-bottom));
`;

export const historyCard = css`
  position: absolute;
  inline-size: 100%;
  block-size: 100%;
  inset-block-start: 0;
  inset-inline-start: 0;
`;
