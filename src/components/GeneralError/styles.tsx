import { css } from '@emotion/react';

export const wrapper = css`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

export const title = css`
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 10px;
  text-align: center;
  width: 100%;
`;

export const errorCSS = css`
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.4;
  width: 100%;

  & p {
    font-size: 1.8rem;
    font-weight: 500;
    line-height: 1.4;
    margin: 0 0 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;
