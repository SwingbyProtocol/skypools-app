import { header, logo } from './styles';

type Props = { className?: string };

export const Header = ({ className }: Props) => {
  return (
    <header css={header} className={className}>
      <img css={logo} src="/logo.svg" alt="Skypools" />
    </header>
  );
};
