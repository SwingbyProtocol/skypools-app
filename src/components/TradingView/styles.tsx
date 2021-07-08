import { css } from '@emotion/react';

export const container = css`
  block-size: 100%;
  inline-size: 100%;
  overflow: hidden;
  position: relative;
`;

export const wrapper = css`
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  block-size: 100%;
  inline-size: 100%;
`;

export const loadingContainer = css`
  block-size: 100%;
  inline-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
