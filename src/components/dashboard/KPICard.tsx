import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { GlassPanel } from '../ui/GlassPanel';
import { DataText } from '../ui/DataText';

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  trend?: number;
  color?: 'cyan' | 'magenta' | 'orange' | 'green';
  decimals?: number;
}

export function KPICard({
  label,
  value,
  prefix = '',
  suffix = '',
  icon,
  trend,
  color = 'cyan',
  decimals = 0,
}: KPICardProps) {
  const trendColor = trend && trend > 0 ? 'text-neon-green' : 'text-neon-orange';
  const trendIcon = trend && trend > 0 ? '↑' : '↓';

  return (
    <GlassPanel
      className="p-4 min-w-[180px]"
      variant={color === 'cyan' ? 'highlight' : color === 'orange' ? 'danger' : 'default'}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono tracking-widest text-white/40 uppercase">
          {label}
        </span>
        {icon && (
          <motion.span
            className="text-white/30"
            whileHover={{ scale: 1.1, opacity: 1 }}
          >
            {icon}
          </motion.span>
        )}
      </div>
      
      <div className="flex items-end gap-2">
        <DataText
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          color={color}
          className="text-2xl font-bold"
        />
        
        {trend !== undefined && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-mono ${trendColor} mb-1`}
          >
            {trendIcon} {Math.abs(trend)}%
          </motion.span>
        )}
      </div>
      
      {/* Bottom accent line */}
      <motion.div
        className="mt-3 h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, var(--color-neon-${color}) 50%, transparent 100%)`,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
    </GlassPanel>
  );
}
