import type { ReactNode } from 'react';

export interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface CardProps {
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}