import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface DataTextProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  color?: 'cyan' | 'magenta' | 'orange' | 'green' | 'white';
}

const colorClasses = {
  cyan: 'text-neon-cyan',
  magenta: 'text-neon-magenta',
  orange: 'text-neon-orange',
  green: 'text-neon-green',
  white: 'text-white',
};

export function DataText({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  color = 'cyan',
}: DataTextProps) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (current) =>
    current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <span className={`font-mono tracking-wider ${colorClasses[color]} ${className}`}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}
