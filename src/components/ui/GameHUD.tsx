import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  Trophy, Star, Target, Flame, Zap,
  Coins, Award, Sparkles 
} from 'lucide-react';

// ============================================
// GAME STATE CONTEXT
// ============================================

interface GameStats {
  xp: number;
  level: number;
  streak: number;
  totalInvoiced: number;
  totalCollected: number;
  clientsCount: number;
  invoicesCount: number;
  quotesCount: number;
  achievements: string[];
}

interface Notification {
  id: string;
  type: 'xp' | 'level' | 'achievement' | 'money' | 'streak';
  title: string;
  value?: number;
  icon?: React.ReactNode;
}

interface GameContextType {
  stats: GameStats;
  notifications: Notification[];
  addXP: (amount: number, reason?: string) => void;
  addMoney: (amount: number) => void;
  incrementStreak: () => void;
  unlockAchievement: (id: string, title: string) => void;
  triggerCelebration: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}

// XP required per level (exponential curve)
const getXPForLevel = (level: number) => Math.floor(100 * Math.pow(1.5, level - 1));

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<GameStats>({
    xp: 0,
    level: 1,
    streak: 0,
    totalInvoiced: 0,
    totalCollected: 0,
    clientsCount: 0,
    invoicesCount: 0,
    quotesCount: 0,
    achievements: [],
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const addNotification = useCallback((notif: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notif, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const addXP = useCallback((amount: number, reason?: string) => {
    setStats(prev => {
      const newXP = prev.xp + amount;
      const xpNeeded = getXPForLevel(prev.level);
      
      if (newXP >= xpNeeded) {
        // Level up!
        const newLevel = prev.level + 1;
        addNotification({
          type: 'level',
          title: `NIVEAU ${newLevel}`,
          value: newLevel,
          icon: <Trophy className="text-yellow-400" />,
        });
        return { ...prev, xp: newXP - xpNeeded, level: newLevel };
      }
      
      return { ...prev, xp: newXP };
    });

    addNotification({
      type: 'xp',
      title: reason || 'XP gagné',
      value: amount,
      icon: <Zap className="text-neon-cyan" />,
    });
  }, [addNotification]);

  const addMoney = useCallback((amount: number) => {
    setStats(prev => ({
      ...prev,
      totalCollected: prev.totalCollected + amount,
    }));
    
    addNotification({
      type: 'money',
      title: 'Paiement reçu',
      value: amount,
      icon: <Coins className="text-emerald-400" />,
    });
  }, [addNotification]);

  const incrementStreak = useCallback(() => {
    setStats(prev => {
      const newStreak = prev.streak + 1;
      if (newStreak % 5 === 0) {
        addNotification({
          type: 'streak',
          title: `COMBO x${newStreak}`,
          value: newStreak,
          icon: <Flame className="text-orange-400" />,
        });
      }
      return { ...prev, streak: newStreak };
    });
  }, [addNotification]);

  const unlockAchievement = useCallback((id: string, title: string) => {
    setStats(prev => {
      if (prev.achievements.includes(id)) return prev;
      
      addNotification({
        type: 'achievement',
        title: title,
        icon: <Award className="text-purple-400" />,
      });
      
      return { ...prev, achievements: [...prev.achievements, id] };
    });
  }, [addNotification]);

  const triggerCelebration = useCallback(() => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  }, []);

  return (
    <GameContext.Provider value={{
      stats,
      notifications,
      addXP,
      addMoney,
      incrementStreak,
      unlockAchievement,
      triggerCelebration,
    }}>
      {children}
      <NotificationStack notifications={notifications} />
      <AnimatePresence>
        {showCelebration && <CelebrationOverlay />}
      </AnimatePresence>
    </GameContext.Provider>
  );
}

// ============================================
// HUD COMPONENT
// ============================================

export function GameHUD() {
  const { stats } = useGame();
  const xpNeeded = getXPForLevel(stats.level);
  const xpProgress = (stats.xp / xpNeeded) * 100;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-20 right-0 h-12 bg-void-dark/90 backdrop-blur-xl border-b border-glass-border z-30 flex items-center px-6 gap-6"
    >
      {/* Level & XP Bar */}
      <div className="flex items-center gap-3">
        <motion.div 
          className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-neon-magenta/20 border border-neon-cyan/30 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
        >
          <span className="text-lg font-mono font-bold text-neon-cyan">{stats.level}</span>
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-cyan flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Star size={10} className="text-void-black" />
          </motion.div>
        </motion.div>
        
        <div className="w-32">
          <div className="flex justify-between text-[10px] font-mono text-white/40 mb-1">
            <span>XP</span>
            <span>{stats.xp}/{xpNeeded}</span>
          </div>
          <div className="h-2 bg-void-gray rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-glass-border" />

      {/* Quick Stats */}
      <div className="flex items-center gap-4">
        <HUDStat 
          icon={<Target size={14} />} 
          label="CLIENTS" 
          value={stats.clientsCount}
          color="text-blue-400"
        />
        <HUDStat 
          icon={<Coins size={14} />} 
          label="ENCAISSÉ" 
          value={`${(stats.totalCollected / 1000).toFixed(1)}K`}
          color="text-emerald-400"
        />
        <HUDStat 
          icon={<Flame size={14} />} 
          label="STREAK" 
          value={stats.streak}
          color="text-orange-400"
          pulse={stats.streak > 0}
        />
      </div>

      {/* Separator */}
      <div className="flex-1" />

      {/* Achievements Counter */}
      <motion.div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-glass-secondary border border-glass-border"
        whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.5)' }}
      >
        <Trophy size={14} className="text-yellow-400" />
        <span className="text-xs font-mono text-white/60">{stats.achievements.length} TROPHÉES</span>
      </motion.div>
    </motion.div>
  );
}

