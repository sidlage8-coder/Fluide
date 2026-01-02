import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: 'default' | 'highlight' | 'danger';
  glow?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'border-glass-border',
  highlight: 'border-neon-cyan/30',
  danger: 'border-neon-orange/30',
};

const glowStyles = {
  default: '',
  highlight: 'shadow-[0_0_20px_rgba(0,240,255,0.15)]',
  danger: 'shadow-[0_0_20px_rgba(255,107,0,0.15)]',
};

export function GlassPanel({
  children,
  variant = 'default',
  glow = false,
  className = '',
  ...props
}: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className={`
        relative overflow-hidden rounded-lg
        bg-glass-primary backdrop-blur-xl
        border ${variantStyles[variant]}
        ${glow ? glowStyles[variant] : ''}
        ${className}
      `}
      {...props}
    >
      {/* Top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </motion.div>
  );
}
