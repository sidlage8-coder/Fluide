import { motion, useAnimationFrame } from 'framer-motion';
import { useState, useRef } from 'react';

interface CoreStabilityProps {
  health: number; // 0-100
  value: number;
  label?: string;
}

export function CoreStability({ health, value, label = 'TRÉSORERIE' }: CoreStabilityProps) {
  const [rotation, setRotation] = useState(0);
  const timeRef = useRef(0);
  
  // Determine color based on health
  const getColor = () => {
    if (health > 70) return '#00f0ff';
    if (health > 40) return '#ff00ff';
    return '#ff6b00';
  };
  
  const color = getColor();
  const isUnstable = health < 40;
  const isCritical = health < 20;
  
  // Animation loop for rotation
  useAnimationFrame((t) => {
    const delta = t - timeRef.current;
    timeRef.current = t;
    
    // Speed varies with health - lower health = slower, more erratic
    const baseSpeed = 0.02;
    const speed = baseSpeed * (health / 100);
    
    // Add jitter when unstable
    const jitter = isUnstable ? Math.sin(t * 0.01) * (1 - health / 100) * 5 : 0;
    
    setRotation((prev) => prev + speed * delta + jitter);
  });
  
  // Calculate ellipse distortion based on health
  const scaleX = 1;
  const scaleY = isUnstable ? 0.7 + (health / 100) * 0.3 : 1;
  
  const formattedValue = value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  });

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer glow */}
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: color }}
      />
      
      {/* Main SVG */}
      <svg
        width="280"
        height="280"
        viewBox="-140 -140 280 280"
        className="relative z-10"
      >
        {/* Background circles */}
        <circle
          cx="0"
          cy="0"
          r="120"
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        />
        <circle
          cx="0"
          cy="0"
          r="100"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
        <circle
          cx="0"
          cy="0"
          r="80"
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        />
        
        {/* Rotating ring */}
        <motion.g
          style={{
            rotate: rotation,
            scaleX,
            scaleY,
          }}
        >
          {/* Main stability ring */}
          <circle
            cx="0"
            cy="0"
            r="90"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={isCritical ? '8 4' : isUnstable ? '20 5' : '0'}
            opacity={0.8}
            style={{
              filter: `drop-shadow(0 0 10px ${color})`,
            }}
          />
          
          {/* Inner accent ring */}
          <circle
            cx="0"
            cy="0"
            r="85"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            opacity={0.4}
          />
          
          {/* Tick marks */}
          {Array.from({ length: 36 }).map((_, i) => (
            <line
              key={i}
              x1="0"
              y1="-92"
              x2="0"
              y2={i % 3 === 0 ? '-98' : '-95'}
              stroke={color}
              strokeWidth={i % 3 === 0 ? '1.5' : '0.5'}
              opacity={i % 3 === 0 ? 0.8 : 0.3}
              transform={`rotate(${i * 10})`}
            />
          ))}
        </motion.g>
        
        {/* Health arc */}
        <motion.circle
          cx="0"
          cy="0"
          r="105"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(health / 100) * 659.73} 659.73`}
          strokeDashoffset="164.93"
          opacity={0.6}
          initial={{ strokeDasharray: '0 659.73' }}
          animate={{ strokeDasharray: `${(health / 100) * 659.73} 659.73` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
        
        {/* Center point */}
        <motion.circle
          cx="0"
          cy="0"
          r="4"
          fill={color}
          animate={{
            scale: isCritical ? [1, 1.5, 1] : 1,
            opacity: isCritical ? [1, 0.5, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: isCritical ? Infinity : 0,
          }}
          style={{
            filter: `drop-shadow(0 0 10px ${color})`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span
          className="text-xs font-mono tracking-[0.3em] opacity-50 mb-2"
          style={{ color }}
        >
          {label}
        </span>
        <motion.span
          className="text-3xl font-mono font-bold tracking-wider"
          style={{ color }}
          animate={{
            opacity: isCritical ? [1, 0.6, 1] : 1,
          }}
          transition={{
            duration: 0.8,
            repeat: isCritical ? Infinity : 0,
          }}
        >
          {formattedValue}
        </motion.span>
        <span className="text-xs font-mono mt-2 opacity-40">
          STABILITÉ {health}%
        </span>
      </div>
    </div>
  );
}
