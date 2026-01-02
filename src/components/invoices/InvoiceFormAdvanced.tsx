import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  X, Plus, Trash2, Loader2, Copy, GripVertical, Package, 
  Calendar, Percent, FileText, Eye, Edit3, ChevronDown, Clock
} from 'lucide-react';
import { GlassPanel, Button } from '../ui';
import { clientsApi } from '../../lib/api';
import type { Client, CreateInvoiceData } from '../../lib/api';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: 'hours' | 'days' | 'units' | 'fixed';
  unitPrice: number;
  discount: number;
  discountType: 'percent' | 'fixed';
}

interface InvoiceFormAdvancedProps {
  onClose: () => void;
  onSubmit: (data: CreateInvoiceData) => Promise<unknown>;
  initialData?: Partial<CreateInvoiceData>;
  mode?: 'create' | 'edit';
}

const UNIT_LABELS: Record<LineItem['unit'], string> = {
  hours: 'Heures',
  days: 'Jours',
  units: 'Unités',
  fixed: 'Forfait',
};

const UNIT_ABBREVIATIONS: Record<LineItem['unit'], string> = {
  hours: 'h',
  days: 'j',
  units: 'u',
  fixed: 'forfait',
};

const PAYMENT_TERMS = [
  { days: 0, label: 'Paiement immédiat' },
  { days: 15, label: 'Net 15 jours' },
  { days: 30, label: 'Net 30 jours' },
  { days: 45, label: 'Net 45 jours' },
  { days: 60, label: 'Net 60 jours' },
];

