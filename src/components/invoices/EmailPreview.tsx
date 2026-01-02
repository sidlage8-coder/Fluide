import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Paperclip, Loader2, Mail } from 'lucide-react';
import { Button } from '../ui';
import type { Invoice } from '../../lib/api';

interface EmailPreviewProps {
  invoice: Invoice;
  onClose: () => void;
  onSend: (to: string, subject: string, message: string) => Promise<void>;
}

const generateEmailHTML = (invoice: Invoice) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 5px 0 0; opacity: 0.8; }
    .content { background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; }
    .invoice-box { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #dee2e6; }
    .invoice-number { color: #0066cc; font-weight: bold; font-size: 18px; }
    .amount { font-size: 28px; font-weight: bold; color: #28a745; margin: 15px 0; }
    .details { color: #666; font-size: 14px; }
    .details span { display: block; margin: 5px 0; }
    .cta { text-align: center; margin: 25px 0; }
    .cta a { background: #0066cc; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; display: inline-block; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
    .attachment { background: #e3f2fd; border: 1px solid #90caf9; border-radius: 6px; padding: 12px 15px; display: inline-flex; align-items: center; gap: 8px; margin-top: 15px; }
    .attachment-icon { color: #1976d2; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ORBITAL COMMAND</h1>
    <p>Facturation professionnelle</p>
  </div>
  
  <div class="content">
    <p>Bonjour,</p>
    <p>Veuillez trouver ci-joint votre facture.</p>
    
    <div class="invoice-box">
      <div class="invoice-number">Facture #${invoice.invoiceNumber}</div>
      <div class="amount">${parseFloat(invoice.total).toLocaleString('fr-FR')} € TTC</div>
      <div class="details">
        <span>📅 Date d'émission : ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</span>
        <span>⏰ Date d'échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</span>
        <span>🏢 Client : ${invoice.clientName || 'Client'}</span>
      </div>
    </div>

    <div class="attachment">
      <span class="attachment-icon">📎</span>
      <span>facture-${invoice.invoiceNumber}.pdf</span>
    </div>

    <p style="margin-top: 25px;">
      Pour toute question concernant cette facture, n'hésitez pas à nous contacter.
    </p>
    
    <p>Cordialement,<br><strong>L'équipe ORBITAL COMMAND</strong></p>
  </div>
  
  <div class="footer">
    <p>ORBITAL COMMAND • SIRET: XXXXXXXXXXXXXX</p>
    <p>Cet email a été généré automatiquement.</p>
  </div>
</body>
</html>
`;

export function EmailPreview({ invoice, onClose, onSend }: EmailPreviewProps) {
  const [to, setTo] = useState(invoice.clientEmail || '');
  const [subject, setSubject] = useState(`Facture #${invoice.invoiceNumber} - ORBITAL COMMAND`);
  const [message, setMessage] = useState(
    `Bonjour,\n\nVeuillez trouver ci-joint votre facture #${invoice.invoiceNumber} d'un montant de ${parseFloat(invoice.total).toLocaleString('fr-FR')} € TTC.\n\nDate d'échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}\n\nCordialement,\nL'équipe ORBITAL COMMAND`
  );
  const [sending, setSending] = useState(false);
  const [showHTML, setShowHTML] = useState(false);

  const handleSend = async () => {
    if (!to) return;
    setSending(true);
    try {
      await onSend(to, subject, message);
      onClose();
    } catch (err) {
      console.error('Error sending email:', err);
    } finally {
      setSending(false);
    }
  };

  const htmlContent = generateEmailHTML(invoice);

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
        <div className="flex items-center justify-between p-4 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
              <Mail size={20} className="text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-mono font-bold text-white">Envoyer par email</h2>
              <p className="text-sm text-white/50">Facture #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4 border-b border-glass-border">
          <div>
            <label className="block text-xs font-mono text-white/50 mb-1">Destinataire *</label>
            <input
              type="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="client@example.com"
              className="w-full bg-void-dark border border-glass-border rounded px-4 py-2 text-white focus:border-neon-cyan/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-white/50 mb-1">Objet</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-void-dark border border-glass-border rounded px-4 py-2 text-white focus:border-neon-cyan/50 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-white/50 mb-1">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-void-dark border border-glass-border rounded px-4 py-2 text-white focus:border-neon-cyan/50 outline-none resize-none"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Paperclip size={14} />
            <span>Pièce jointe : facture-{invoice.invoiceNumber}.pdf</span>
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="p-2 border-b border-glass-border flex gap-2">
          <button
            onClick={() => setShowHTML(false)}
            className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
              !showHTML ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-white/50 hover:text-white/80'
            }`}
          >
            Aperçu texte
          </button>
          <button
            onClick={() => setShowHTML(true)}
            className={`px-3 py-1.5 rounded text-sm font-mono transition-colors ${
              showHTML ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-white/50 hover:text-white/80'
            }`}
          >
            Aperçu HTML
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto p-4 bg-void-dark">
          {showHTML ? (
            <iframe
              srcDoc={htmlContent}
              className="w-full h-full min-h-[400px] bg-white rounded"
              title="Email Preview"
            />
          ) : (
            <div className="bg-white text-gray-800 rounded p-6 whitespace-pre-wrap font-sans">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500">De: noreply@orbital-command.fr</p>
                <p className="text-sm text-gray-500">À: {to || '(destinataire)'}</p>
                <p className="text-sm text-gray-500">Objet: {subject}</p>
              </div>
              {message}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Paperclip size={14} />
                  <span>facture-{invoice.invoiceNumber}.pdf</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-glass-border flex items-center justify-between">
          <p className="text-xs text-white/40">
            Note: L'envoi d'email nécessite une configuration SMTP.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleSend} disabled={sending || !to}>
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
