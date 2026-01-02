import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Quote } from './api';

interface QuotePDFData extends Omit<Quote, 'items'> {
  items?: {
    description: string;
    quantity: string;
    unitPrice: string;
    vatRate?: string;
    discount?: string;
    total: string;
  }[];
}

export function generateQuotePDF(quote: QuotePDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246];
  const textColor: [number, number, number] = [30, 30, 30];
  const grayColor: [number, number, number] = [120, 120, 120];

  // Header
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.text('DEVIS', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text(`N° ${quote.quoteNumber}`, 20, 40);

  // Status badge
  const statusLabels: Record<string, string> = {
    draft: 'BROUILLON',
    sent: 'ENVOYÉ',
    accepted: 'ACCEPTÉ',
    rejected: 'REFUSÉ',
    expired: 'EXPIRÉ',
  };
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text(`Statut: ${statusLabels[quote.status] || quote.status}`, 20, 48);

  // Company Info (right side)
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text('ORBITAL COMMAND', pageWidth - 20, 30, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text('Votre adresse professionnelle', pageWidth - 20, 36, { align: 'right' });
  doc.text('Code postal, Ville', pageWidth - 20, 42, { align: 'right' });
  doc.text('SIRET: XXXXXXXXXXXXXX', pageWidth - 20, 48, { align: 'right' });
  doc.text('TVA: FRXXXXXXXXXX', pageWidth - 20, 54, { align: 'right' });

  // Dates
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  const issueDate = new Date(quote.issueDate).toLocaleDateString('fr-FR');
  const validUntil = new Date(quote.validUntil).toLocaleDateString('fr-FR');
  doc.text(`Date d'émission: ${issueDate}`, 20, 65);
  doc.text(`Valide jusqu'au: ${validUntil}`, 20, 72);

  // Client Info Box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, 80, pageWidth - 40, 40, 3, 3, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text('DESTINATAIRE', 25, 88);
  
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(quote.clientName || 'Client', 25, 96);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (quote.clientAddress) doc.text(quote.clientAddress, 25, 103);
  if (quote.clientCity && quote.clientPostalCode) {
    doc.text(`${quote.clientPostalCode} ${quote.clientCity}`, 25, 110);
  }
  if (quote.clientEmail) {
    doc.setTextColor(...grayColor);
    doc.text(quote.clientEmail, 25, 117);
  }

  // Description/Object
  let tableStartY = 130;
  if (quote.description) {
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('Objet:', 20, tableStartY);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(quote.description, 45, tableStartY);
    doc.setFont('helvetica', 'normal');
    tableStartY += 15;
  }

  // Items Table
  const items = quote.items || [];
  const tableData = items.map(item => {
    const qty = parseFloat(item.quantity).toFixed(2);
    const price = parseFloat(item.unitPrice).toFixed(2);
    const discount = item.discount ? parseFloat(item.discount).toFixed(0) : '0';
    const total = parseFloat(item.total).toFixed(2);
    
    return [
      item.description,
      qty,
      `${price} €`,
      discount !== '0' ? `${discount}%` : '-',
      `${total} €`,
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Qté', 'Prix unit. HT', 'Remise', 'Total HT']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textColor,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    margin: { left: 20, right: 20 },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  const totalsX = pageWidth - 90;
  doc.setFontSize(10);
  
  // Subtotal
  doc.setTextColor(...grayColor);
  doc.text('Sous-total HT:', totalsX, finalY);
  doc.setTextColor(...textColor);
  doc.text(`${parseFloat(quote.subtotal).toFixed(2)} €`, pageWidth - 20, finalY, { align: 'right' });
  
  // TVA
  doc.setTextColor(...grayColor);
  doc.text(`TVA (${parseFloat(quote.vatRate).toFixed(0)}%):`, totalsX, finalY + 8);
  doc.setTextColor(...textColor);
  doc.text(`${parseFloat(quote.vatAmount).toFixed(2)} €`, pageWidth - 20, finalY + 8, { align: 'right' });
  
  // Line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(totalsX, finalY + 14, pageWidth - 20, finalY + 14);
  
  // Total TTC
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC:', totalsX, finalY + 24);
  doc.text(`${parseFloat(quote.total).toFixed(2)} €`, pageWidth - 20, finalY + 24, { align: 'right' });
  doc.setFont('helvetica', 'normal');

  // Notes
  let notesY = finalY + 45;
  if (quote.notes) {
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Conditions et remarques:', 20, notesY);
    doc.setTextColor(...textColor);
    const splitNotes = doc.splitTextToSize(quote.notes, pageWidth - 40);
    doc.text(splitNotes, 20, notesY + 7);
    notesY += 7 + splitNotes.length * 5;
  }

  // Legal mentions
  const legalY = Math.max(notesY + 15, doc.internal.pageSize.getHeight() - 50);
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('MENTIONS LÉGALES', 20, legalY);
  doc.setFontSize(7);
  doc.text('Ce devis est valable pour la durée indiquée. Passé ce délai, les prix peuvent être révisés.', 20, legalY + 6);
  doc.text('Pour accepter ce devis, veuillez le retourner signé avec la mention "Bon pour accord".', 20, legalY + 11);
  doc.text('TVA non applicable, art. 293 B du CGI (si applicable)', 20, legalY + 16);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('ORBITAL COMMAND - Document généré automatiquement', pageWidth / 2, footerY, { align: 'center' });

  return doc;
}

export function downloadQuotePDF(quote: QuotePDFData) {
  const doc = generateQuotePDF(quote);
  doc.save(`devis-${quote.quoteNumber}.pdf`);
}

export function previewQuotePDF(quote: QuotePDFData) {
  const doc = generateQuotePDF(quote);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
