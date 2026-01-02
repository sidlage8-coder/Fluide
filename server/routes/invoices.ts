import { Router } from 'express';
import { db } from '../db';
import { invoices, invoiceItems, clients, quotes, quoteItems } from '../../src/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

// GET /api/invoices - Liste des factures
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const userInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        invoiceType: invoices.invoiceType,
        relatedInvoiceId: invoices.relatedInvoiceId,
        clientId: invoices.clientId,
        clientName: clients.name,
        subtotal: invoices.subtotal,
        vatRate: invoices.vatRate,
        vatAmount: invoices.vatAmount,
        total: invoices.total,
        status: invoices.status,
        paymentStatus: invoices.paymentStatus,
        isFinalized: invoices.isFinalized,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        paidAt: invoices.paidAt,
        finalizedAt: invoices.finalizedAt,
        description: invoices.description,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));

    res.json(userInvoices);
  } catch (error) {
    console.error('Erreur liste factures:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/invoices/:id - Détail d'une facture avec ses lignes
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const [invoice] = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        clientAddress: clients.address,
        clientCity: clients.city,
        clientPostalCode: clients.postalCode,
        subtotal: invoices.subtotal,
        vatRate: invoices.vatRate,
        vatAmount: invoices.vatAmount,
        total: invoices.total,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        paidAt: invoices.paidAt,
        description: invoices.description,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    if (!invoice) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    // Récupérer les lignes de la facture
    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id))
      .orderBy(invoiceItems.sortOrder);

    res.json({ ...invoice, items });
  } catch (error) {
    console.error('Erreur détail facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Générer le prochain numéro de facture - SÉQUENTIEL INVIOLABLE
async function getNextInvoiceNumber(userId: string, type: 'invoice' | 'credit_note' = 'invoice'): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = type === 'credit_note' ? `AV-${year}-` : `FAC-${year}-`;

  // Compter TOUTES les factures/avoirs de l'année pour garantir la séquence
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .where(and(
      eq(invoices.userId, userId),
      eq(invoices.invoiceType, type),
      sql`EXTRACT(YEAR FROM ${invoices.createdAt}) = ${year}`
    ));

  const count = Number(countResult[0]?.count || 0);
  return `${prefix}${(count + 1).toString().padStart(4, '0')}`;
}

// Vérifier si une facture est modifiable
async function isInvoiceEditable(invoiceId: string, userId: string): Promise<{ editable: boolean; reason?: string }> {
  const [invoice] = await db
    .select({ isFinalized: invoices.isFinalized, status: invoices.status })
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));

  if (!invoice) {
    return { editable: false, reason: 'Facture non trouvée' };
  }

  if (invoice.isFinalized) {
    return { editable: false, reason: 'Facture finalisée - Créez un avoir pour corriger' };
  }

  if (invoice.status === 'paid') {
    return { editable: false, reason: 'Facture payée - Créez un avoir pour corriger' };
  }

  return { editable: true };
}

// POST /api/invoices - Créer une facture
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { clientId, items, vatRate = 20, dueDate, description, notes } = req.body;

    if (!clientId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Client et lignes requis' });
    }

    // Calculer les totaux
    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
    }, 0);

    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    const invoiceNumber = await getNextInvoiceNumber(userId);

    // Créer la facture
    const [newInvoice] = await db
      .insert(invoices)
      .values({
        userId,
        clientId,
        invoiceNumber,
        subtotal: subtotal.toFixed(2),
        vatRate: vatRate.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        total: total.toFixed(2),
        status: 'draft',
        issueDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description,
        notes,
      })
      .returning();

    // Créer les lignes
    const invoiceItemsData = items.map((item: any, index: number) => ({
      invoiceId: newInvoice.id,
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      total: (parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2),
      sortOrder: index,
    }));

    await db.insert(invoiceItems).values(invoiceItemsData);

    res.status(201).json(newInvoice);
  } catch (error) {
    console.error('Erreur création facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/invoices/:id - Modifier une facture (seulement si non finalisée)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // VÉRIFICATION IMMUTABILITÉ
    const editCheck = await isInvoiceEditable(id, userId);
    if (!editCheck.editable) {
      return res.status(403).json({ error: editCheck.reason });
    }

    const { clientId, items, vatRate, dueDate, description, notes, status, paymentStatus } = req.body;

    let updateData: any = { updatedAt: new Date() };

    if (items && items.length > 0) {
      const subtotal = items.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
      }, 0);

      const rate = vatRate ?? 20;
      const vatAmount = subtotal * (rate / 100);
      const total = subtotal + vatAmount;

      updateData = {
        ...updateData,
        subtotal: subtotal.toFixed(2),
        vatRate: rate.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        total: total.toFixed(2),
      };

      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));

      const invoiceItemsData = items.map((item: any, index: number) => ({
        invoiceId: id,
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        total: (parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2),
        sortOrder: index,
      }));

      await db.insert(invoiceItems).values(invoiceItemsData);
    }

    if (clientId) updateData.clientId = clientId;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (status) {
      updateData.status = status;
      if (status === 'paid') {
        updateData.paidAt = new Date();
        updateData.paymentStatus = 'paid';
      }
    }
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid') updateData.paidAt = new Date();
    }

    const [updatedInvoice] = await db
      .update(invoices)
      .set(updateData)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning();

    if (!updatedInvoice) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Erreur modification facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/invoices/:id/finalize - Finaliser une facture (la rendre immutable)
