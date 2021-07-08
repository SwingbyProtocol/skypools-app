import { css } from '@emotion/react';

export const container = css`
  height: 100%;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

export const wrapper = css`
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  height: 100%;
  width: 100%;
`;

export const loadingContainer = css`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
