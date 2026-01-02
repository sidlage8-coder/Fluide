import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice } from './api';

interface InvoicePDFData extends Omit<Invoice, 'items'> {
  items?: {
    description: string;
    quantity: string;
    unitPrice: string;
    total: string;
  }[];
}

export function generateInvoicePDF(invoice: InvoicePDFData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [59, 130, 246];
  const textColor: [number, number, number] = [30, 30, 30];
  const grayColor: [number, number, number] = [120, 120, 120];

  // Header
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('FACTURE', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.text(`N° ${invoice.invoiceNumber}`, 20, 40);

  // Company Info (right side)
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text('ORBITAL COMMAND', pageWidth - 20, 30, { align: 'right' });
  doc.text('Votre adresse', pageWidth - 20, 36, { align: 'right' });
  doc.text('Code postal, Ville', pageWidth - 20, 42, { align: 'right' });
  doc.text('SIRET: XXXXXXXXXXXXXX', pageWidth - 20, 48, { align: 'right' });

  // Dates
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  const issueDate = new Date(invoice.issueDate).toLocaleDateString('fr-FR');
  const dueDate = new Date(invoice.dueDate).toLocaleDateString('fr-FR');
  doc.text(`Date d'émission: ${issueDate}`, 20, 60);
  doc.text(`Date d'échéance: ${dueDate}`, 20, 66);

  // Client Info
  doc.setFillColor(245, 247, 250);
  doc.rect(20, 75, pageWidth - 40, 35, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text('FACTURER À', 25, 83);
  
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  doc.text(invoice.clientName || 'Client', 25, 91);
  if (invoice.clientAddress) doc.text(invoice.clientAddress, 25, 97);
  if (invoice.clientCity && invoice.clientPostalCode) {
    doc.text(`${invoice.clientPostalCode} ${invoice.clientCity}`, 25, 103);
  }

  // Description
  if (invoice.description) {
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('Objet:', 20, 120);
    doc.setTextColor(...textColor);
    doc.text(invoice.description, 45, 120);
  }

  // Items Table
  const tableStartY = invoice.description ? 130 : 120;
  
  const items = invoice.items || [];
  const tableData = items.map(item => [
    item.description,
    parseFloat(item.quantity).toFixed(2),
    `${parseFloat(item.unitPrice).toFixed(2)} €`,
    `${parseFloat(item.total).toFixed(2)} €`,
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Quantité', 'Prix unitaire', 'Total']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 20, right: 20 },
  });

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  const totalsX = pageWidth - 80;
  doc.setFontSize(10);
  
  doc.setTextColor(...grayColor);
  doc.text('Sous-total HT:', totalsX, finalY);
  doc.setTextColor(...textColor);
  doc.text(`${parseFloat(invoice.subtotal).toFixed(2)} €`, pageWidth - 20, finalY, { align: 'right' });
  
  doc.setTextColor(...grayColor);
  doc.text(`TVA (${parseFloat(invoice.vatRate).toFixed(0)}%):`, totalsX, finalY + 7);
  doc.setTextColor(...textColor);
  doc.text(`${parseFloat(invoice.vatAmount).toFixed(2)} €`, pageWidth - 20, finalY + 7, { align: 'right' });
  
  doc.setDrawColor(...primaryColor);
  doc.line(totalsX, finalY + 12, pageWidth - 20, finalY + 12);
  
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('Total TTC:', totalsX, finalY + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(`${parseFloat(invoice.total).toFixed(2)} €`, pageWidth - 20, finalY + 20, { align: 'right' });

  // Notes
  if (invoice.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...grayColor);
    doc.text('Notes:', 20, finalY + 40);
    doc.setTextColor(...textColor);
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(splitNotes, 20, finalY + 47);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Merci pour votre confiance.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Paiement par virement bancaire - IBAN: FRXX XXXX XXXX XXXX XXXX XXX', pageWidth / 2, footerY + 5, { align: 'center' });

  return doc;
}

export function downloadInvoicePDF(invoice: InvoicePDFData) {
  const doc = generateInvoicePDF(invoice);
  doc.save(`facture-${invoice.invoiceNumber}.pdf`);
}

export function previewInvoicePDF(invoice: InvoicePDFData) {
  const doc = generateInvoicePDF(invoice);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
