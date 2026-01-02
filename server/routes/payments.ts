import { Router } from 'express';
import { db } from '../db';
import { payments, invoices, clients } from '../../src/db/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';

const router = Router();

// Calculer le total payé sur une facture
async function getTotalPaid(invoiceId: string): Promise<number> {
  const result = await db
    .select({ total: sql<string>`COALESCE(SUM(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId));
  
  return parseFloat(result[0]?.total || '0');
}

// Mettre à jour le statut de paiement d'une facture
async function updateInvoicePaymentStatus(invoiceId: string) {
  const [invoice] = await db
    .select({ total: invoices.total, status: invoices.status })
    .from(invoices)
    .where(eq(invoices.id, invoiceId));

  if (!invoice) return;

  const totalPaid = await getTotalPaid(invoiceId);
  const invoiceTotal = parseFloat(invoice.total);

  let paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
  let status = invoice.status;

  if (totalPaid >= invoiceTotal) {
    paymentStatus = 'paid';
    status = 'paid';
  } else if (totalPaid > 0) {
    paymentStatus = 'partial';
  } else {
    paymentStatus = 'unpaid';
  }

  await db
    .update(invoices)
    .set({
      paymentStatus,
      status,
      paidAt: paymentStatus === 'paid' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));
}

// GET /api/payments - Liste des paiements (avec filtres optionnels)
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const { invoiceId, startDate, endDate } = req.query;

    let query = db
      .select({
        id: payments.id,
        invoiceId: payments.invoiceId,
        invoiceNumber: invoices.invoiceNumber,
        clientName: clients.name,
        amount: payments.amount,
        method: payments.method,
        reference: payments.reference,
        notes: payments.notes,
        paymentDate: payments.paymentDate,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.paymentDate));

    const userPayments = await query;

    // Filtrer par facture si spécifié
    let filtered = userPayments;
    if (invoiceId) {
      filtered = filtered.filter(p => p.invoiceId === invoiceId);
    }

    res.json(filtered);
  } catch (error) {
    console.error('Erreur liste paiements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/payments/invoice/:invoiceId - Paiements d'une facture spécifique
router.get('/invoice/:invoiceId', async (req, res) => {
  try {
    const userId = req.userId;
    const { invoiceId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    // Vérifier que la facture appartient à l'utilisateur
    const [invoice] = await db
      .select({ id: invoices.id, total: invoices.total })
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));

    if (!invoice) return res.status(404).json({ error: 'Facture non trouvée' });

    const invoicePayments = await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .orderBy(desc(payments.paymentDate));

    const totalPaid = await getTotalPaid(invoiceId);
    const balanceDue = parseFloat(invoice.total) - totalPaid;

    res.json({
      payments: invoicePayments,
      summary: {
        invoiceTotal: parseFloat(invoice.total),
        totalPaid,
        balanceDue,
      },
    });
  } catch (error) {
    console.error('Erreur paiements facture:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/payments - Enregistrer un paiement
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const { invoiceId, amount, method, reference, notes, paymentDate } = req.body;

    if (!invoiceId || !amount || !method) {
      return res.status(400).json({ error: 'Facture, montant et méthode requis' });
    }

    // Vérifier que la facture appartient à l'utilisateur
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));

    if (!invoice) return res.status(404).json({ error: 'Facture non trouvée' });

    // Vérifier qu'on ne dépasse pas le montant dû
    const totalPaid = await getTotalPaid(invoiceId);
    const invoiceTotal = parseFloat(invoice.total);
    const balanceDue = invoiceTotal - totalPaid;

    if (parseFloat(amount) > balanceDue + 0.01) { // Tolérance de 1 centime
      return res.status(400).json({ 
        error: `Le montant dépasse le reste à payer (${balanceDue.toFixed(2)} €)` 
      });
    }

    // Créer le paiement
    const [newPayment] = await db
      .insert(payments)
      .values({
        userId,
        invoiceId,
        amount: parseFloat(amount).toFixed(2),
        method,
        reference,
        notes,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      })
      .returning();

    // Mettre à jour le statut de la facture
    await updateInvoicePaymentStatus(invoiceId);

    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Erreur création paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/payments/:id - Supprimer un paiement
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    // Récupérer le paiement pour avoir l'invoiceId
    const [payment] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.id, id), eq(payments.userId, userId)));

    if (!payment) return res.status(404).json({ error: 'Paiement non trouvé' });

    // Supprimer
    await db.delete(payments).where(eq(payments.id, id));

    // Mettre à jour le statut de la facture
    await updateInvoicePaymentStatus(payment.invoiceId);

    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/payments/stats - Statistiques de trésorerie
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // CA encaissé ce mois
    const encaisseResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${payments.amount}), 0)` })
      .from(payments)
      .where(and(
        eq(payments.userId, userId),
        gte(payments.paymentDate, startOfMonth),
        lte(payments.paymentDate, endOfMonth)
      ));

    // CA facturé ce mois (factures créées)
    const factureResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        eq(invoices.invoiceType, 'invoice'),
        gte(invoices.issueDate, startOfMonth),
        lte(invoices.issueDate, endOfMonth)
      ));

    // En attente de paiement (factures envoyées non payées)
    const attenteResult = await db
      .select({ total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        eq(invoices.invoiceType, 'invoice'),
        sql`${invoices.paymentStatus} IN ('unpaid', 'partial')`
      ));

    // Factures en retard
    const overdueResult = await db
      .select({ 
        count: sql<number>`COUNT(*)`,
        total: sql<string>`COALESCE(SUM(${invoices.total}), 0)` 
      })
      .from(invoices)
      .where(and(
        eq(invoices.userId, userId),
        eq(invoices.invoiceType, 'invoice'),
        eq(invoices.paymentStatus, 'overdue')
      ));

    // Paiements récents (5 derniers)
    const recentPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        method: payments.method,
        paymentDate: payments.paymentDate,
        invoiceNumber: invoices.invoiceNumber,
        clientName: clients.name,
      })
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.paymentDate))
      .limit(5);

    res.json({
      month: {
        encaisse: parseFloat(encaisseResult[0]?.total || '0'),
        facture: parseFloat(factureResult[0]?.total || '0'),
      },
      enAttente: parseFloat(attenteResult[0]?.total || '0'),
      overdue: {
        count: Number(overdueResult[0]?.count || 0),
        total: parseFloat(overdueResult[0]?.total || '0'),
      },
      recentPayments,
    });
  } catch (error) {
    console.error('Erreur stats trésorerie:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
