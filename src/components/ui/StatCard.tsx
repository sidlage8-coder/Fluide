import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  trend?: number;
  color?: 'cyan' | 'magenta' | 'green' | 'orange' | 'red';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  onClick?: () => void;
}

const colorConfig = {
  cyan: {
    bg: 'from-neon-cyan/10 to-neon-cyan/5',
    border: 'border-neon-cyan/20 hover:border-neon-cyan/40',
    text: 'text-neon-cyan',
    glow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    pulse: 'bg-neon-cyan',
  },
  magenta: {
    bg: 'from-neon-magenta/10 to-neon-magenta/5',
    border: 'border-neon-magenta/20 hover:border-neon-magenta/40',
    text: 'text-neon-magenta',
    glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]',
    pulse: 'bg-neon-magenta',
  },
  green: {
    bg: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    text: 'text-emerald-400',
    glow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    pulse: 'bg-emerald-500',
  },
  orange: {
    bg: 'from-amber-500/10 to-amber-500/5',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    text: 'text-amber-400',
    glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    pulse: 'bg-amber-500',
  },
  red: {
    bg: 'from-red-500/10 to-red-500/5',
    border: 'border-red-500/20 hover:border-red-500/40',
    text: 'text-red-400',
    glow: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
    pulse: 'bg-red-500',
  },
};

const sizeConfig = {
  sm: { padding: 'p-3', labelSize: 'text-[9px]', valueSize: 'text-xl', iconSize: 14 },
  md: { padding: 'p-4', labelSize: 'text-[10px]', valueSize: 'text-2xl', iconSize: 18 },
  lg: { padding: 'p-6', labelSize: 'text-xs', valueSize: 'text-4xl', iconSize: 24 },
};

export function StatCard({
  label,
  value,
  prefix = '',
  suffix = '',
  icon,
  trend,
  color = 'cyan',
  size = 'md',
  animated = true,
  onClick,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);
  const config = colorConfig[color];
  const sizeConf = sizeConfig[size];

  useEffect(() => {
    if (!animated) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(startValue + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, animated]);

  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-sm
        bg-gradient-to-br ${config.bg} ${config.border} ${config.glow}
        ${sizeConf.padding}
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-300 group
      `}
    >
      {/* Animated corner accent */}
      <motion.div
        className={`absolute top-0 right-0 w-16 h-16 ${config.pulse} opacity-5`}
        style={{
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
        }}
        animate={{
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <motion.span 
              className={config.text}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              {icon}
            </motion.span>
          )}
          <span className={`${sizeConf.labelSize} font-mono font-medium text-white/40 tracking-wider uppercase`}>
            {label}
          </span>
        </div>
        
        {trend !== undefined && TrendIcon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
              flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono
              ${trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : trend < 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40'}
            `}
          >
            <TrendIcon size={10} />
            <span>{Math.abs(trend)}%</span>
          </motion.div>
        )}
      </div>

      {/* Value */}
      <motion.div
        className={`${sizeConf.valueSize} font-mono font-bold ${config.text}`}
        key={value}
        initial={animated ? { scale: 1.1, opacity: 0.5 } : {}}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {prefix}
        {Math.round(displayValue).toLocaleString('fr-FR')}
        {suffix && <span className="text-lg ml-1 opacity-70">{suffix}</span>}
      </motion.div>

      {/* Bottom pulse line */}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${config.pulse}`}
        initial={{ width: '0%' }}
        animate={{ width: ['0%', '100%', '0%'] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{ opacity: 0.3 }}
      />

      {/* Hover glow effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
        <div className={`absolute inset-0 ${config.pulse} opacity-5 blur-xl`} />
      </div>
    </motion.div>
  );
}
