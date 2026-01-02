import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Trophy, Star } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  type?: 'check' | 'sparkles' | 'trophy' | 'money';
  message?: string;
  subMessage?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({
  show,
  type = 'check',
  message = 'Succès !',
  subMessage,
  onComplete,
}: SuccessAnimationProps) {
  const icons = {
    check: Check,
    sparkles: Sparkles,
    trophy: Trophy,
    money: Zap,
  };

  const Icon = icons[type];

  const colors = {
    check: { bg: 'from-emerald-500 to-green-400', glow: 'rgba(16, 185, 129, 0.5)' },
    sparkles: { bg: 'from-purple-500 to-pink-500', glow: 'rgba(139, 92, 246, 0.5)' },
    trophy: { bg: 'from-yellow-500 to-amber-400', glow: 'rgba(245, 158, 11, 0.5)' },
    money: { bg: 'from-neon-cyan to-blue-500', glow: 'rgba(59, 130, 246, 0.5)' },
  };

  const config = colors[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            if (!show) onComplete?.();
          }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-void-black/60 backdrop-blur-sm"
          />

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Icon circle */}
            <motion.div
              className={`w-24 h-24 rounded-full bg-gradient-to-br ${config.bg} flex items-center justify-center`}
              style={{ boxShadow: `0 0 60px ${config.glow}` }}
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  `0 0 60px ${config.glow}`,
                  `0 0 100px ${config.glow}`,
                  `0 0 60px ${config.glow}`,
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Icon size={48} className="text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>

            {/* Message */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-2xl font-mono font-bold text-white"
            >
              {message}
            </motion.h2>

            {subMessage && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-sm font-mono text-white/60"
              >
                {subMessage}
              </motion.p>
            )}

            {/* Particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1],
                  opacity: [1, 0],
                  x: Math.cos((i / 20) * Math.PI * 2) * 150,
                  y: Math.sin((i / 20) * Math.PI * 2) * 150,
                }}
                transition={{ delay: 0.2 + i * 0.02, duration: 0.8 }}
              >
                <Star
                  size={12}
                  className="text-yellow-400"
                  fill="currentColor"
                />
              </motion.div>
            ))}

            {/* Ring burst */}
            <motion.div
              className="absolute w-24 h-24 rounded-full border-4 border-white/30"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
            <motion.div
              className="absolute w-24 h-24 rounded-full border-2 border-white/20"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 1, delay: 0.1 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Quick toast notification for inline success
export function SuccessToast({
  show,
  message,
  onHide,
}: {
  show: boolean;
  message: string;
  onHide?: () => void;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          onAnimationComplete={() => {
            if (!show) onHide?.();
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <motion.div
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 text-white font-mono font-semibold shadow-xl"
            style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)' }}
            animate={{
              boxShadow: [
                '0 0 40px rgba(16, 185, 129, 0.4)',
                '0 0 60px rgba(16, 185, 129, 0.6)',
                '0 0 40px rgba(16, 185, 129, 0.4)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Check size={20} strokeWidth={3} />
            </motion.div>
            <span>{message}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
