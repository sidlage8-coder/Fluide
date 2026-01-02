import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calculator,
  Settings,
  LogOut,
  Zap,
  ClipboardList,
  Wallet,
  Cog,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'TACTICAL', icon: <LayoutDashboard size={20} /> },
  { id: 'clients', label: 'RADAR', icon: <Users size={20} /> },
  { id: 'quotes', label: 'DEVIS', icon: <ClipboardList size={20} /> },
  { id: 'invoices', label: 'FACTURES', icon: <FileText size={20} /> },
  { id: 'treasury', label: 'TRÉSOR', icon: <Wallet size={20} /> },
  { id: 'settings', label: 'CONFIG', icon: <Cog size={20} /> },
  { id: 'urssaf', label: 'MENACE', icon: <Calculator size={20} /> },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="fixed left-0 top-0 bottom-0 w-20 bg-void-dark/80 backdrop-blur-xl border-r border-glass-border z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-glass-border">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 180 }}
          transition={{ duration: 0.5 }}
          className="w-10 h-10 rounded-full border-2 border-neon-cyan flex items-center justify-center"
          style={{
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
          }}
        >
          <Zap size={20} className="text-neon-cyan" />
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <motion.button
                onClick={() => onTabChange(item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  w-full py-4 flex flex-col items-center gap-1.5 cursor-pointer
                  transition-all duration-200 relative group
                  ${activeTab === item.id
                    ? 'text-neon-cyan'
                    : 'text-white/40 hover:text-white/70'
                  }
                `}
              >
                {/* Active indicator */}
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-cyan rounded-r"
                    style={{
                      boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                    }}
                  />
                )}
                
                {item.icon}
                <span className="text-[9px] font-mono tracking-widest">
                  {item.label}
                </span>
              </motion.button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom actions */}
      <div className="py-4 border-t border-glass-border">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 flex flex-col items-center gap-1 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
        >
          <Settings size={18} />
          <span className="text-[8px] font-mono tracking-widest">CONFIG</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 flex flex-col items-center gap-1 text-white/30 hover:text-neon-orange transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span className="text-[8px] font-mono tracking-widest">SORTIE</span>
        </motion.button>
      </div>
    </motion.aside>
  );
}
