import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => Promise<void> | void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  successMessage?: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

const variants = {
  primary: {
    base: 'bg-gradient-to-r from-neon-cyan to-blue-500 text-void-black',
    glow: 'rgba(59, 130, 246, 0.4)',
    hover: 'from-blue-400 to-neon-cyan',
  },
  secondary: {
    base: 'bg-glass-secondary border border-glass-border text-white/80',
    glow: 'rgba(255, 255, 255, 0.1)',
    hover: 'bg-glass-primary',
  },
  success: {
    base: 'bg-gradient-to-r from-emerald-500 to-green-400 text-void-black',
    glow: 'rgba(16, 185, 129, 0.4)',
    hover: 'from-green-400 to-emerald-500',
  },
  danger: {
    base: 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
    glow: 'rgba(239, 68, 68, 0.4)',
    hover: 'from-orange-500 to-red-500',
  },
  ghost: {
    base: 'bg-transparent text-white/60 hover:text-white',
    glow: 'transparent',
    hover: 'bg-glass-secondary',
  },
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-8 py-4 text-base gap-3',
};

export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  successMessage = 'Succès !',
  disabled = false,
  className = '',
  type = 'button',
}: ActionButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = async () => {
    if (disabled || state !== 'idle') return;

    // Create particles
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: Date.now() + i,
        x: rect.width / 2,
        y: rect.height / 2,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 800);
    }

    if (onClick) {
      setState('loading');
      try {
        await onClick();
        setState('success');
        setTimeout(() => setState('idle'), 1500);
      } catch {
        setState('idle');
      }
    }
  };

  const config = variants[variant];

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled || state === 'loading'}
      whileHover={{ 
        scale: disabled ? 1 : 1.03,
        boxShadow: disabled ? 'none' : `0 0 30px ${config.glow}`,
      }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`
        relative overflow-hidden rounded-lg font-mono font-semibold uppercase tracking-wider
        inline-flex items-center justify-center cursor-pointer
        transition-all duration-200
        ${config.base}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        boxShadow: disabled ? 'none' : `0 0 15px ${config.glow}`,
      }}
    >
      {/* Animated shine */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        initial={{ x: '-200%' }}
        animate={{ x: '200%' }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1 }}
      />

      {/* Particles burst */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-white"
            style={{ left: particle.x, top: particle.y }}
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              x: (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {state === 'loading' ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />
          </motion.div>
        ) : state === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center gap-2"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.4 }}
            >
              <Check size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} />
            </motion.div>
            <span>{successMessage}</span>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 relative z-10"
          >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Border glow pulse for primary */}
      {variant === 'primary' && !disabled && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-neon-cyan/50"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </motion.button>
  );
}
