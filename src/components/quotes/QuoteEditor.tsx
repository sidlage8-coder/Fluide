import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Loader2, Save, Send, FileSignature } from 'lucide-react';
import { clientsApi, quotesApi } from '../../lib/api';
import type { Client, Quote, QuoteItem } from '../../lib/api';

interface QuoteEditorProps {
  quote?: Quote | null;
  onClose: () => void;
  onSave: () => void;
}

// Calcul d'une ligne avec remise
function calculateLineTotal(quantity: number, unitPrice: number, discount: number = 0): number {
  const subtotal = quantity * unitPrice;
  const discountAmount = subtotal * (discount / 100);
  return subtotal - discountAmount;
}

// Calcul des totaux
function calculateTotals(items: QuoteItem[], globalVatRate: number = 20) {
  const subtotalHT = items.reduce((sum, item) => {
    return sum + calculateLineTotal(item.quantity, item.unitPrice, item.discount || 0);
  }, 0);
  
  const vatAmount = subtotalHT * (globalVatRate / 100);
  const totalTTC = subtotalHT + vatAmount;
  
  return { subtotalHT, vatAmount, totalTTC };
}

export function QuoteEditor({ quote, onClose, onSave }: QuoteEditorProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clientId, setClientId] = useState(quote?.clientId || '');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [vatRate, setVatRate] = useState(parseFloat(quote?.vatRate || '20'));
  const [description, setDescription] = useState(quote?.description || '');
  const [notes, setNotes] = useState(quote?.notes || '');
  const [validUntil, setValidUntil] = useState(() => {
    if (quote?.validUntil) return new Date(quote.validUntil).toISOString().split('T')[0];
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });
  const [items, setItems] = useState<QuoteItem[]>(() => {
    if (quote?.items && quote.items.length > 0) {
      return quote.items.map((item: any) => ({
        description: item.description,
        quantity: parseFloat(String(item.quantity)),
        unitPrice: parseFloat(String(item.unitPrice)),
        vatRate: parseFloat(String(item.vatRate || '20')),
        discount: parseFloat(String(item.discount || '0')),
      }));
    }
    return [{ description: '', quantity: 1, unitPrice: 0, vatRate: 20, discount: 0 }];
  });

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  useEffect(() => {
    clientsApi.list().then(data => {
      setClients(data);
      if (clientId) {
        const client = data.find(c => c.id === clientId);
        setSelectedClient(client || null);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      setSelectedClient(client || null);
    }
  }, [clientId, clients]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, vatRate: 20, discount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const { subtotalHT, vatAmount, totalTTC } = calculateTotals(items, vatRate);

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    if (!clientId || items.some(item => !item.description || item.unitPrice <= 0)) return;

    setSaving(true);
    try {
      const data = {
        clientId,
        items: items.map(item => ({
          ...item,
          total: calculateLineTotal(item.quantity, item.unitPrice, item.discount || 0),
        })),
        vatRate,
        validUntil,
        description,
        notes,
        status,
      };

      if (quote?.id) {
        await quotesApi.update(quote.id, data);
      } else {
        await quotesApi.create(data);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    } finally {
      setSaving(false);
    }
  };

  // Signature handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = async () => {
    if (!quote?.id) return;
    const canvas = canvasRef.current;
    const signatureData = canvas?.toDataURL('image/png');
    
    try {
      await quotesApi.sign(quote.id, signatureData);
      onSave();
      onClose();
    } catch (err) {
      console.error('Erreur signature:', err);
    }
  };

  const today = new Date().toLocaleDateString('fr-FR', { 
    day: 'numeric', month: 'long', year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white text-gray-900 rounded-lg w-full max-w-4xl max-h-[95vh] overflow-auto shadow-2xl"
      >
        {/* Document Header - Style WYSIWYG */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">DEVIS</h1>
              <p className="text-gray-500 mt-1">
                N° {quote?.quoteNumber || 'Nouveau'}
              </p>
              <p className="text-sm text-gray-400">Date: {today}</p>
            </div>
            <div className="text-right">
              <h2 className="font-bold text-lg">ORBITAL COMMAND</h2>
              <p className="text-sm text-gray-500">Votre adresse</p>
              <p className="text-sm text-gray-500">Code postal, Ville</p>
              <p className="text-sm text-gray-500">SIRET: XXXXXXXXXXXXXX</p>
            </div>
          </div>
        </div>

        {/* Client Selection */}
        <div className="p-8 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Client</label>
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
                </div>
              ) : (
                <select
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="mt-3 p-4 bg-white rounded border border-gray-200">
                  <p className="font-semibold">{selectedClient.name}</p>
                  {selectedClient.company && <p className="text-sm text-gray-600">{selectedClient.company}</p>}
                  {selectedClient.address && <p className="text-sm text-gray-500">{selectedClient.address}</p>}
                  {selectedClient.city && <p className="text-sm text-gray-500">{selectedClient.postalCode} {selectedClient.city}</p>}
                  {selectedClient.email && <p className="text-sm text-gray-500">{selectedClient.email}</p>}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Validité</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Objet</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Description du devis"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-center py-3 text-xs font-semibold text-gray-500 uppercase w-20">Qté</th>
                <th className="text-center py-3 text-xs font-semibold text-gray-500 uppercase w-28">Prix unit.</th>
                <th className="text-center py-3 text-xs font-semibold text-gray-500 uppercase w-20">Remise %</th>
                <th className="text-right py-3 text-xs font-semibold text-gray-500 uppercase w-28">Total HT</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const lineTotal = calculateLineTotal(item.quantity, item.unitPrice, item.discount || 0);
                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => updateItem(index, 'description', e.target.value)}
                        placeholder="Description du service ou produit"
                        className="w-full border-0 bg-transparent focus:ring-0 text-gray-900"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0.01"
                        step="0.01"
                        className="w-full text-center border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={e => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full text-center border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        value={item.discount || 0}
                        onChange={e => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                        step="1"
                        className="w-full text-center border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 text-right font-mono font-semibold">
                      {lineTotal.toFixed(2)} €
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <button
            onClick={addItem}
            className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus size={16} /> Ajouter une ligne
          </button>
        </div>

        {/* Totals */}
        <div className="p-8 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total HT</span>
                <span className="font-mono">{subtotalHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <span>TVA</span>
                  <select
                    value={vatRate}
                    onChange={e => setVatRate(parseFloat(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="0">0%</option>
                    <option value="5.5">5.5%</option>
                    <option value="10">10%</option>
                    <option value="20">20%</option>
                  </select>
                </div>
                <span className="font-mono">{vatAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-2">
                <span>Total TTC</span>
                <span className="font-mono text-blue-600">{totalTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-8 border-t border-gray-200">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
            Conditions & Notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Conditions de paiement, validité, remarques..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Signature Section */}
        {showSignature && (
          <div className="p-8 border-t border-gray-200 bg-blue-50">
            <h3 className="text-lg font-semibold mb-4">Signature Client</h3>
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={clearSignature}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
              >
                Effacer
              </button>
              <button
                onClick={handleSign}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                Valider la signature
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <X size={20} className="inline mr-2" />
            Fermer
          </button>
          
          <div className="flex gap-3">
            {quote?.id && quote.status !== 'accepted' && (
              <button
                onClick={() => setShowSignature(!showSignature)}
                className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
              >
                <FileSignature size={18} />
                Signer
              </button>
            )}
            
            <button
              onClick={() => handleSave('draft')}
              disabled={saving || !clientId}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Brouillon
            </button>
            
            <button
              onClick={() => handleSave('sent')}
              disabled={saving || !clientId}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Envoyer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
