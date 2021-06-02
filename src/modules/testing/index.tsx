import { useMemo } from 'react';

export type Testable = { 'data-testid'?: string };

const genericBuildTestId = ({ parent, id: idParam }: { parent?: string; id?: string }) => {
  if (!idParam || !parent) return idParam;

  const parentArray = parent.split('.');
  const idArray = idParam.split('.');

  for (let i = 0; i < idArray.length; i++) {
    if (parentArray[i] === idArray[i]) continue;
    if (i === 0) return idParam;
    return idArray.slice(i).join('.');
  }

  return idParam;
};

export const useBuildTestId = ({ id: parent }: { id?: string } = {}) => {
  return useMemo(
    () =>
      ({
        buildTestId: (id: string) => {
          return genericBuildTestId({ parent, id });
        },
      } as const),
    [parent],
  );
};
