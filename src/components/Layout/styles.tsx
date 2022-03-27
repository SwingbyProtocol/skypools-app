import { css } from '@emotion/react';
import { rem } from 'polished';

import { pulseAnimation, size } from '../../modules/styles';

export const swapScene = css`
  display: grid;
  grid-gap: ${rem(size.town)};
  grid-template-columns: 1fr;
  grid-template-rows: min-content min-content minmax(${rem(300)}, auto) ${rem(200)};
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
    grid-template-columns: 1fr 1fr minmax(${rem(320)}, 1fr);
    grid-template-rows: min-content min-content min-content minmax(${rem(75)}, 1fr);
    grid-template-areas:
      'header header header'
      'path path widget'
      'path path widget'
      'path path history';
  }
`;

export const balanceScene = css`
  display: flex;
  flex-direction: column;
  padding: ${rem(size.town)};
  padding-block: ${rem(size.town)};
  padding-inline: ${rem(size.town)};
  padding-block-start: var(--sp-app-inset-top);
  padding-block-end: var(--sp-app-inset-bottom);
  padding-inline-start: var(--sp-app-inset-left);
  padding-inline-end: var(--sp-app-inset-right);
  min-height: 100vh;
  min-width: 100vw;
`;

export const depositWithSkybridgeScene = css`
  @media (min-width: ${rem(1024)}) {
    display: grid;
    grid-gap: ${rem(0)};
    grid-template-columns: 1fr minmax(${rem(320)}, 1fr);
    grid-template-rows: min-content min-content min-content minmax(${rem(75)}, 1fr);
    grid-template-areas:
      'header header'
      '. .'
      'deposit skybridge'
      'deposit skybridge';
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
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  min-block-size: ${rem(250)};
  padding-block: ${rem(size.street)};
  padding-inline: ${rem(size.town)};
  writing-mode: horizontal-tb;
`;

export const loadingPulseAnimation = css`
  ${pulseAnimation};
  filter: saturate(0%);
`;

export const skybridgeWidgetCard = css`
  padding: 0;
  @media (prefers-color-scheme: dark) {
    overflow: hidden;
  }
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
  background: rgba(92, 150, 218, 0.2);
  box-shadow: inset #a2c6fb85 1px 1px 11px;
  border-radius: ${rem(size.house)};
  z-index: 2;

  @media (prefers-color-scheme: dark) {
    box-shadow: none;
    border: 1px solid hsl(var(--sp-color-border-normal));
  }
`;

export const balanceCard = css`
  grid-area: deposit;
  width: ${rem(310)};
  margin: auto;
  @media (min-width: ${rem(768)}) {
    width: ${rem(400)};
  }
  @media (min-width: ${rem(1024)}) {
    margin: auto;
  }
`;

export const skybridgeCard = css`
  grid-area: skybridge;
  margin: auto;
  width: ${rem(310)};
  padding: 0;
  border-radius: ${rem(size.house)};
  @media (min-width: ${rem(768)}) {
    width: ${rem(400)};
  }
  @media (prefers-color-scheme: dark) {
    overflow: hidden;
  }
`;
