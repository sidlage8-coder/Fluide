import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Send, Download, Trash2, Check, Clock, AlertTriangle, Loader2, Lock, RotateCcw, Eye, Mail, FileSpreadsheet, ClipboardList } from 'lucide-react';
import { GlassPanel, Button, SuccessToast } from '../components/ui';
import { ModularInvoiceEditor, EmailPreview } from '../components/invoices';
import { useInvoices, useGameActions } from '../hooks';
import { invoicesApi } from '../lib/api';
import { downloadInvoicePDF } from '../lib/pdf';
import { exportInvoicesToCSV } from '../lib/export';
import type { Invoice } from '../lib/api';

const statusConfig = {
  draft: { color: 'text-white/40', bg: 'bg-white/10', icon: Clock, label: 'Brouillon' },
  sent: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Send, label: 'Envoyée' },
  paid: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Check, label: 'Payée' },
  overdue: { color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle, label: 'En retard' },
  cancelled: { color: 'text-gray-400', bg: 'bg-gray-500/10', icon: Trash2, label: 'Annulée' },
};


export function Invoices() {
  const { invoices, loading, error, createInvoice, deleteInvoice, markAsPaid } = useInvoices();
  const { onInvoiceCreated, onInvoiceSent } = useGameActions();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<'all' | Invoice['status']>('all');
  const [showForm, setShowForm] = useState(false);
  const [emailInvoice, setEmailInvoice] = useState<Invoice | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  const totals = {
    all: invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0),
    paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total), 0),
    pending: invoices.filter(inv => ['sent', 'overdue'].includes(inv.status)).reduce((sum, inv) => sum + parseFloat(inv.total), 0),
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette facture ?')) return;
    await deleteInvoice(id);
  };

  const handleMarkPaid = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsPaid(id);
  };

  const handleDownloadPDF = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const invoiceWithItems = await invoicesApi.get(id);
      downloadInvoicePDF(invoiceWithItems as any);
    } catch (err) {
      console.error('Erreur téléchargement PDF:', err);
    }
  };

  const handleFinalize = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Finaliser cette facture ? Elle ne pourra plus être modifiée.')) return;
    try {
      await invoicesApi.finalize(id);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la finalisation');
    }
  };

  const handleCreateCreditNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Créer un avoir pour annuler cette facture ?')) return;
    try {
      await invoicesApi.createCreditNote(id);
      window.location.reload();
    } catch (err) {
      console.error('Erreur création avoir:', err);
    }
  };

  const handleOpenEmail = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const fullInvoice = await invoicesApi.get(id);
      setEmailInvoice(fullInvoice);
    } catch (err) {
      console.error('Erreur chargement facture:', err);
    }
  };

  const handleExportCSV = () => {
    exportInvoicesToCSV(filteredInvoices);
  };

  const handleConvertToQuote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Convertir cette facture en devis ?')) return;
    try {
      await invoicesApi.convertToQuote(id);
      alert('Facture convertie en devis avec succès !');
    } catch (err) {
      console.error('Erreur conversion:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <GlassPanel className="p-4">
          <span className="text-xs font-mono text-white/40">TOTAL FACTURÉ</span>
          <p className="text-xl font-mono font-bold text-white mt-1">
            {totals.all.toLocaleString('fr-FR')} €
          </p>
        </GlassPanel>
        <GlassPanel className="p-4" variant="highlight">
          <span className="text-xs font-mono text-white/40">ENCAISSÉ</span>
          <p className="text-xl font-mono font-bold text-neon-green mt-1">
            {totals.paid.toLocaleString('fr-FR')} €
          </p>
        </GlassPanel>
        <GlassPanel className="p-4" variant="danger">
          <span className="text-xs font-mono text-white/40">EN ATTENTE</span>
          <p className="text-xl font-mono font-bold text-neon-orange mt-1">
            {totals.pending.toLocaleString('fr-FR')} €
          </p>
        </GlassPanel>
        <GlassPanel className="p-4">
          <span className="text-xs font-mono text-white/40">FACTURES</span>
          <p className="text-xl font-mono font-bold text-neon-cyan mt-1">
            {invoices.length}
          </p>
        </GlassPanel>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
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

        <Button 
          variant="secondary" 
          icon={<FileSpreadsheet size={16} />} 
          onClick={handleExportCSV}
          className="mr-2"
        >
          EXPORT CSV
        </Button>
        
        <Button icon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          NOUVELLE FACTURE
        </Button>
      </div>

      {/* Invoice List */}
      <GlassPanel className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="text-left p-4 text-xs font-mono text-white/40 tracking-wider">N°</th>
              <th className="text-left p-4 text-xs font-mono text-white/40 tracking-wider">CLIENT</th>
              <th className="text-left p-4 text-xs font-mono text-white/40 tracking-wider">DATE</th>
              <th className="text-left p-4 text-xs font-mono text-white/40 tracking-wider">ÉCHÉANCE</th>
              <th className="text-right p-4 text-xs font-mono text-white/40 tracking-wider">MONTANT</th>
              <th className="text-center p-4 text-xs font-mono text-white/40 tracking-wider">STATUT</th>
              <th className="text-right p-4 text-xs font-mono text-white/40 tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice, index) => {
              const StatusIcon = statusConfig[invoice.status].icon;
              
              return (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedInvoice(invoice)}
                  className={`
                    border-b border-glass-border/50 cursor-pointer transition-colors
                    hover:bg-glass-secondary
                    ${selectedInvoice?.id === invoice.id ? 'bg-neon-cyan/5' : ''}
                  `}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm ${invoice.invoiceType === 'credit_note' ? 'text-orange-400' : 'text-neon-cyan'}`}>
                        #{invoice.invoiceNumber}
                      </span>
                      {invoice.invoiceType === 'credit_note' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono">AVOIR</span>
                      )}
                      {invoice.isFinalized && invoice.invoiceType === 'invoice' && (
                        <Lock size={12} className="text-amber-400/60" title="Finalisée" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-white/80">{invoice.clientName || 'Client inconnu'}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-mono text-white/50">{formatDate(invoice.issueDate)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-sm font-mono ${
                      invoice.status === 'overdue' ? 'text-amber-400' : 'text-white/50'
                    }`}>
                      {formatDate(invoice.dueDate)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-mono font-bold text-white">
                      {parseFloat(invoice.total).toLocaleString('fr-FR')} €
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center justify-center gap-2 px-3 py-1 rounded-full ${statusConfig[invoice.status].bg}`}>
                      <StatusIcon size={12} className={statusConfig[invoice.status].color} />
                      <span className={`text-xs font-mono ${statusConfig[invoice.status].color}`}>
                        {statusConfig[invoice.status].label}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-white/80 transition-colors cursor-pointer"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        title="Voir"
                      >
                        <Eye size={16} />
                      </motion.button>
                      {/* Marquer payée - seulement si envoyée et non finalisée */}
                      {invoice.status === 'sent' && !invoice.isFinalized && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-emerald-400 transition-colors cursor-pointer"
                          onClick={(e: React.MouseEvent) => handleMarkPaid(invoice.id, e)}
                          title="Marquer comme payée"
                        >
                          <Check size={16} />
                        </motion.button>
                      )}
                      {/* Finaliser - seulement si envoyée et non finalisée */}
                      {invoice.status === 'sent' && !invoice.isFinalized && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-amber-400 transition-colors cursor-pointer"
                          onClick={(e: React.MouseEvent) => handleFinalize(invoice.id, e)}
                          title="Finaliser (verrouiller)"
                        >
                          <Lock size={16} />
                        </motion.button>
                      )}
                      {/* PDF */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-neon-cyan transition-colors cursor-pointer"
                        onClick={(e: React.MouseEvent) => handleDownloadPDF(invoice.id, e)}
                        title="Télécharger PDF"
                      >
                        <Download size={16} />
                      </motion.button>
                      {/* Email */}
                      {invoice.status !== 'draft' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-purple-400 transition-colors cursor-pointer"
                          onClick={(e: React.MouseEvent) => handleOpenEmail(invoice.id, e)}
                          title="Envoyer par email"
                        >
                          <Mail size={16} />
                        </motion.button>
                      )}
                      {/* Créer avoir - seulement si finalisée */}
                      {invoice.isFinalized && invoice.invoiceType === 'invoice' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-orange-400 transition-colors cursor-pointer"
                          onClick={(e: React.MouseEvent) => handleCreateCreditNote(invoice.id, e)}
                          title="Créer un avoir"
                        >
                          <RotateCcw size={16} />
                        </motion.button>
                      )}
                      {/* Convertir en devis */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-purple-400 transition-colors cursor-pointer"
                        onClick={(e: React.MouseEvent) => handleConvertToQuote(invoice.id, e)}
                        title="Convertir en devis"
                      >
                        <ClipboardList size={16} />
                      </motion.button>
                      {/* Supprimer - seulement si brouillon */}
                      {invoice.status === 'draft' && !invoice.isFinalized && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded hover:bg-glass-secondary text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                          onClick={(e: React.MouseEvent) => handleDelete(invoice.id, e)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
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

      {/* Invoice Form Modal - Modular Editor */}
      <AnimatePresence>
        {showForm && (
          <ModularInvoiceEditor
            onClose={() => setShowForm(false)}
            onSubmit={async (data) => {
              await createInvoice(data);
              onInvoiceCreated();
              setSuccessMessage('Facture créée ! +50 XP');
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 2500);
            }}
          />
        )}
      </AnimatePresence>

      {/* Email Preview Modal */}
      <AnimatePresence>
        {emailInvoice && (
          <EmailPreview
            invoice={emailInvoice}
            onClose={() => setEmailInvoice(null)}
            onSend={async (to, subject, message) => {
              console.log('Email envoyé:', { to, subject, message });
              onInvoiceSent();
              setSuccessMessage('Facture envoyée ! +20 XP');
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 2500);
            }}
          />
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <SuccessToast show={showSuccess} message={successMessage} />
    </div>
  );
}
