import { Base, GhostAlt, TextAlt } from './styled';

type ExternalLinkProps = {
  href: string;
  children: React.ReactNode;
  iconOnly?: boolean;
  size?: 'small' | 'normal' | 'big';
  variant: 'text-alt' | 'ghost-alt';
};

export function ExternalLink({
  variant,
  href,
  children,
  iconOnly = false,
  size = 'normal',
}: ExternalLinkProps) {
  if (variant === 'text-alt')
    return (
      <TextAlt size={size} iconOnly={iconOnly} href={href}>
        {children}
      </TextAlt>
    );
  if (variant === 'ghost-alt')
    return (
      <GhostAlt size={size} iconOnly={iconOnly} href={href}>
        {children}
      </GhostAlt>
    );
  return (
    <Base size={size} iconOnly={iconOnly} href={href}>
      {children}
    </Base>
  );
}
