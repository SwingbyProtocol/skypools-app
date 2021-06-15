import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const swapScene = css`
  display: grid;
  grid-gap: ${rem(size.town)};
  grid-template-columns: 1fr 1fr minmax(min-content, 1fr);
  grid-template-rows: min-content min-content 1fr 1fr;
  grid-template-areas:
    'header header header'
    'path path widget'
    'path path widget'
    'path path history';
  padding: ${rem(size.town)};
  min-height: 100vh;
`;

export const headerContainer = css`
  grid-area: header;
  margin: ${rem(-size.town)} ${rem(-size.town)} 0 ${rem(-size.town)};
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

export const widgetCard = css`
  grid-area: widget;
  display: flex;
  flex-direction: column;
  padding: ${rem(size.street)} ${rem(size.town)};
  align-self: stretch;
  justify-self: stretch;
  border: none;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
`;

export const historyCard = css`
  grid-area: history;
  overflow: hidden;
`;
