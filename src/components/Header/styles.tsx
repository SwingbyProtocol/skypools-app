import { css } from '@emotion/react';
import { rem } from 'polished';

import { size } from '../../modules/styles';

export const header = css`
  display: grid;
  grid-template-rows: min-content min-content;
  grid-template-areas:
    'logo logo'
    'links info';
  align-items: center;
  align-content: center;
  justify-content: space-between;
  justify-items: start;
  grid-row-gap: ${rem(size.drawer)};
  min-block-size: ${rem(120)};
  padding-block: 0;
  padding-inline: ${rem(size.town)};
  padding-inline-start: var(--sp-app-inset-right);
  padding-inline-end: var(--sp-app-inset-right);
  @media (min-width: ${rem(768)}) {
    grid-template-rows: none;
    grid-template-areas: 'logo links info';
    min-block-size: ${rem(80)};
  }
`;

export const logo = css`
  grid-area: logo;
  cursor: pointer;
  text-decoration: none;
  color: hsl(var(--sp-color-primary-normal));
  font-weight: 600;
  @media (min-width: ${rem(425)}) {
    font-size: ${rem(size.street)};
    font-weight: 700;
  }
  @media (min-width: ${rem(1024)}) {
    font-size: ${rem(size.town)};
  }
`;

export const info = css`
  grid-area: info;
  display: flex;
  column-gap: ${rem(size.box)};
  align-items: center;
  @media (min-width: ${rem(1024)}) {
    column-gap: ${rem(size.state)};
  }
`;

export const connect = css`
  grid-area: connect;
`;

export const links = css`
  grid-area: links;
  display: flex;
  column-gap: ${rem(size.room)};
  align-items: center;
  @media (min-width: ${rem(768)}) {
    column-gap: ${rem(size.closet)};
  }
  @media (min-width: ${rem(1024)}) {
    column-gap: ${rem(size.state)};
  }
`;

export const link = css`
  text-decoration: none;
  font-weight: 600;
  font-size: ${rem(size.room)};
  @media (min-width: ${rem(425)}) {
    font-size: ${rem(size.house)};
  }
`;
