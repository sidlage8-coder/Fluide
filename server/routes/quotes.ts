import { Router } from 'express';
import { db } from '../db';
import { quotes, quoteItems, clients, invoices, invoiceItems } from '../../src/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// GET /api/quotes - Liste des devis
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const userQuotes = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        clientId: quotes.clientId,
        clientName: clients.name,
        subtotal: quotes.subtotal,
        vatRate: quotes.vatRate,
        vatAmount: quotes.vatAmount,
        total: quotes.total,
        status: quotes.status,
        issueDate: quotes.issueDate,
        validUntil: quotes.validUntil,
        acceptedAt: quotes.acceptedAt,
        description: quotes.description,
        convertedToInvoiceId: quotes.convertedToInvoiceId,
        createdAt: quotes.createdAt,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(eq(quotes.userId, userId))
      .orderBy(desc(quotes.createdAt));

    res.json(userQuotes);
  } catch (error) {
    console.error('Erreur liste devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/quotes/:id - Détail d'un devis
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const [quote] = await db
      .select({
        id: quotes.id,
        quoteNumber: quotes.quoteNumber,
        clientId: quotes.clientId,
        clientName: clients.name,
        clientEmail: clients.email,
        clientAddress: clients.address,
        clientCity: clients.city,
        clientPostalCode: clients.postalCode,
        subtotal: quotes.subtotal,
        vatRate: quotes.vatRate,
        vatAmount: quotes.vatAmount,
        total: quotes.total,
        status: quotes.status,
        issueDate: quotes.issueDate,
        validUntil: quotes.validUntil,
        acceptedAt: quotes.acceptedAt,
        description: quotes.description,
        notes: quotes.notes,
        convertedToInvoiceId: quotes.convertedToInvoiceId,
        createdAt: quotes.createdAt,
      })
      .from(quotes)
      .leftJoin(clients, eq(quotes.clientId, clients.id))
      .where(and(eq(quotes.id, id), eq(quotes.userId, userId)));

    if (!quote) return res.status(404).json({ error: 'Devis non trouvé' });

    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, id))
      .orderBy(quoteItems.sortOrder);

    res.json({ ...quote, items });
  } catch (error) {
    console.error('Erreur détail devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Générer le prochain numéro de devis
async function getNextQuoteNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `DEV-${year}-`;

  const lastQuote = await db
    .select({ quoteNumber: quotes.quoteNumber })
    .from(quotes)
    .where(eq(quotes.userId, userId))
    .orderBy(desc(quotes.createdAt))
    .limit(1);

  if (lastQuote.length === 0) return `${prefix}0001`;

  const lastNumber = lastQuote[0].quoteNumber;
  const match = lastNumber.match(/(\d+)$/);
  const nextNum = match ? parseInt(match[1]) + 1 : 1;

  return `${prefix}${nextNum.toString().padStart(4, '0')}`;
}

// POST /api/quotes - Créer un devis
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const { clientId, items, vatRate = 20, validUntil, description, notes } = req.body;

    if (!clientId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Client et lignes requis' });
    }

    const subtotal = items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
    }, 0);

    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    const quoteNumber = await getNextQuoteNumber(userId);

    const [newQuote] = await db
      .insert(quotes)
      .values({
        userId,
        clientId,
        quoteNumber,
        subtotal: subtotal.toFixed(2),
        vatRate: vatRate.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        total: total.toFixed(2),
        status: 'draft',
        issueDate: new Date(),
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description,
        notes,
      })
      .returning();

    const quoteItemsData = items.map((item: any, index: number) => ({
      quoteId: newQuote.id,
      description: item.description,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      total: (parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2),
      sortOrder: index,
    }));

    await db.insert(quoteItems).values(quoteItemsData);

    res.status(201).json(newQuote);
  } catch (error) {
    console.error('Erreur création devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/quotes/:id - Modifier un devis
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const { clientId, items, vatRate, validUntil, description, notes, status } = req.body;

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

      await db.delete(quoteItems).where(eq(quoteItems.quoteId, id));

      const quoteItemsData = items.map((item: any, index: number) => ({
        quoteId: id,
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        total: (parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2),
        sortOrder: index,
      }));

      await db.insert(quoteItems).values(quoteItemsData);
    }

    if (clientId) updateData.clientId = clientId;
    if (validUntil) updateData.validUntil = new Date(validUntil);
    if (description !== undefined) updateData.description = description;
    if (notes !== undefined) updateData.notes = notes;
    if (status) {
      updateData.status = status;
      if (status === 'accepted') updateData.acceptedAt = new Date();
    }

    const [updatedQuote] = await db
      .update(quotes)
      .set(updateData)
      .where(and(eq(quotes.id, id), eq(quotes.userId, userId)))
      .returning();

    if (!updatedQuote) return res.status(404).json({ error: 'Devis non trouvé' });

    res.json(updatedQuote);
  } catch (error) {
    console.error('Erreur modification devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/quotes/:id/convert - Convertir un devis en facture
router.post('/:id/convert', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    // Récupérer le devis avec ses items
    const [quote] = await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.id, id), eq(quotes.userId, userId)));

    if (!quote) return res.status(404).json({ error: 'Devis non trouvé' });
    if (quote.convertedToInvoiceId) {
      return res.status(400).json({ error: 'Devis déjà converti en facture' });
    }

    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, id));

    // Créer la facture
    const year = new Date().getFullYear();
    const lastInvoice = await db
      .select({ invoiceNumber: invoices.invoiceNumber })
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt))
      .limit(1);

    let invoiceNum = 1;
    if (lastInvoice.length > 0) {
      const match = lastInvoice[0].invoiceNumber.match(/(\d+)$/);
      invoiceNum = match ? parseInt(match[1]) + 1 : 1;
    }
    const invoiceNumber = `FAC-${year}-${invoiceNum.toString().padStart(4, '0')}`;

    const [newInvoice] = await db
      .insert(invoices)
      .values({
        userId,
        clientId: quote.clientId,
        invoiceNumber,
        subtotal: quote.subtotal,
        vatRate: quote.vatRate,
        vatAmount: quote.vatAmount,
        total: quote.total,
        status: 'draft',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: quote.description,
        notes: quote.notes,
      })
      .returning();

    // Copier les items
    const invoiceItemsData = items.map((item, index) => ({
      invoiceId: newInvoice.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      sortOrder: index,
    }));

    await db.insert(invoiceItems).values(invoiceItemsData);

    // Mettre à jour le devis
    await db
      .update(quotes)
      .set({
        status: 'accepted',
        acceptedAt: new Date(),
        convertedToInvoiceId: newInvoice.id,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, id));

    res.json({ quote: { ...quote, convertedToInvoiceId: newInvoice.id }, invoice: newInvoice });
  } catch (error) {
    console.error('Erreur conversion devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/quotes/:id/duplicate - Dupliquer un devis
router.post('/:id/duplicate', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    // Récupérer le devis original
    const [originalQuote] = await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.id, id), eq(quotes.userId, userId)));

    if (!originalQuote) return res.status(404).json({ error: 'Devis non trouvé' });

    const items = await db
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, id));

    // Créer le nouveau devis
    const quoteNumber = await getNextQuoteNumber(userId);

    const [newQuote] = await db
      .insert(quotes)
      .values({
        userId,
        clientId: originalQuote.clientId,
        quoteNumber,
        subtotal: originalQuote.subtotal,
        vatRate: originalQuote.vatRate,
        vatAmount: originalQuote.vatAmount,
        total: originalQuote.total,
        status: 'draft',
        issueDate: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: originalQuote.description ? `Copie de ${originalQuote.description}` : `Copie du devis ${originalQuote.quoteNumber}`,
        notes: originalQuote.notes,
      })
      .returning();

    // Copier les items
    if (items.length > 0) {
      const newItems = items.map((item, index) => ({
        quoteId: newQuote.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        discount: item.discount,
        total: item.total,
        sortOrder: index,
      }));

      await db.insert(quoteItems).values(newItems);
    }

    res.status(201).json(newQuote);
  } catch (error) {
    console.error('Erreur duplication devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/quotes/:id/sign - Signer un devis (changer statut en accepté)
router.post('/:id/sign', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { signatureData } = req.body; // Base64 de la signature

    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const [updatedQuote] = await db
      .update(quotes)
      .set({
        status: 'accepted',
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(quotes.id, id), eq(quotes.userId, userId)))
      .returning();

    if (!updatedQuote) return res.status(404).json({ error: 'Devis non trouvé' });

    res.json(updatedQuote);
  } catch (error) {
    console.error('Erreur signature devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/quotes/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const [deletedQuote] = await db
      .delete(quotes)
      .where(and(eq(quotes.id, id), eq(quotes.userId, userId)))
      .returning();

    if (!deletedQuote) return res.status(404).json({ error: 'Devis non trouvé' });

    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
