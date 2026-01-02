import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

const variants = {
  primary: `
    bg-neon-cyan/10 border-neon-cyan/50 text-neon-cyan
    hover:bg-neon-cyan/20 hover:border-neon-cyan
    hover:shadow-[0_0_20px_rgba(0,240,255,0.3)]
  `,
  secondary: `
    bg-glass-secondary border-glass-border text-white/80
    hover:bg-glass-primary hover:border-glass-border-light
  `,
  danger: `
    bg-neon-orange/10 border-neon-orange/50 text-neon-orange
    hover:bg-neon-orange/20 hover:border-neon-orange
    hover:shadow-[0_0_20px_rgba(255,107,0,0.3)]
  `,
  ghost: `
    bg-transparent border-transparent text-white/60
    hover:bg-glass-primary hover:text-white
  `,
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`
        inline-flex items-center justify-center
        font-mono font-medium uppercase tracking-widest
        border rounded cursor-pointer
        transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
