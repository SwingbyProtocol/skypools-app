import { PulsarThemeType } from '@swingby-protocol/pulsar/src/modules/themes/PulsarThemeType';
/// <reference types="@emotion/react/types/css-prop" />
declare module '@emotion/react' {
  export interface Theme extends PulsarThemeType {}
}

declare module 'react' {
  interface Attributes {
    css?: any;
  }
}