const PRESET_SERVICES = [
  { description: 'Développement web - Frontend', unitPrice: 450, unit: 'days' as const },
  { description: 'Développement web - Backend', unitPrice: 500, unit: 'days' as const },
  { description: 'Design UI/UX', unitPrice: 400, unit: 'days' as const },
  { description: 'Consultation technique', unitPrice: 120, unit: 'hours' as const },
  { description: 'Formation', unitPrice: 800, unit: 'days' as const },
  { description: 'Maintenance mensuelle', unitPrice: 500, unit: 'fixed' as const },
  { description: 'Hébergement annuel', unitPrice: 200, unit: 'fixed' as const },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

export function InvoiceFormAdvanced({ onClose, onSubmit, initialData, mode = 'create' }: InvoiceFormAdvancedProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showPresets, setShowPresets] = useState(false);
  
  // Form state
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentTermDays, setPaymentTermDays] = useState(30);
  const [vatRate, setVatRate] = useState(20);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentConditions, setPaymentConditions] = useState('Paiement par virement bancaire.');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [globalDiscountType, setGlobalDiscountType] = useState<'percent' | 'fixed'>('percent');
  
  const [items, setItems] = useState<LineItem[]>([
    { id: generateId(), description: '', quantity: 1, unit: 'units', unitPrice: 0, discount: 0, discountType: 'percent' }
  ]);

  // Calculate due date from issue date and payment terms
  const dueDate = (() => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + paymentTermDays);
    return date.toISOString().split('T')[0];
  })();

  // Load clients
  useEffect(() => {
    clientsApi.list().then(data => {
      setClients(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Get selected client
  const selectedClient = clients.find(c => c.id === clientId);

  // Line item operations
  const addItem = useCallback(() => {
    setItems(prev => [...prev, { 
      id: generateId(), 
      description: '', 
      quantity: 1, 
      unit: 'units', 
      unitPrice: 0, 
      discount: 0, 
      discountType: 'percent' 
    }]);
  }, []);

  const addPreset = useCallback((preset: typeof PRESET_SERVICES[0]) => {
    setItems(prev => [...prev, {
      id: generateId(),
      description: preset.description,
      quantity: 1,
      unit: preset.unit,
      unitPrice: preset.unitPrice,
      discount: 0,
      discountType: 'percent',
    }]);
    setShowPresets(false);
  }, []);

  const duplicateItem = useCallback((index: number) => {
    const item = items[index];
    const newItem = { ...item, id: generateId() };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    setItems(newItems);
  }, [items]);

  const removeItem = useCallback((id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  }, [items.length]);

  const updateItem = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  }, []);

  // Calculations
  const calculateLineTotal = (item: LineItem) => {
    const base = item.quantity * item.unitPrice;
    if (item.discount === 0) return base;
    if (item.discountType === 'percent') {
      return base * (1 - item.discount / 100);
    }
    return Math.max(0, base - item.discount);
  };

  const subtotalBeforeDiscount = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  
  const globalDiscountAmount = globalDiscountType === 'percent' 
    ? subtotalBeforeDiscount * (globalDiscount / 100)
    : globalDiscount;
  
  const subtotal = subtotalBeforeDiscount - globalDiscountAmount;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  // Submit handler
  const handleSubmit = async () => {
    if (!clientId || items.some(item => !item.description || item.unitPrice <= 0)) return;

    setSaving(true);
    try {
      await onSubmit({
        clientId,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: calculateLineTotal(item) / item.quantity, // Apply line discount to unit price
        })),
        vatRate,
        dueDate,
        description: title || description,
        notes: `${notes}\n\n${paymentConditions}`.trim(),
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
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-void-gray border border-glass-border rounded-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-glass-border bg-void-dark/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
              <FileText size={20} className="text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold text-white">
                {mode === 'create' ? 'Nouvelle Facture' : 'Modifier Facture'}
              </h2>
              <p className="text-xs text-white/50">
                {items.length} ligne{items.length > 1 ? 's' : ''} • Total: {total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € TTC
              </p>
            </div>
          </div>
          
          {/* Tab Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-void-dark rounded-lg p-1">
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-mono transition-all ${
                  activeTab === 'edit' 
                    ? 'bg-neon-cyan/20 text-neon-cyan' 
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <Edit3 size={14} /> Édition
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-mono transition-all ${
                  activeTab === 'preview' 
                    ? 'bg-neon-cyan/20 text-neon-cyan' 
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <Eye size={14} /> Aperçu
              </button>
            </div>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'edit' ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full overflow-y-auto p-6 space-y-6"
              >
                {/* Client & Dates Row */}
                <div className="grid grid-cols-4 gap-4">
                  {/* Client */}
                  <div className="col-span-2">
                    <label className="block text-xs font-mono text-white/50 mb-2">Client *</label>
                    {loading ? (
                      <div className="flex items-center gap-2 text-white/50 h-10">
                        <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                      </div>
                    ) : clients.length === 0 ? (
                      <p className="text-sm text-amber-400">Aucun client. Créez d'abord un client.</p>
                    ) : (
                      <select
                        value={clientId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClientId(e.target.value)}
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none transition-colors"
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
                    {selectedClient && (
                      <p className="text-xs text-white/40 mt-1">
                        {selectedClient.email} {selectedClient.address && `• ${selectedClient.address}`}
                      </p>
                    )}
                  </div>

                  {/* Issue Date */}
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">
                      <Calendar size={12} className="inline mr-1" /> Date d'émission
                    </label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIssueDate(e.target.value)}
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none transition-colors"
                    />
                  </div>

                  {/* Payment Terms */}
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">
                      <Clock size={12} className="inline mr-1" /> Conditions de paiement
                    </label>
                    <select
                      value={paymentTermDays}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentTermDays(parseInt(e.target.value))}
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none transition-colors"
                    >
                      {PAYMENT_TERMS.map(term => (
                        <option key={term.days} value={term.days}>{term.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-white/40 mt-1">Échéance: {new Date(dueDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">Titre / Objet</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                      placeholder="Ex: Développement application mobile"
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">Référence projet</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                      placeholder="Ex: PROJ-2024-001"
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-mono text-white/70 font-medium">Lignes de facturation</label>
                    <div className="flex items-center gap-2">
                      {/* Presets dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowPresets(!showPresets)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 text-xs font-mono hover:bg-purple-500/30 transition-colors"
                        >
                          <Package size={14} /> Prestations <ChevronDown size={12} />
                        </button>
                        <AnimatePresence>
                          {showPresets && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute right-0 mt-1 w-72 bg-void-dark border border-glass-border rounded-lg shadow-xl z-10 overflow-hidden"
                            >
                              {PRESET_SERVICES.map((preset, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => addPreset(preset)}
                                  className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-glass-secondary transition-colors"
                                >
                                  <span className="text-sm text-white">{preset.description}</span>
                                  <span className="text-xs text-white/50">
                                    {preset.unitPrice}€/{UNIT_ABBREVIATIONS[preset.unit]}
                                  </span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-cyan/20 text-neon-cyan text-xs font-mono hover:bg-neon-cyan/30 transition-colors"
                      >
                        <Plus size={14} /> Ajouter ligne
                      </button>
                    </div>
                  </div>
                  
                  {/* Table Header */}
                  <div className="grid grid-cols-24 gap-2 text-xs font-mono text-white/40 px-2 py-2 bg-void-dark/50 rounded-t-lg border border-glass-border border-b-0">
                    <div className="col-span-1"></div>
                    <div className="col-span-8">Description</div>
                    <div className="col-span-2 text-center">Qté</div>
                    <div className="col-span-3 text-center">Unité</div>
                    <div className="col-span-3 text-center">Prix unit.</div>
                    <div className="col-span-3 text-center">Remise</div>
                    <div className="col-span-2 text-right">Total HT</div>
                    <div className="col-span-2 text-center">Actions</div>
                  </div>

                  {/* Items - Reorderable */}
                  <Reorder.Group 
                    axis="y" 
                    values={items} 
                    onReorder={setItems}
                    className="border border-glass-border border-t-0 rounded-b-lg overflow-hidden"
                  >
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <Reorder.Item
                          key={item.id}
                          value={item}
                          className="grid grid-cols-24 gap-2 items-center p-2 bg-void-gray hover:bg-glass-secondary/30 border-b border-glass-border last:border-b-0 cursor-grab active:cursor-grabbing"
                        >
                          <div className="col-span-1 flex justify-center text-white/30">
                            <GripVertical size={16} />
                          </div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Description du service ou produit"
                            className="col-span-8 bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                            required
                          />
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0.01"
                            step="0.01"
                            className="col-span-2 bg-void-dark border border-glass-border rounded px-2 py-2 text-white text-sm text-center focus:border-neon-cyan/50 outline-none"
                            required
                          />
                          <select
                            value={item.unit}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateItem(item.id, 'unit', e.target.value)}
                            className="col-span-3 bg-void-dark border border-glass-border rounded px-2 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                          >
                            {Object.entries(UNIT_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                          <div className="col-span-3 flex items-center">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full bg-void-dark border border-glass-border rounded px-2 py-2 text-white text-sm text-center focus:border-neon-cyan/50 outline-none"
                              required
                            />
                          </div>
                          <div className="col-span-3 flex items-center gap-1">
                            <input
                              type="number"
                              value={item.discount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full bg-void-dark border border-glass-border rounded-l px-2 py-2 text-white text-sm text-center focus:border-neon-cyan/50 outline-none"
                            />
                            <select
                              value={item.discountType}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateItem(item.id, 'discountType', e.target.value)}
                              className="bg-void-dark border border-glass-border border-l-0 rounded-r px-1 py-2 text-white text-xs focus:border-neon-cyan/50 outline-none"
                            >
                              <option value="percent">%</option>
                              <option value="fixed">€</option>
                            </select>
                          </div>
                          <div className="col-span-2 text-right font-mono text-sm text-white">
                            {calculateLineTotal(item).toFixed(2)}€
                          </div>
                          <div className="col-span-2 flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => duplicateItem(index)}
                              className="p-1.5 text-white/30 hover:text-neon-cyan transition-colors rounded hover:bg-glass-secondary"
                              title="Dupliquer"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              disabled={items.length === 1}
                              className="p-1.5 text-white/30 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded hover:bg-glass-secondary"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                </div>

                {/* Totals & Options */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Notes & Conditions */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">Notes internes (non imprimées)</label>
                      <textarea
                        value={notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                        placeholder="Notes pour vous..."
                        rows={2}
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white text-sm focus:border-neon-cyan/50 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">Conditions de paiement (sur la facture)</label>
                      <textarea
                        value={paymentConditions}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPaymentConditions(e.target.value)}
                        placeholder="Conditions, mentions légales..."
                        rows={2}
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white text-sm focus:border-neon-cyan/50 outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Totals Panel */}
                  <GlassPanel className="p-4 space-y-3">
                    {/* Global Discount */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent size={14} className="text-white/50" />
                        <span className="text-sm text-white/70">Remise globale</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={globalDiscount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          className="w-20 bg-void-dark border border-glass-border rounded px-2 py-1 text-white text-sm text-center focus:border-neon-cyan/50 outline-none"
                        />
                        <select
                          value={globalDiscountType}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGlobalDiscountType(e.target.value as 'percent' | 'fixed')}
                          className="bg-void-dark border border-glass-border rounded px-2 py-1 text-white text-sm focus:border-neon-cyan/50 outline-none"
                        >
                          <option value="percent">%</option>
                          <option value="fixed">€</option>
                        </select>
                      </div>
                    </div>

                    <div className="border-t border-glass-border pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Sous-total lignes</span>
                        <span className="font-mono text-white">{subtotalBeforeDiscount.toFixed(2)} €</span>
                      </div>
                      {globalDiscountAmount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-400">
                          <span>Remise globale</span>
                          <span className="font-mono">-{globalDiscountAmount.toFixed(2)} €</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50">Sous-total HT</span>
                        <span className="font-mono text-white">{subtotal.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">TVA</span>
                          <select
                            value={vatRate}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVatRate(parseFloat(e.target.value))}
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
                      <div className="flex justify-between text-xl pt-3 border-t border-glass-border">
                        <span className="font-bold text-white">Total TTC</span>
                        <span className="font-mono font-bold text-neon-cyan">{total.toFixed(2)} €</span>
                      </div>
                    </div>
                  </GlassPanel>
                </div>
              </motion.div>
            ) : (
              /* Preview Tab */
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full overflow-y-auto p-6"
              >
                <div className="max-w-2xl mx-auto bg-white text-gray-900 rounded-lg shadow-lg p-8">
                  {/* Invoice Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">FACTURE</h1>
                      <p className="text-gray-500 mt-1">{title || 'Facture'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Date d'émission</p>
                      <p className="font-medium">{new Date(issueDate).toLocaleDateString('fr-FR')}</p>
                      <p className="text-sm text-gray-500 mt-2">Date d'échéance</p>
                      <p className="font-medium">{new Date(dueDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  {/* Client */}
                  {selectedClient && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Facturé à</p>
                      <p className="font-medium">{selectedClient.name}</p>
                      {selectedClient.company && <p className="text-gray-600">{selectedClient.company}</p>}
                      {selectedClient.address && <p className="text-gray-600">{selectedClient.address}</p>}
                      {selectedClient.email && <p className="text-gray-600">{selectedClient.email}</p>}
                    </div>
                  )}

                  {/* Items Table */}
                  <table className="w-full mb-6">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 text-sm text-gray-500">Description</th>
                        <th className="text-center py-2 text-sm text-gray-500">Qté</th>
                        <th className="text-right py-2 text-sm text-gray-500">Prix unit.</th>
                        <th className="text-right py-2 text-sm text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.filter(item => item.description).map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3">{item.description}</td>
                          <td className="py-3 text-center">{item.quantity} {UNIT_ABBREVIATIONS[item.unit]}</td>
                          <td className="py-3 text-right">{item.unitPrice.toFixed(2)} €</td>
                          <td className="py-3 text-right font-medium">{calculateLineTotal(item).toFixed(2)} €</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sous-total HT</span>
                        <span>{subtotal.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">TVA ({vatRate}%)</span>
                        <span>{vatAmount.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                        <span>Total TTC</span>
                        <span>{total.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>

                  {/* Conditions */}
                  {paymentConditions && (
                    <div className="mt-8 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">{paymentConditions}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-glass-border bg-void-dark/50">
          <p className="text-xs text-white/40">
            {items.filter(i => i.description).length} prestation{items.filter(i => i.description).length > 1 ? 's' : ''}
            {globalDiscountAmount > 0 && ` • Remise: ${globalDiscountAmount.toFixed(2)}€`}
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={saving || !clientId || clients.length === 0 || items.every(i => !i.description)}
              onClick={handleSubmit}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'create' ? 'Créer la facture' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
