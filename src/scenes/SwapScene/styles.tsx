import { css, keyframes } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const swapScene = css`
  display: grid;
  grid-gap: ${rem(size.town)};
  grid-template-columns: 1fr 1fr minmax(min-content, 1fr);
  grid-template-rows: min-content min-content min-content 1fr;
  grid-template-areas:
    'header header header'
    'path path widget'
    'path path widget'
    'path path history';
  padding: ${rem(size.town)};
  padding: ${rem(size.town)} max(env(safe-area-inset-right), ${rem(size.town)})
    max(env(safe-area-inset-bottom), ${rem(size.town)})
    max(env(safe-area-inset-left), ${rem(size.town)});
  min-height: 100vh;
`;

export const headerContainer = css`
  grid-area: header;
  margin: ${rem(-size.town)} ${rem(-size.town)} 0 ${rem(-size.town)};
  margin: ${rem(-size.town)} calc(-1 * max(${rem(size.town)}, env(safe-area-inset-right))) 0
    calc(-1 * max(${rem(size.town)}, env(safe-area-inset-left)));
`;

export const priceAndPathCard = css`
  grid-area: path;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  overflow: hidden;
`;

export const chartContainer = css`
  flex: 1;
  padding: ${rem(size.street)} ${rem(size.town)};
`;

export const swapPathContainer = css`
  background: hsl(var(--sp-color-bg-accent));
  padding: ${rem(size.street)} ${rem(size.town)};
`;

const pulse = keyframes`
  from, 20%, 53%, 80%, to {
    opacity: 0.4;
  }

  40%, 43% {
    opacity: 0.1;
  }

  70% {
    opacity: 0.3;
  }

  90% {
    opacity: 0.5;
  }
`;

export const loadingPulseAnimation = css`
  opacity: 0.5;
  filter: saturate(0%);
  animation: ${pulse} 5s ease infinite;
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

export const historyCard = css`
  grid-area: history;
  margin-top: ${rem(-size.town - size.room)};
  margin-bottom: ${rem(-size.town)};
  margin-bottom: calc(-1 * max(${rem(size.town)}, env(safe-area-inset-bottom)));
`;
