import { css } from '@emotion/react';

export const platformBox = css`
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  user-select: none;
  padding: var(--platform-box-min-padding);
  flex-grow: 1;
  flex-shrink: 0;
`;

export const withFractionsBox = css``;

export const withNamesBox = css`
  padding: var(--platform-box-padding);
  flex-shrink: 1;
`;

export const item = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  :not(:last-child) {
    margin-bottom: var(--platform-item-gap);
  }
`;

export const itemLogo = css`
  font-size: var(--platform-logo-min-size);
  flex-grow: 0;
  flex-shrink: 1;

  .${withFractionsBox} & {
    font-size: var(--platform-logo-size);
  }
`;

export const itemName = css`
  white-space: nowrap;
  margin-left: var(--platform-name-gap);
  flex-grow: 0;
  flex-shrink: 1;
  font-size: var(--platform-font-size);
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const itemFraction = css`
  white-space: nowrap;
  margin-left: var(--platform-fraction-gap);
  flex-grow: 1;
  flex-shrink: 0;
  text-align: right;
  font-size: var(--platform-font-size);
  font-weight: 500;
`;
