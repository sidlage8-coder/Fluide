import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="h-16 flex items-center justify-between px-6 border-b border-glass-border bg-void-black/50 backdrop-blur-sm"
    >
      {/* Left: Title */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-mono font-bold tracking-widest text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs font-mono text-white/40 tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center: Status */}
      <div className="flex items-center gap-2">
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-2 h-2 rounded-full bg-neon-green"
          style={{
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
          }}
        />
        <span className="text-xs font-mono text-neon-green/80 tracking-widest">
          SYSTÈMES NOMINAUX
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-glass-primary border border-glass-border text-white/50 hover:text-white/80 hover:border-glass-border-light transition-all cursor-pointer"
        >
          <Search size={18} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg bg-glass-primary border border-glass-border text-white/50 hover:text-white/80 hover:border-glass-border-light transition-all relative cursor-pointer"
        >
          <Bell size={18} />
          {/* Notification dot */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-neon-orange" />
        </motion.button>
        
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-glass-primary border border-glass-border hover:border-neon-cyan/30 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neon-cyan to-neon-magenta flex items-center justify-center">
              <User size={14} className="text-void-black" />
            </div>
            <span className="text-xs font-mono text-white/70 max-w-24 truncate">
              {user?.name || user?.email?.split('@')[0] || 'PILOTE'}
            </span>
            <ChevronDown size={14} className={`text-white/50 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* User Menu Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 py-2 rounded-lg bg-void-dark border border-glass-border shadow-lg z-50"
              >
                <div className="px-3 py-2 border-b border-glass-border mb-2">
                  <p className="text-xs font-mono text-white/50 tracking-wider">OPÉRATEUR</p>
                  <p className="text-sm font-mono text-white truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-mono text-neon-orange hover:bg-neon-orange/10 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  DÉCONNEXION
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