router.post('/:id/finalize', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    if (!invoice) return res.status(404).json({ error: 'Facture non trouvée' });
    if (invoice.isFinalized) return res.status(400).json({ error: 'Facture déjà finalisée' });
    if (invoice.status === 'draft') return res.status(400).json({ error: 'Envoyez la facture avant de la finaliser' });

    const [finalized] = await db
      .update(invoices)
      .set({
        isFinalized: true,
        finalizedAt: new Date(),
        status: 'sent',
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning();

    res.json(finalized);
  } catch (error) {
    console.error('Erreur finalisation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/invoices/:id/credit-note - Créer un avoir à partir d'une facture
router.post('/:id/credit-note', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    // Récupérer la facture originale
    const [originalInvoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    if (!originalInvoice) return res.status(404).json({ error: 'Facture non trouvée' });

    // Récupérer les lignes
    const originalItems = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    // Générer le numéro d'avoir
    const creditNoteNumber = await getNextInvoiceNumber(userId, 'credit_note');

    // Créer l'avoir avec montants INVERSÉS (négatifs)
    const [creditNote] = await db
      .insert(invoices)
      .values({
        userId,
        clientId: originalInvoice.clientId,
        invoiceNumber: creditNoteNumber,
        invoiceType: 'credit_note',
        relatedInvoiceId: originalInvoice.id,
        subtotal: (-parseFloat(originalInvoice.subtotal)).toFixed(2),
        vatRate: originalInvoice.vatRate,
        vatAmount: (-parseFloat(originalInvoice.vatAmount)).toFixed(2),
        total: (-parseFloat(originalInvoice.total)).toFixed(2),
        status: 'sent',
        paymentStatus: 'paid', // Les avoirs sont considérés comme "réglés"
        isFinalized: true,
        finalizedAt: new Date(),
        issueDate: new Date(),
        dueDate: new Date(),
        description: `Avoir sur facture ${originalInvoice.invoiceNumber}`,
        notes: originalInvoice.notes,
      })
      .returning();

    // Copier les lignes avec montants inversés
    if (originalItems.length > 0) {
      const creditNoteItems = originalItems.map((item, index) => ({
        invoiceId: creditNote.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: (-parseFloat(item.unitPrice)).toFixed(2),
        total: (-parseFloat(item.total)).toFixed(2),
        sortOrder: index,
      }));

      await db.insert(invoiceItems).values(creditNoteItems);
    }

    res.status(201).json(creditNote);
  } catch (error) {
    console.error('Erreur création avoir:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/invoices/:id/payment - Mettre à jour le statut de paiement
router.put('/:id/payment', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { paymentStatus, paidAmount } = req.body;

    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    let updateData: any = { paymentStatus, updatedAt: new Date() };

    if (paymentStatus === 'paid') {
      updateData.paidAt = new Date();
      updateData.status = 'paid';
    } else if (paymentStatus === 'overdue') {
      updateData.status = 'overdue';
    }

    const [updated] = await db
      .update(invoices)
      .set(updateData)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Facture non trouvée' });

    res.json(updated);
  } catch (error) {
    console.error('Erreur paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/invoices/:id/convert-to-quote - Convertir une facture en devis
router.post('/:id/convert-to-quote', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    // Récupérer la facture
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    if (!invoice) return res.status(404).json({ error: 'Facture non trouvée' });

    // Récupérer les lignes de facture
    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    // Générer le numéro de devis
    const year = new Date().getFullYear();
    const existingQuotes = await db
      .select({ quoteNumber: quotes.quoteNumber })
      .from(quotes)
      .where(eq(quotes.userId, userId));
    
    const maxNumber = existingQuotes.reduce((max, q) => {
      const match = q.quoteNumber.match(/DEV-(\d+)-(\d+)/);
      if (match && parseInt(match[1]) === year) {
        return Math.max(max, parseInt(match[2]));
      }
      return max;
    }, 0);
    
    const quoteNumber = `DEV-${year}-${String(maxNumber + 1).padStart(4, '0')}`;

    // Créer le devis
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const [newQuote] = await db
      .insert(quotes)
      .values({
        userId,
        clientId: invoice.clientId,
        quoteNumber,
        subtotal: invoice.subtotal,
        vatRate: invoice.vatRate,
        vatAmount: invoice.vatAmount,
        total: invoice.total,
        status: 'draft',
        issueDate: new Date(),
        validUntil,
        description: invoice.description ? `[Converti] ${invoice.description}` : `Converti depuis facture ${invoice.invoiceNumber}`,
        notes: invoice.notes,
      })
      .returning();

    // Créer les lignes du devis
    if (items.length > 0) {
      await db.insert(quoteItems).values(
        items.map(item => ({
          quoteId: newQuote.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: invoice.vatRate,
          discount: '0',
          total: item.total,
        }))
      );
    }

    res.json({ success: true, quote: newQuote });
  } catch (error) {
    console.error('Erreur conversion facture->devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/invoices/:id - Supprimer une facture
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const [deletedInvoice] = await db
      .delete(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning();

    if (!deletedInvoice) {
      return res.status(404).json({ error: 'Facture non trouvée' });
    }

    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
