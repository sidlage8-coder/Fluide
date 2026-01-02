import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Plus, Trash2, GripVertical, Copy, ChevronDown,
  Palette, FileText, User, Calendar, Package, Calculator,
  Sparkles, Eye, EyeOff, Save, X, Settings2
} from 'lucide-react';
import { GlassPanel } from '../ui';
import { 
  ThemeConfigurator, 
  DEFAULT_THEME,
  type InvoiceTheme 
} from './InvoiceThemeSystem';
import { InvoicePreview, SAMPLE_INVOICE_DATA } from './InvoicePreviewTemplates';
import { clientsApi } from '../../lib/api';
import type { Client } from '../../lib/api';

// ============================================
// TYPES
// ============================================

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  discountType: 'percent' | 'fixed';
}

interface InvoiceFormData {
  clientId: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  items: LineItem[];
  globalDiscount: number;
  globalDiscountType: 'percent' | 'fixed';
}

interface ModularInvoiceEditorProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Partial<InvoiceFormData>;
}

// ============================================
// GLASS MODULE COMPONENT
// ============================================

interface GlassModuleProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  accentColor?: string;
  className?: string;
}

function GlassModule({ 
  title, 
  icon, 
  children, 
  collapsible = true, 
  defaultOpen = true,
  accentColor = '#3b82f6',
  className = ''
}: GlassModuleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${className}`}
    >
      <GlassPanel className="overflow-hidden" glow variant="highlight">
        {/* Accent line */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
        />

        {/* Header */}
        <motion.button
          onClick={() => collapsible && setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between p-4 
            ${collapsible ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'}
            transition-colors
          `}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <span style={{ color: accentColor }}>{icon}</span>
            </div>
            <h3 className="font-mono font-bold text-white tracking-wide">{title}</h3>
          </div>
          
          {collapsible && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} className="text-white/40" />
            </motion.div>
          )}
        </motion.button>

        {/* Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 pt-0 border-t border-glass-border">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassPanel>
    </motion.div>
  );
}

// ============================================
// LINE ITEM COMPONENT
// ============================================

interface LineItemRowProps {
  item: LineItem;
  onChange: (item: LineItem) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function LineItemRow({ item, onChange, onDelete, onDuplicate }: LineItemRowProps) {
  const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountType === 'percent' ? item.discount / 100 : 0)) - (item.discountType === 'fixed' ? item.discount : 0);

  return (
    <Reorder.Item
      value={item}
      className="group"
    >
      <motion.div
        layout
        className="relative bg-glass-secondary rounded-xl p-4 border border-glass-border hover:border-neon-cyan/30 transition-colors"
      >
        {/* Drag handle */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical size={16} className="text-white/30" />
        </div>

        <div className="pl-6 space-y-3">
          {/* Description */}
          <input
            type="text"
            value={item.description}
            onChange={(e) => onChange({ ...item, description: e.target.value })}
            placeholder="Description de la prestation..."
            className="w-full bg-transparent border-none text-white placeholder-white/30 focus:outline-none text-sm"
          />

          {/* Quantity, Unit, Price row */}
          <div className="grid grid-cols-12 gap-3 items-center">
            {/* Quantity */}
            <div className="col-span-2">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Qté</label>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => onChange({ ...item, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full bg-void-dark border border-glass-border rounded-lg px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                min="0"
                step="0.5"
              />
            </div>

            {/* Unit */}
            <div className="col-span-2">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Unité</label>
              <select
                value={item.unit}
                onChange={(e) => onChange({ ...item, unit: e.target.value })}
                className="w-full bg-void-dark border border-glass-border rounded-lg px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none cursor-pointer"
              >
                <option value="unit">Unité</option>
                <option value="hour">Heure</option>
                <option value="day">Jour</option>
                <option value="fixed">Forfait</option>
                <option value="word">Mot</option>
                <option value="page">Page</option>
              </select>
            </div>

            {/* Unit Price */}
            <div className="col-span-3">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Prix unitaire</label>
              <div className="relative">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => onChange({ ...item, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-void-dark border border-glass-border rounded-lg px-3 py-2 pr-8 text-white text-sm focus:border-neon-cyan/50 outline-none"
                  min="0"
                  step="0.01"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">€</span>
              </div>
            </div>

            {/* Discount */}
            <div className="col-span-3">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Remise</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={item.discount}
                  onChange={(e) => onChange({ ...item, discount: parseFloat(e.target.value) || 0 })}
                  className="flex-1 bg-void-dark border border-glass-border rounded-lg px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                  min="0"
                />
                <select
                  value={item.discountType}
                  onChange={(e) => onChange({ ...item, discountType: e.target.value as 'percent' | 'fixed' })}
                  className="bg-void-dark border border-glass-border rounded-lg px-2 text-white text-sm cursor-pointer"
                >
                  <option value="percent">%</option>
                  <option value="fixed">€</option>
                </select>
              </div>
            </div>

            {/* Line Total */}
            <div className="col-span-2 text-right">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">Total</label>
              <p className="text-lg font-mono font-bold text-neon-cyan py-1">
                {lineTotal.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDuplicate}
            className="p-1.5 rounded-lg hover:bg-neon-cyan/20 text-white/40 hover:text-neon-cyan transition-colors cursor-pointer"
          >
            <Copy size={14} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

// ============================================
// MAIN EDITOR COMPONENT
// ============================================

export function ModularInvoiceEditor({ onClose, onSubmit, initialData }: ModularInvoiceEditorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showThemePanel, setShowThemePanel] = useState(false);
  
  const [theme, setTheme] = useState<InvoiceTheme>(DEFAULT_THEME);
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    items: [
      { id: '1', description: '', quantity: 1, unit: 'unit', unitPrice: 0, discount: 0, discountType: 'percent' }
    ],
    globalDiscount: 0,
    globalDiscountType: 'percent',
    ...initialData,
  });

  useEffect(() => {
    clientsApi.list().then(setClients).catch(console.error);
  }, []);

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unit: 'unit',
        unitPrice: 0,
        discount: 0,
        discountType: 'percent',
      }],
    }));
  };

  const updateItem = (id: string, item: LineItem) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? item : i),
    }));
  };

  const deleteItem = (id: string) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
    }));
  };

  const duplicateItem = (id: string) => {
    const item = formData.items.find(i => i.id === id);
    if (!item) return;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...item, id: Date.now().toString() }],
    }));
  };

  const reorderItems = (newOrder: LineItem[]) => {
    setFormData(prev => ({ ...prev, items: newOrder }));
  };

  // Calculate totals
  const subtotal = formData.items.reduce((sum, item) => {
    const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountType === 'percent' ? item.discount / 100 : 0)) - (item.discountType === 'fixed' ? item.discount : 0);
    return sum + lineTotal;
  }, 0);

  const globalDiscountAmount = formData.globalDiscountType === 'percent' 
    ? subtotal * (formData.globalDiscount / 100)
    : formData.globalDiscount;

  const subtotalAfterDiscount = subtotal - globalDiscountAmount;
  const tax = subtotalAfterDiscount * 0.2;
  const total = subtotalAfterDiscount + tax;

  const selectedClient = clients.find(c => c.id === formData.clientId);

  // Preview data
  const previewData = {
    ...SAMPLE_INVOICE_DATA,
    clientName: selectedClient?.name || 'Client',
    clientAddress: selectedClient ? `${selectedClient.address || ''}, ${selectedClient.postalCode || ''} ${selectedClient.city || ''}` : '',
    issueDate: new Date(formData.issueDate).toLocaleDateString('fr-FR'),
    dueDate: new Date(formData.dueDate).toLocaleDateString('fr-FR'),
    items: formData.items.filter(i => i.description).map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    })),
    subtotal: subtotalAfterDiscount,
    tax,
    total,
  };

  const handleSubmit = async () => {
    if (!formData.clientId) {
      alert('Veuillez sélectionner un client');
      return;
    }
    if (formData.items.every(i => !i.description)) {
      alert('Veuillez ajouter au moins une ligne');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        clientId: formData.clientId,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        notes: formData.notes,
        items: formData.items.filter(i => i.description).map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          discount: item.discount,
          discountType: item.discountType,
        })),
        globalDiscount: formData.globalDiscount,
        globalDiscountType: formData.globalDiscountType,
        theme,
      });
      onClose();
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-void-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Main Editor */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="relative z-10 flex-1 max-w-3xl h-full overflow-y-auto p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-mono font-bold text-white flex items-center gap-3">
            <FileText className="text-neon-cyan" />
            Nouvelle Facture
          </h1>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowThemePanel(!showThemePanel)}
              className={`p-3 rounded-xl border transition-colors cursor-pointer ${showThemePanel ? 'bg-neon-magenta/20 border-neon-magenta text-neon-magenta' : 'bg-glass-secondary border-glass-border text-white/60 hover:text-white'}`}
            >
              <Palette size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPreview(!showPreview)}
              className={`p-3 rounded-xl border transition-colors cursor-pointer ${showPreview ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'bg-glass-secondary border-glass-border text-white/60 hover:text-white'}`}
            >
              {showPreview ? <Eye size={20} /> : <EyeOff size={20} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-3 rounded-xl bg-glass-secondary border border-glass-border text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </motion.button>
          </div>
        </div>

        {/* Client Module */}
        <GlassModule 
          title="Client" 
          icon={<User size={20} />}
          accentColor="#8b5cf6"
          collapsible={false}
        >
          <select
            value={formData.clientId}
            onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
            className="w-full bg-void-dark border border-glass-border rounded-xl px-4 py-3 text-white focus:border-neon-cyan/50 outline-none cursor-pointer"
          >
            <option value="">Sélectionner un client...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </GlassModule>

        {/* Dates Module */}
        <GlassModule 
          title="Dates" 
          icon={<Calendar size={20} />}
          accentColor="#f59e0b"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Date d'émission</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                className="w-full bg-void-dark border border-glass-border rounded-xl px-4 py-3 text-white focus:border-neon-cyan/50 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Date d'échéance</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full bg-void-dark border border-glass-border rounded-xl px-4 py-3 text-white focus:border-neon-cyan/50 outline-none"
              />
            </div>
          </div>
        </GlassModule>

        {/* Line Items Module */}
        <GlassModule 
          title="Prestations" 
          icon={<Package size={20} />}
          accentColor="#10b981"
          defaultOpen={true}
        >
          <Reorder.Group 
            axis="y" 
            values={formData.items} 
            onReorder={reorderItems}
            className="space-y-3"
          >
            {formData.items.map((item) => (
              <LineItemRow
                key={item.id}
                item={item}
                onChange={(updated) => updateItem(item.id, updated)}
                onDelete={() => deleteItem(item.id)}
                onDuplicate={() => duplicateItem(item.id)}
              />
            ))}
          </Reorder.Group>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addItem}
            className="w-full mt-4 p-3 rounded-xl border-2 border-dashed border-glass-border hover:border-neon-cyan/50 text-white/40 hover:text-neon-cyan flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Ajouter une ligne
          </motion.button>
        </GlassModule>

        {/* Totals Module */}
        <GlassModule 
          title="Récapitulatif" 
          icon={<Calculator size={20} />}
          accentColor="#3b82f6"
          collapsible={false}
        >
          <div className="space-y-3">
            {/* Global discount */}
            <div className="flex items-center gap-4 pb-3 border-b border-glass-border">
              <span className="text-sm text-white/60">Remise globale</span>
              <div className="flex gap-2 ml-auto">
                <input
                  type="number"
                  value={formData.globalDiscount}
                  onChange={(e) => setFormData(prev => ({ ...prev, globalDiscount: parseFloat(e.target.value) || 0 }))}
                  className="w-24 bg-void-dark border border-glass-border rounded-lg px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                  min="0"
                />
                <select
                  value={formData.globalDiscountType}
                  onChange={(e) => setFormData(prev => ({ ...prev, globalDiscountType: e.target.value as 'percent' | 'fixed' }))}
                  className="bg-void-dark border border-glass-border rounded-lg px-3 py-2 text-white text-sm cursor-pointer"
                >
                  <option value="percent">%</option>
                  <option value="fixed">€</option>
                </select>
              </div>
            </div>

            {/* Subtotal */}
            <div className="flex justify-between text-white/60">
              <span>Sous-total HT</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>

            {globalDiscountAmount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Remise</span>
                <span>-{globalDiscountAmount.toFixed(2)} €</span>
              </div>
            )}

            <div className="flex justify-between text-white/60">
              <span>TVA (20%)</span>
              <span>{tax.toFixed(2)} €</span>
            </div>

            {/* Total */}
            <div className="flex justify-between pt-3 border-t border-glass-border">
              <span className="text-lg font-bold text-white">Total TTC</span>
              <span className="text-2xl font-mono font-bold text-neon-cyan">{total.toFixed(2)} €</span>
            </div>
          </div>
        </GlassModule>

        {/* Notes Module */}
        <GlassModule 
          title="Notes" 
          icon={<FileText size={20} />}
          accentColor="#64748b"
          defaultOpen={false}
        >
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes ou conditions particulières..."
            className="w-full h-24 bg-void-dark border border-glass-border rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-neon-cyan/50 outline-none resize-none"
          />
        </GlassModule>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-500 text-void-black font-mono font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)' }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Settings2 size={24} />
            </motion.div>
          ) : (
            <>
              <Save size={24} />
              Créer la facture
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Preview Panel */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="relative z-10 w-[500px] h-full bg-void-gray/50 backdrop-blur-xl border-l border-glass-border overflow-y-auto p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Eye size={16} className="text-neon-cyan" />
              <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Aperçu en temps réel</span>
            </div>
            
            <div className="overflow-hidden rounded-xl">
              <InvoicePreview theme={theme} data={previewData} scale={0.5} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Panel */}
      <AnimatePresence>
        {showThemePanel && (
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="relative z-10 w-[400px] h-full bg-void-gray/50 backdrop-blur-xl border-l border-glass-border overflow-y-auto p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-neon-magenta" />
              <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Personnalisation du thème</span>
            </div>
            
            <ThemeConfigurator theme={theme} onChange={setTheme} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
