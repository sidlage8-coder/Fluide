import type { Invoice } from './api';

// Convert invoices to CSV format
export function invoicesToCSV(invoices: Invoice[]): string {
  const headers = [
    'Numéro',
    'Client',
    'Date émission',
    'Date échéance',
    'HT',
    'Taux TVA',
    'TVA',
    'TTC',
    'Statut',
    'Paiement'
  ];

  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    sent: 'Envoyée',
    paid: 'Payée',
    overdue: 'En retard',
    cancelled: 'Annulée',
  };

  const paymentLabels: Record<string, string> = {
    unpaid: 'Impayée',
    partial: 'Partiel',
    paid: 'Payée',
    overdue: 'En retard',
  };

  const rows = invoices.map(inv => [
    inv.invoiceNumber,
    inv.clientName || '',
    new Date(inv.issueDate).toLocaleDateString('fr-FR'),
    new Date(inv.dueDate).toLocaleDateString('fr-FR'),
    parseFloat(inv.subtotal).toFixed(2),
    `${parseFloat(inv.vatRate).toFixed(0)}%`,
    parseFloat(inv.vatAmount).toFixed(2),
    parseFloat(inv.total).toFixed(2),
    statusLabels[inv.status] || inv.status,
    paymentLabels[inv.paymentStatus] || inv.paymentStatus,
  ]);

  // Escape CSV values
  const escapeCSV = (value: string) => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.map(escapeCSV).join(';'), // Use semicolon for French Excel compatibility
    ...rows.map(row => row.map(escapeCSV).join(';'))
  ].join('\n');

  // Add BOM for UTF-8 Excel compatibility
  return '\ufeff' + csvContent;
}

// Download CSV file
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Export invoices to CSV and download
export function exportInvoicesToCSV(invoices: Invoice[], filename?: string) {
  const csv = invoicesToCSV(invoices);
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csv, filename || `factures-export-${date}.csv`);
}

// Calculate totals for export summary
export function calculateExportTotals(invoices: Invoice[]) {
  return {
    count: invoices.length,
    totalHT: invoices.reduce((sum, inv) => sum + parseFloat(inv.subtotal), 0),
    totalTVA: invoices.reduce((sum, inv) => sum + parseFloat(inv.vatAmount), 0),
    totalTTC: invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0),
  };
}
