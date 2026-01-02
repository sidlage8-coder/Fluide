import { Router } from 'express';
import { db } from '../db';
import { clients } from '../../src/db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// GET /api/clients - Liste des clients de l'utilisateur
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const userClients = await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(clients.createdAt);

    res.json(userClients);
  } catch (error) {
    console.error('Erreur liste clients:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/clients/:id - Détail d'un client
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json(client);
  } catch (error) {
    console.error('Erreur détail client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/clients - Créer un client
router.post('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { 
      name, email, phone, company, address, city, postalCode, country, 
      siret, vatNumber, notes, clientType, parentCompanyId, firstName, 
      lastName, jobTitle, legalForm, capital, rcs 
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }

    const [newClient] = await db
      .insert(clients)
      .values({
        userId,
        name,
        email,
        phone,
        company,
        address,
        city,
        postalCode,
        country: country || 'France',
        siret,
        vatNumber,
        notes,
        status: 'active',
        clientType: clientType || 'company',
        parentCompanyId,
        firstName,
        lastName,
        jobTitle,
        legalForm,
        capital,
        rcs,
      })
      .returning();

    res.status(201).json(newClient);
  } catch (error) {
    console.error('Erreur création client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/clients/:id - Modifier un client
router.put('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { 
      name, email, phone, company, address, city, postalCode, country, 
      siret, vatNumber, status, notes, clientType, parentCompanyId, 
      firstName, lastName, jobTitle, legalForm, capital, rcs 
    } = req.body;

    const [updatedClient] = await db
      .update(clients)
      .set({
        name,
        email,
        phone,
        company,
        address,
        city,
        postalCode,
        country,
        siret,
        vatNumber,
        status,
        notes,
        clientType,
        parentCompanyId,
        firstName,
        lastName,
        jobTitle,
        legalForm,
        capital,
        rcs,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();

    if (!updatedClient) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json(updatedClient);
  } catch (error) {
    console.error('Erreur modification client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/clients/:id - Supprimer un client
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const [deletedClient] = await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();

    if (!deletedClient) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json({ success: true, id });
  } catch (error) {
    console.error('Erreur suppression client:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
