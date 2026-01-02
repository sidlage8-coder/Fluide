import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, CreditCard, Banknote, Building2, FileText } from 'lucide-react';
import { Button } from '../ui';

interface PaymentFormProps {
  invoiceId: string;
  invoiceNumber: string;
  balanceDue: number;
  onClose: () => void;
  onSubmit: (data: { amount: number; method: string; reference?: string; notes?: string; paymentDate?: string }) => Promise<void>;
}

const methodOptions = [
  { value: 'bank_transfer', label: 'Virement bancaire', icon: Building2 },
  { value: 'card', label: 'Carte bancaire', icon: CreditCard },
  { value: 'cash', label: 'Espèces', icon: Banknote },
  { value: 'check', label: 'Chèque', icon: FileText },
  { value: 'other', label: 'Autre', icon: FileText },
];

export function PaymentForm({ invoiceNumber, balanceDue, onClose, onSubmit }: PaymentFormProps) {
  const [amount, setAmount] = useState(balanceDue.toFixed(2));
  const [method, setMethod] = useState('bank_transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Montant invalide');
      return;
    }

    if (numAmount > balanceDue + 0.01) {
      setError(`Le montant ne peut pas dépasser ${balanceDue.toFixed(2)} €`);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        amount: numAmount,
        method,
        reference: reference || undefined,
        notes: notes || undefined,
        paymentDate,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
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
        className="bg-void-gray border border-glass-border rounded-lg w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <div>
            <h2 className="text-lg font-mono font-bold text-white">Enregistrer un paiement</h2>
            <p className="text-sm text-white/50 mt-1">Facture #{invoiceNumber}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Reste à payer */}
          <div className="p-4 bg-neon-cyan/10 rounded-lg border border-neon-cyan/30">
            <span className="text-xs font-mono text-white/50">RESTE À PAYER</span>
            <p className="text-2xl font-mono font-bold text-neon-cyan mt-1">
              {balanceDue.toFixed(2)} €
            </p>
          </div>

          {/* Montant */}
          <div>
            <label className="block text-xs font-mono text-white/50 mb-2">Montant reçu *</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                step="0.01"
                min="0.01"
                max={balanceDue}
                className="w-full bg-void-dark border border-glass-border rounded px-4 py-3 text-white text-lg font-mono focus:border-neon-cyan/50 outline-none"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-mono">€</span>
            </div>
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="block text-xs font-mono text-white/50 mb-2">Méthode de paiement *</label>
            <div className="grid grid-cols-2 gap-2">
              {methodOptions.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMethod(opt.value)}
                    className={`flex items-center gap-2 p-3 rounded border transition-all ${
                      method === opt.value
                        ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                        : 'bg-void-dark border-glass-border text-white/60 hover:text-white/80'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-xs font-mono">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-mono text-white/50 mb-2">Date du paiement</label>
            <input
              type="date"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              className="w-full bg-void-dark border border-glass-border rounded px-4 py-3 text-white focus:border-neon-cyan/50 outline-none"
            />
          </div>

          {/* Référence */}
          <div>
            <label className="block text-xs font-mono text-white/50 mb-2">Référence transaction</label>
            <input
              type="text"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="Ex: VIR-2026-001234"
              className="w-full bg-void-dark border border-glass-border rounded px-4 py-3 text-white text-sm focus:border-neon-cyan/50 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono text-white/50 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes optionnelles..."
              rows={2}
              className="w-full bg-void-dark border border-glass-border rounded px-4 py-3 text-white text-sm focus:border-neon-cyan/50 outline-none resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
