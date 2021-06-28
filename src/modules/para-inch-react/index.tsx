import { useContext } from 'react';

import { ParaInchContext } from './context';

export { ParaInchTokenProvider } from './context';

export type { ParaInchContextValue } from './context';

export const useParaInch = () => useContext(ParaInchContext);
