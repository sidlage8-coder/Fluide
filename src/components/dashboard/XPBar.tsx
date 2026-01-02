import { motion } from 'framer-motion';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
}

export function XPBar({ currentXP, maxXP, level }: XPBarProps) {
  const progress = (currentXP / maxXP) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Background bar */}
      <div className="h-1 bg-void-dark">
        {/* Progress fill with liquid light effect */}
        <motion.div
          className="h-full relative overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #00f0ff 0%, #00f0ff 80%, #00ff88 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      </div>
      
      {/* Level indicator */}
      <motion.div
        className="absolute right-4 top-3 flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-xs font-mono text-white/40 tracking-widest">
          NIVEAU
        </span>
        <span className="text-sm font-mono font-bold text-neon-cyan">
          {level}
        </span>
        <span className="text-xs font-mono text-white/30">
          ({currentXP}/{maxXP} XP)
        </span>
      </motion.div>
    </div>
  );
}
