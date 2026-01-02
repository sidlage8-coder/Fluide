import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, CreditCard, Receipt, AlertTriangle } from 'lucide-react';
import { CoreStability, KPICard } from '../components/dashboard';
import { GlassPanel } from '../components/ui';

// Mock data - sera remplacé par Supabase
const mockData = {
  treasury: 12450,
  health: 75,
  monthlyRevenue: 8500,
  pendingInvoices: 3200,
  expenses: 2100,
  urssafDue: 1850,
};

const recentActivity = [
  { id: 1, type: 'income', label: 'Facture #2024-042 payée', amount: 2500, client: 'Studio Nexus', time: '2h' },
  { id: 2, type: 'expense', label: 'Abonnement Adobe', amount: -59.99, client: 'Adobe Inc.', time: '1j' },
  { id: 3, type: 'income', label: 'Facture #2024-041 payée', amount: 1800, client: 'TechCorp', time: '3j' },
  { id: 4, type: 'warning', label: 'Facture #2024-038 en retard', amount: 3200, client: 'MediaFlow', time: '7j' },
];

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Top KPIs Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-4 gap-4"
      >
        <KPICard
          label="CA Mensuel"
          value={mockData.monthlyRevenue}
          suffix=" €"
          icon={<TrendingUp size={16} />}
          trend={12}
          color="cyan"
        />
        <KPICard
          label="En Attente"
          value={mockData.pendingInvoices}
          suffix=" €"
          icon={<Receipt size={16} />}
          color="magenta"
        />
        <KPICard
          label="Charges"
          value={mockData.expenses}
          suffix=" €"
          icon={<TrendingDown size={16} />}
          trend={-5}
          color="orange"
        />
        <KPICard
          label="URSSAF Estimé"
          value={mockData.urssafDue}
          suffix=" €"
          icon={<CreditCard size={16} />}
          color="magenta"
        />
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Core Stability - Center piece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="col-span-2 flex items-center justify-center"
        >
          <GlassPanel className="p-8 w-full flex items-center justify-center" glow variant="highlight">
            <CoreStability
              health={mockData.health}
              value={mockData.treasury}
            />
          </GlassPanel>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassPanel className="p-4 h-full">
            <h3 className="text-xs font-mono tracking-widest text-white/50 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
              FLUX D'ACTIVITÉ
            </h3>
            
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`
                    p-3 rounded border transition-all
                    ${activity.type === 'income'
                      ? 'bg-neon-cyan/5 border-neon-cyan/20'
                      : activity.type === 'expense'
                        ? 'bg-neon-magenta/5 border-neon-magenta/20'
                        : 'bg-neon-orange/5 border-neon-orange/20'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-white/80 flex items-center gap-2">
                        {activity.type === 'warning' && (
                          <AlertTriangle size={14} className="text-neon-orange" />
                        )}
                        {activity.label}
                      </p>
                      <p className="text-xs text-white/40 mt-1">{activity.client}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-mono font-bold ${
                        activity.type === 'income'
                          ? 'text-neon-cyan'
                          : activity.type === 'expense'
                            ? 'text-neon-magenta'
                            : 'text-neon-orange'
                      }`}>
                        {activity.amount > 0 ? '+' : ''}{activity.amount.toLocaleString('fr-FR')} €
                      </p>
                      <p className="text-xs text-white/30 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Bottom Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-3 gap-4"
      >
        <GlassPanel className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/40">FACTURES CE MOIS</span>
            <span className="text-lg font-mono font-bold text-neon-cyan">7</span>
          </div>
          <div className="mt-2 h-1 bg-void-light rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-cyan to-neon-green"
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </div>
        </GlassPanel>
        
        <GlassPanel className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/40">CLIENTS ACTIFS</span>
            <span className="text-lg font-mono font-bold text-neon-magenta">12</span>
          </div>
          <div className="mt-2 h-1 bg-void-light rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-magenta to-neon-cyan"
              initial={{ width: 0 }}
              animate={{ width: '85%' }}
              transition={{ duration: 1, delay: 0.7 }}
            />
          </div>
        </GlassPanel>
        
        <GlassPanel className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-white/40">TAUX ENCAISSEMENT</span>
            <span className="text-lg font-mono font-bold text-neon-green">94%</span>
          </div>
          <div className="mt-2 h-1 bg-void-light rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-green to-neon-cyan"
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 1, delay: 0.8 }}
            />
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