function HUDStat({ 
  icon, 
  label, 
  value, 
  color,
  pulse = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  color: string;
  pulse?: boolean;
}) {
  return (
    <motion.div 
      className="flex items-center gap-2"
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      <span className={color}>{icon}</span>
      <div className="flex flex-col">
        <span className="text-[9px] font-mono text-white/30 tracking-wider">{label}</span>
        <span className={`text-sm font-mono font-bold ${color}`}>{value}</span>
      </div>
    </motion.div>
  );
}

// ============================================
// NOTIFICATION STACK
// ============================================

function NotificationStack({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="fixed top-16 right-6 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notif) => (
          <NotificationToast key={notif.id} notification={notif} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationToast({ notification }: { notification: Notification }) {
  const bgColors = {
    xp: 'from-neon-cyan/20 to-neon-cyan/5 border-neon-cyan/30',
    level: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    achievement: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    money: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    streak: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 100, opacity: 0, scale: 0.8 }}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl
        bg-gradient-to-r ${bgColors[notification.type]}
      `}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 0.5 }}
      >
        {notification.icon}
      </motion.div>
      <div>
        <p className="text-xs font-mono font-bold text-white">{notification.title}</p>
        {notification.value !== undefined && (
          <motion.p 
            className="text-lg font-mono font-bold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            +{typeof notification.value === 'number' && notification.type === 'money' 
              ? `${notification.value.toLocaleString('fr-FR')} €` 
              : notification.value}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// CELEBRATION OVERLAY
// ============================================

function CelebrationOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none z-[100]"
    >
      {/* Particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][Math.floor(Math.random() * 5)],
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
            y: [0, -100 - Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 200],
          }}
          transition={{
            duration: 1 + Math.random(),
            delay: Math.random() * 0.5,
          }}
        />
      ))}
      
      {/* Center burst */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 3], opacity: [1, 0] }}
        transition={{ duration: 0.8 }}
      >
        <Sparkles size={100} className="text-yellow-400" />
      </motion.div>
    </motion.div>
  );
}

// ============================================
// ANIMATED COUNTER
// ============================================

export function AnimatedCounter({ 
  value, 
  prefix = '', 
  suffix = '',
  className = '',
  duration = 1 
}: { 
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function (ease out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(Math.floor(startValue + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <motion.span 
      className={className}
      key={value}
      initial={{ scale: 1.2, color: '#10b981' }}
      animate={{ scale: 1, color: 'inherit' }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{displayValue.toLocaleString('fr-FR')}{suffix}
    </motion.span>
  );
}

// ============================================
// PROGRESS RING
// ============================================

export function ProgressRing({ 
  progress, 
  size = 60, 
  strokeWidth = 4,
  color = '#3b82f6',
  children 
}: { 
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ============================================
// PULSE BUTTON
// ============================================

export function PulseButton({ 
  children, 
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  disabled?: boolean;
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const colors = {
    primary: { bg: 'bg-neon-cyan', glow: 'rgba(59, 130, 246, 0.5)', text: 'text-void-black' },
    success: { bg: 'bg-emerald-500', glow: 'rgba(16, 185, 129, 0.5)', text: 'text-void-black' },
    warning: { bg: 'bg-amber-500', glow: 'rgba(245, 158, 11, 0.5)', text: 'text-void-black' },
    danger: { bg: 'bg-red-500', glow: 'rgba(239, 68, 68, 0.5)', text: 'text-white' },
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
    
    onClick?.();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, boxShadow: disabled ? 'none' : `0 0 30px ${colors[variant].glow}` }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative overflow-hidden px-6 py-3 rounded-lg font-mono font-bold uppercase tracking-wider
        ${colors[variant].bg} ${colors[variant].text}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-200
        ${className}
      `}
      style={{
        boxShadow: disabled ? 'none' : `0 0 20px ${colors[variant].glow}`,
      }}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          style={{ left: ripple.x, top: ripple.y }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
          animate={{ width: 300, height: 300, x: -150, y: -150, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      ))}
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
      />
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
