import { HTMLAttributes, ReactNode } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function Card({ children, className = '', ...rest }: Props) {
  return (
    <div
      {...rest}
      className={[
        'rounded-xl border border-line-subtle bg-bg-card shadow-card',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
