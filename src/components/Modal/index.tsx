import React, { HTMLAttributes } from 'react';
import { FormattedMessage } from 'react-intl';

import { Button } from '../Button';

import { buttons, card, closeButton, contents, titleWrapper, wrapper, titleCss } from './styles';

export type modalSize = 'sm' | 'md' | 'lg' | string;

interface Props extends HTMLAttributes<HTMLDivElement> {
  isConfirmDisabled?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  onClose?: () => void;
  size?: modalSize;
  titleID: string;
}

export const Close = (): React.ReactElement => {
  return <div>CLOSE</div>;
};

export const Modal: React.FC<Props> = ({
  children,
  confirmText = 'Confirm',
  isConfirmDisabled,
  onClose,
  onConfirm,
  size = 'sm',
  titleID,
  ...restProps
}: Props) => {
  return (
    <div css={wrapper} onClick={onClose} {...restProps}>
      <div
        css={card}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div css={titleWrapper}>
          <FormattedMessage css={titleCss} id={titleID} />
          {onClose && (
            <Button css={closeButton} onClick={onClose} size={'city'} variant={'primary'}>
              <Close />
            </Button>
          )}
        </div>
        <div css={contents}>{children}</div>
        {onConfirm ||
          (onClose && (
            <div css={buttons}>
              {onConfirm && (
                <Button
                  disabled={isConfirmDisabled}
                  onClick={onConfirm}
                  variant="secondary"
                  size="city"
                >
                  {confirmText}
                </Button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
