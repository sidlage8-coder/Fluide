import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { GlassPanel, Button } from '../ui';
import { clientsApi } from '../../lib/api';
import type { Client, CreateInvoiceData, InvoiceItem } from '../../lib/api';

interface InvoiceFormProps {
  onClose: () => void;
  onSubmit: (data: CreateInvoiceData) => Promise<unknown>;
}

export function InvoiceForm({ onClose, onSubmit }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientId, setClientId] = useState('');
  const [vatRate, setVatRate] = useState(20);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);

  useEffect(() => {
    clientsApi.list().then(data => {
      setClients(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || items.some(item => !item.description || item.unitPrice <= 0)) return;

    setSaving(true);
    try {
      await onSubmit({
        clientId,
        items,
        vatRate,
        dueDate,
        description,
        notes,
      });
      onClose();
    } catch (err) {
      console.error('Erreur création facture:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-void-gray border border-glass-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <h2 className="text-xl font-mono font-bold text-white">Nouvelle Facture</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Client Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-white/50 mb-2">Client *</label>
              {loading ? (
                <div className="flex items-center gap-2 text-white/50">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                </div>
              ) : clients.length === 0 ? (
                <p className="text-sm text-amber-400">Aucun client. Créez d'abord un client.</p>
              ) : (
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                  required
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.company ? `(${client.company})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-mono text-white/50 mb-2">Échéance *</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono text-white/50 mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Développement site web"
              className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono text-white/50">Lignes de facturation *</label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors"
              >
                <Plus size={14} /> Ajouter une ligne
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-mono text-white/40 px-1">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qté</div>
                <div className="col-span-2 text-center">Prix unit.</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(index, 'description', e.target.value)}
                      placeholder="Description du service"
                      className="col-span-6 bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                      required
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0.01"
                      step="0.01"
                      className="col-span-2 bg-void-dark border border-glass-border rounded px-2 py-2 text-white text-sm text-center focus:border-neon-cyan/50 outline-none"
                      required
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="col-span-2 bg-void-dark border border-glass-border rounded px-2 py-2 text-white text-sm text-center focus:border-neon-cyan/50 outline-none"
                      required
                    />
                    <div className="col-span-1 text-right font-mono text-sm text-white/70">
                      {(item.quantity * item.unitPrice).toFixed(2)}€
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="col-span-1 p-2 text-white/30 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Totals */}
          <GlassPanel className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Sous-total HT</span>
                <span className="font-mono text-white">{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white/50">TVA</span>
                  <select
                    value={vatRate}
                    onChange={e => setVatRate(parseFloat(e.target.value))}
                    className="bg-void-dark border border-glass-border rounded px-2 py-1 text-white text-xs focus:border-neon-cyan/50 outline-none"
                  >
                    <option value="0">0%</option>
                    <option value="5.5">5.5%</option>
                    <option value="10">10%</option>
                    <option value="20">20%</option>
                  </select>
                </div>
                <span className="font-mono text-white">{vatAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t border-glass-border">
                <span className="font-bold text-white">Total TTC</span>
                <span className="font-mono font-bold text-neon-cyan">{total.toFixed(2)} €</span>
              </div>
            </div>
          </GlassPanel>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono text-white/50 mb-2">Notes (optionnel)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Conditions de paiement, remarques..."
              rows={3}
              className="w-full bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-glass-border">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={saving || !clientId || clients.length === 0}
            onClick={handleSubmit}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer la facture'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
