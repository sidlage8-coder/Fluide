import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Send, FileText, Trash2, Check, Clock, AlertTriangle, Loader2, X, ArrowRight, Copy, Download } from 'lucide-react';
import { GlassPanel, Button } from '../components/ui';
import { QuoteEditorAdvanced } from '../components/quotes';
import { useQuotes } from '../hooks';
import { quotesApi } from '../lib/api';
import { downloadQuotePDF } from '../lib/quote-pdf';
import type { Quote } from '../lib/api';

const statusConfig = {
  draft: { color: 'text-white/40', bg: 'bg-white/10', icon: Clock, label: 'Brouillon' },
  sent: { color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Send, label: 'Envoyé' },
  accepted: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Check, label: 'Accepté' },
  rejected: { color: 'text-red-400', bg: 'bg-red-500/10', icon: X, label: 'Refusé' },
  expired: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle, label: 'Expiré' },
};

export function Quotes() {
  const { quotes, loading, error, deleteQuote, convertToInvoice, refetch } = useQuotes();
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [filter, setFilter] = useState<'all' | Quote['status']>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const filteredQuotes = filter === 'all' 
    ? quotes 
    : quotes.filter(q => q.status === filter);

  const totals = {
    all: quotes.reduce((sum, q) => sum + parseFloat(q.total), 0),
    accepted: quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + parseFloat(q.total), 0),
    pending: quotes.filter(q => ['draft', 'sent'].includes(q.status)).reduce((sum, q) => sum + parseFloat(q.total), 0),
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fr-FR');

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Supprimer ce devis ?')) return;
    await deleteQuote(id);
  };

  const handleConvert = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Convertir ce devis en facture ?')) return;
    try {
      await convertToInvoice(id);
      alert('Devis converti en facture avec succès !');
    } catch (err) {
      console.error('Erreur conversion:', err);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await quotesApi.duplicate(id);
      refetch();
    } catch (err) {
      console.error('Erreur duplication:', err);
    }
  };

  const handleDownloadPDF = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const quoteWithItems = await quotesApi.get(id);
      // Transform items to match PDF expected format
      const pdfData = {
        ...quoteWithItems,
        items: quoteWithItems.items?.map(item => ({
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          total: String(item.total),
        })),
      };
      downloadQuotePDF(pdfData as any);
    } catch (err) {
      console.error('Erreur PDF:', err);
    }
  };

  const handleEdit = async (quote: Quote, e: React.MouseEvent) => {
    e.stopPropagation();
    const fullQuote = await quotesApi.get(quote.id);
    setEditingQuote(fullQuote);
    setShowEditor(true);
  };

  const handleNewQuote = () => {
    setEditingQuote(null);
    setShowEditor(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <GlassPanel className="p-4">
          <span className="text-xs font-mono text-white/40">TOTAL DEVIS</span>
          <p className="text-xl font-mono font-bold text-white mt-1">
            {totals.all.toLocaleString('fr-FR')} €
          </p>
        </GlassPanel>
        <GlassPanel className="p-4" variant="highlight">
          <span className="text-xs font-mono text-white/40">ACCEPTÉS</span>
          <p className="text-xl font-mono font-bold text-emerald-400 mt-1">
            {totals.accepted.toLocaleString('fr-FR')} €
          </p>
        </GlassPanel>
        <GlassPanel className="p-4" variant="danger">
          <span className="text-xs font-mono text-white/40">EN COURS</span>
          <p className="text-xl font-mono font-bold text-amber-400 mt-1">
            {totals.pending.toLocaleString('fr-FR')} €
          </p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <span className="text-xs font-mono text-white/40">DEVIS</span>
          <p className="text-xl font-mono font-bold text-neon-cyan mt-1">
            {quotes.length}
          </p>
        </GlassPanel>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'draft', 'sent', 'accepted', 'rejected', 'expired'] as const).map((status) => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(status)}
            className={`
              px-4 py-2 rounded font-mono text-xs tracking-wider border transition-all cursor-pointer
              ${filter === status
                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                : 'bg-glass-primary border-glass-border text-white/50 hover:text-white/80'
              }
            `}
          >
            {status === 'all' ? 'TOUT' : statusConfig[status].label.toUpperCase()}
          </motion.button>
        ))}
        
        <div className="flex-1" />
        
        <Button icon={<Plus size={16} />} onClick={handleNewQuote}>
          NOUVEAU DEVIS
        </Button>
      </div>

      {/* Quote List */}
      <GlassPanel className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="text-left p-4 text-xs font-mono text-white/40 tracking-wider">N°</th>
              <th className="text-left p-4 text-xs font-mono text-white/40 tracking-wider">CLIENT</th>
              <th className="text-left p-4 text-xs font-mono text-white/40 tracking-wider">DATE</th>
              <th className="text-left p-4 text-xs font-mono text-white/40 tracking-wider">VALIDITÉ</th>
              <th className="text-right p-4 text-xs font-mono text-white/40 tracking-wider">MONTANT</th>
              <th className="text-center p-4 text-xs font-mono text-white/40 tracking-wider">STATUT</th>
              <th className="text-right p-4 text-xs font-mono text-white/40 tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-white/40">
                  {loading ? 'Chargement...' : 'Aucun devis'}
                </td>
              </tr>
            ) : (
              filteredQuotes.map((quote, index) => {
                const StatusIcon = statusConfig[quote.status].icon;
                const isExpired = new Date(quote.validUntil) < new Date() && quote.status === 'sent';
                
                return (
                  <motion.tr
                    key={quote.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedQuote(quote)}
                    className={`
                      border-b border-glass-border/50 cursor-pointer transition-colors
                      hover:bg-glass-secondary
                      ${selectedQuote?.id === quote.id ? 'bg-neon-cyan/5' : ''}
                    `}
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-neon-cyan">#{quote.quoteNumber}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-white/80">{quote.clientName || 'Client inconnu'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono text-white/50">{formatDate(quote.issueDate)}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-mono ${isExpired ? 'text-red-400' : 'text-white/50'}`}>
                        {formatDate(quote.validUntil)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-mono font-bold text-white">
                        {parseFloat(quote.total).toLocaleString('fr-FR')} €
                      </span>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center justify-center gap-2 px-3 py-1 rounded-full ${statusConfig[quote.status].bg}`}>
                        <StatusIcon size={12} className={statusConfig[quote.status].color} />
                        <span className={`text-xs font-mono ${statusConfig[quote.status].color}`}>
                          {statusConfig[quote.status].label}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                          onClick={(e: React.MouseEvent) => handleEdit(quote, e)}
                          title="Éditer"
                        >
                          <FileText size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-neon-cyan transition-colors cursor-pointer"
                          onClick={(e: React.MouseEvent) => handleDownloadPDF(quote.id, e)}
                          title="Télécharger PDF"
                        >
                          <Download size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-purple-400 transition-colors cursor-pointer"
                          onClick={(e: React.MouseEvent) => handleDuplicate(quote.id, e)}
                          title="Dupliquer"
                        >
                          <Copy size={16} />
                        </motion.button>
                        {(quote.status === 'sent' || quote.status === 'accepted') && !quote.convertedToInvoiceId && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-emerald-400 transition-colors cursor-pointer"
                            onClick={(e: React.MouseEvent) => handleConvert(quote.id, e)}
                            title="Convertir en facture"
                          >
                            <ArrowRight size={16} />
                          </motion.button>
                        )}
                        {quote.status === 'draft' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                            onClick={(e: React.MouseEvent) => handleDelete(quote.id, e)}
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </GlassPanel>

      {/* Loading */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="fixed top-4 right-4 p-4 bg-red-500/20 border border-red-500/50 rounded z-40">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Quote Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <QuoteEditorAdvanced
            quote={editingQuote}
            onClose={() => {
              setShowEditor(false);
              setEditingQuote(null);
            }}
            onSave={() => {
              refetch();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
