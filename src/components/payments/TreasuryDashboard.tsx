import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GlassPanel } from '../ui';
import { usePayments } from '../../hooks';

const methodLabels: Record<string, string> = {
  bank_transfer: 'Virement',
  card: 'Carte',
  cash: 'Espèces',
  check: 'Chèque',
  other: 'Autre',
};

export function TreasuryDashboard() {
  const { stats, loading, error } = usePayments();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 text-center text-red-400">
        {error || 'Erreur de chargement'}
      </div>
    );
  }

  const chartData = [
    { name: 'Facturé', value: stats.month.facture, color: '#60a5fa' },
    { name: 'Encaissé', value: stats.month.encaisse, color: '#34d399' },
  ];

  const tauxEncaissement = stats.month.facture > 0 
    ? ((stats.month.encaisse / stats.month.facture) * 100).toFixed(0)
    : '0';

  const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono font-bold text-white">Trésorerie</h2>
          <p className="text-sm text-white/50 mt-1">{currentMonth}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <GlassPanel className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-blue-400" />
            <span className="text-xs font-mono text-white/40">CA FACTURÉ</span>
          </div>
          <p className="text-2xl font-mono font-bold text-white">
            {stats.month.facture.toLocaleString('fr-FR')} €
          </p>
        </GlassPanel>

        <GlassPanel className="p-4" variant="highlight">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-emerald-400" />
            <span className="text-xs font-mono text-white/40">ENCAISSÉ</span>
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-400">
            {stats.month.encaisse.toLocaleString('fr-FR')} €
          </p>
        </GlassPanel>

        <GlassPanel className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-400" />
            <span className="text-xs font-mono text-white/40">EN ATTENTE</span>
          </div>
          <p className="text-2xl font-mono font-bold text-amber-400">
            {stats.enAttente.toLocaleString('fr-FR')} €
          </p>
        </GlassPanel>

        <GlassPanel className="p-4" variant={stats.overdue.count > 0 ? 'danger' : undefined}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className={stats.overdue.count > 0 ? 'text-red-400' : 'text-white/40'} />
            <span className="text-xs font-mono text-white/40">EN RETARD</span>
          </div>
          <p className={`text-2xl font-mono font-bold ${stats.overdue.count > 0 ? 'text-red-400' : 'text-white/40'}`}>
            {stats.overdue.total.toLocaleString('fr-FR')} €
          </p>
          {stats.overdue.count > 0 && (
            <p className="text-xs text-red-400/70 mt-1">{stats.overdue.count} facture(s)</p>
          )}
        </GlassPanel>
      </div>

      {/* Chart */}
      <div className="grid grid-cols-3 gap-6">
        <GlassPanel className="col-span-2 p-6">
          <h3 className="text-sm font-mono text-white/50 mb-4">CA FACTURÉ VS ENCAISSÉ</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barSize={40}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 20, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value) => [`${(value ?? 0).toLocaleString('fr-FR')} €`, '']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-glass-border flex items-center justify-between">
            <span className="text-sm text-white/50">Taux d'encaissement</span>
            <span className={`text-xl font-mono font-bold ${
              parseInt(tauxEncaissement) >= 80 ? 'text-emerald-400' : 
              parseInt(tauxEncaissement) >= 50 ? 'text-amber-400' : 'text-red-400'
            }`}>
              {tauxEncaissement}%
            </span>
          </div>
        </GlassPanel>

        {/* Recent Payments */}
        <GlassPanel className="p-6">
          <h3 className="text-sm font-mono text-white/50 mb-4">PAIEMENTS RÉCENTS</h3>
          <div className="space-y-3">
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-white/40 text-center py-4">Aucun paiement</p>
            ) : (
              stats.recentPayments.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-void-dark rounded border border-glass-border/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {payment.clientName || 'Client'}
                    </p>
                    <p className="text-xs text-white/40">
                      {methodLabels[payment.method]} • {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className="text-sm font-mono font-bold text-emerald-400 ml-3">
                    +{parseFloat(payment.amount).toLocaleString('fr-FR')} €
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
