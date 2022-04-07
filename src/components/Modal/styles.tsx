import { css } from '@emotion/react';

export const wrapper = css`
  align-items: center;
  background-color: rgb(161 158 177 / 70%);
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 100;
`;

export const titleWrapper = css`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
`;

export const titleCss = css`
  font-size: 1.8rem;
  font-weight: normal;
  line-height: 1.2;
  margin: 0;
`;

export const closeButton = css`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  height: 20px;
  justify-content: center;
  margin: -4px 0 0 0;
  padding: 0;
  position: relative;
  right: -4px;
  width: 20px;

  .fill {
    transition: fill 0.1s linear;
  }

  &:hover {
    .fill {
      fill: #fff;
    }
  }

  &:active {
    opacity: 0.7;
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const contents = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const buttons = css`
  margin-top: auto;
  padding-top: 50px;
`;

export const card = css`
  display: flex;
  flex-direction: column;
  min-height: 250px;
  padding: 22px 32px;
`;
