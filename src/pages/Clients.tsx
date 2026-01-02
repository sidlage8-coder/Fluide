import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, X, Loader2, Target } from 'lucide-react';
import { GlassPanel, Button } from '../components/ui';
import { useClients } from '../hooks';
import type { Client, CreateClientData } from '../lib/api';

export function Clients() {
  const { clients, loading, error, createClient, deleteClient } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [hoveredClient, setHoveredClient] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateClientData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [saving, setSaving] = useState(false);

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return '#3b82f6';
      case 'pending': return '#8b5cf6';
      case 'inactive': return '#f59e0b';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    setSaving(true);
    try {
      await createClient(formData);
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', company: '', address: '', city: '', postalCode: '' });
    } catch (err) {
      console.error('Erreur création client:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return;
    try {
      await deleteClient(id);
      setSelectedClient(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  return (
    <div className="p-6 h-full flex gap-6">
      {/* Radar View */}
      <div className="flex-1">
        <GlassPanel className="h-full p-6 relative overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Target size={16} className="text-neon-cyan" />
            <span className="text-xs font-mono tracking-widest text-white/50">VUE RADAR</span>
          </div>

          {/* Radar SVG */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="500" height="500" viewBox="-250 -250 500 500" className="opacity-80">
              {/* Concentric circles */}
              {[200, 150, 100, 50].map((r, i) => (
                <circle
                  key={r}
                  cx="0"
                  cy="0"
                  r={r}
                  fill="none"
                  stroke="rgba(0, 240, 255, 0.1)"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? '0' : '4 4'}
                />
              ))}
              
              {/* Cross lines */}
              <line x1="-200" y1="0" x2="200" y2="0" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
              <line x1="0" y1="-200" x2="0" y2="200" stroke="rgba(0, 240, 255, 0.1)" strokeWidth="1" />
              <line x1="-141" y1="-141" x2="141" y2="141" stroke="rgba(0, 240, 255, 0.05)" strokeWidth="1" />
              <line x1="-141" y1="141" x2="141" y2="-141" stroke="rgba(0, 240, 255, 0.05)" strokeWidth="1" />

              {/* Scanning line */}
              <motion.line
                x1="0"
                y1="0"
                x2="200"
                y2="0"
                stroke="rgba(0, 240, 255, 0.3)"
                strokeWidth="2"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: 'center' }}
              />

              {/* Client blips */}
              {clients.map((client, index) => {
                const angle = client.radarAngle ?? (index * 60) % 360;
                const distance = client.radarDistance ?? 30 + (index * 15) % 70;
                const x = Math.cos((angle * Math.PI) / 180) * (distance * 2);
                const y = Math.sin((angle * Math.PI) / 180) * (distance * 2);
                const isSelected = selectedClient?.id === client.id;
                const isHovered = hoveredClient === client.id;
                const color = getStatusColor(client.status);

                return (
                  <g key={client.id}>
                    {/* Glow */}
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 20 : isHovered ? 15 : 10}
                      fill={color}
                      opacity={0.2}
                      animate={{
                        r: isSelected ? [20, 25, 20] : isHovered ? [15, 18, 15] : 10,
                        opacity: isSelected ? [0.2, 0.4, 0.2] : 0.2,
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    
                    {/* Main dot */}
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={6}
                      fill={color}
                      className="cursor-pointer"
                      style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                      whileHover={{ scale: 1.5 }}
                      onClick={() => setSelectedClient(client)}
                      onMouseEnter={() => setHoveredClient(client.id)}
                      onMouseLeave={() => setHoveredClient(null)}
                    />

                    {/* Target lock on selected */}
                    {isSelected && (
                      <motion.g
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <rect
                          x={x - 25}
                          y={y - 25}
                          width="50"
                          height="50"
                          fill="none"
                          stroke={color}
                          strokeWidth="1"
                          strokeDasharray="10 40"
                        />
                        <motion.rect
                          x={x - 25}
                          y={y - 25}
                          width="50"
                          height="50"
                          fill="none"
                          stroke={color}
                          strokeWidth="1"
                          strokeDasharray="10 40"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          style={{ transformOrigin: `${x}px ${y}px` }}
                        />
                      </motion.g>
                    )}

                    {/* Label on hover */}
                    {(isHovered || isSelected) && (
                      <motion.text
                        x={x}
                        y={y - 20}
                        textAnchor="middle"
                        fill="white"
                        fontSize="10"
                        fontFamily="JetBrains Mono"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {client.name}
                      </motion.text>
                    )}
                  </g>
                );
              })}

              {/* Center point */}
              <circle cx="0" cy="0" r="4" fill="#00f0ff" />
            </svg>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex gap-4">
            {[
              { status: 'active', label: 'Actif' },
              { status: 'pending', label: 'En attente' },
              { status: 'inactive', label: 'Inactif' },
            ].map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(item.status as Client['status']) }}
                />
                <span className="text-xs font-mono text-white/40">{item.label}</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Client Details Panel */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: selectedClient ? 350 : 0, opacity: selectedClient ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {selectedClient && (
          <GlassPanel className="h-full p-6 w-[350px]" variant="highlight" glow>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-mono font-bold text-white">{selectedClient.name}</h2>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-glass-secondary rounded border border-glass-border">
                <span className="text-xs font-mono text-white/40">REVENUS TOTAL</span>
                <p className="text-2xl font-mono font-bold text-neon-cyan mt-1">
                  {parseFloat(selectedClient.totalRevenue || '0').toLocaleString('fr-FR')} €
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-glass-secondary rounded border border-glass-border">
                  <span className="text-xs font-mono text-white/40">FACTURES</span>
                  <p className="text-lg font-mono font-bold text-white mt-1">
                    {selectedClient.invoiceCount || 0}
                  </p>
                </div>
                <div className="p-3 bg-glass-secondary rounded border border-glass-border">
                  <span className="text-xs font-mono text-white/40">STATUT</span>
                  <p
                    className="text-lg font-mono font-bold mt-1"
                    style={{ color: getStatusColor(selectedClient.status) }}
                  >
                    {selectedClient.status.toUpperCase()}
                  </p>
                </div>
              </div>

              {selectedClient.email && (
                <div className="p-3 bg-glass-secondary rounded border border-glass-border">
                  <span className="text-xs font-mono text-white/40">EMAIL</span>
                  <p className="text-sm font-mono text-white/80 mt-1">{selectedClient.email}</p>
                </div>
              )}

              {selectedClient.company && (
                <div className="p-3 bg-glass-secondary rounded border border-glass-border">
                  <span className="text-xs font-mono text-white/40">ENTREPRISE</span>
                  <p className="text-sm font-mono text-white/80 mt-1">{selectedClient.company}</p>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <Button className="w-full" variant="primary">
                  NOUVELLE FACTURE
                </Button>
                <Button 
                  className="w-full" 
                  variant="secondary"
                  onClick={() => handleDelete(selectedClient.id)}
                >
                  SUPPRIMER
                </Button>
              </div>
            </div>
          </GlassPanel>
        )}
      </motion.div>

      {/* Add Client FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-neon-cyan flex items-center justify-center cursor-pointer"
        style={{ boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}
      >
        <Plus size={24} className="text-void-black" />
      </motion.button>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-void-black/50">
          <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute top-4 right-4 p-4 bg-red-500/20 border border-red-500/50 rounded">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Create Client Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="bg-void-gray border border-glass-border rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-mono font-bold text-white">Nouveau Client</h2>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-1">Entreprise</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-1">Ville</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-1">Code Postal</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
