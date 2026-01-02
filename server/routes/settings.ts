import { Router } from 'express';
import { db } from '../db';
import { documentSettings } from '../../src/db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/settings - Récupérer les paramètres
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const [settings] = await db
      .select()
      .from(documentSettings)
      .where(eq(documentSettings.userId, userId));

    if (!settings) {
      // Créer les paramètres par défaut
      const [newSettings] = await db
        .insert(documentSettings)
        .values({ userId })
        .returning();
      return res.json(newSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/settings - Mettre à jour les paramètres
router.put('/', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;

    // Vérifier si les paramètres existent
    const [existing] = await db
      .select()
      .from(documentSettings)
      .where(eq(documentSettings.userId, userId));

    let result;
    if (existing) {
      [result] = await db
        .update(documentSettings)
        .set(updateData)
        .where(eq(documentSettings.userId, userId))
        .returning();
    } else {
      [result] = await db
        .insert(documentSettings)
        .values({ userId, ...updateData })
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error('Erreur mise à jour paramètres:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/settings/company - Mettre à jour les infos entreprise
router.put('/company', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const {
      companyName, companyLogo, companyAddress, companyCity, companyPostalCode,
      companyCountry, companyPhone, companyEmail, companyWebsite,
      siret, vatNumber, legalForm, capital, rcs, apeCode
    } = req.body;

    const [existing] = await db
      .select()
      .from(documentSettings)
      .where(eq(documentSettings.userId, userId));

    const updateData = {
      companyName, companyLogo, companyAddress, companyCity, companyPostalCode,
      companyCountry, companyPhone, companyEmail, companyWebsite,
      siret, vatNumber, legalForm, capital, rcs, apeCode,
      updatedAt: new Date()
    };

    let result;
    if (existing) {
      [result] = await db
        .update(documentSettings)
        .set(updateData)
        .where(eq(documentSettings.userId, userId))
        .returning();
    } else {
      [result] = await db
        .insert(documentSettings)
        .values({ userId, ...updateData })
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error('Erreur mise à jour entreprise:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/settings/legal - Mettre à jour les mentions légales
router.put('/legal', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const { invoiceMentions, quoteMentions, paymentTerms, latePaymentTerms } = req.body;

    const [existing] = await db
      .select()
      .from(documentSettings)
      .where(eq(documentSettings.userId, userId));

    const updateData = {
      invoiceMentions, quoteMentions, paymentTerms, latePaymentTerms,
      updatedAt: new Date()
    };

    let result;
    if (existing) {
      [result] = await db
        .update(documentSettings)
        .set(updateData)
        .where(eq(documentSettings.userId, userId))
        .returning();
    } else {
      [result] = await db
        .insert(documentSettings)
        .values({ userId, ...updateData })
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error('Erreur mise à jour mentions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/settings/theme/invoice - Mettre à jour le thème factures
router.put('/theme/invoice', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const {
      invoiceTheme, invoicePrimaryColor, invoiceSecondaryColor, invoiceAccentColor,
      invoiceFontFamily, invoiceLogoPosition, invoiceShowWatermark, invoiceWatermarkText,
      invoiceHeaderStyle, invoiceTableStyle
    } = req.body;

    const [existing] = await db
      .select()
      .from(documentSettings)
      .where(eq(documentSettings.userId, userId));

    const updateData = {
      invoiceTheme, invoicePrimaryColor, invoiceSecondaryColor, invoiceAccentColor,
      invoiceFontFamily, invoiceLogoPosition, invoiceShowWatermark, invoiceWatermarkText,
      invoiceHeaderStyle, invoiceTableStyle,
      updatedAt: new Date()
    };

    let result;
    if (existing) {
      [result] = await db
        .update(documentSettings)
        .set(updateData)
        .where(eq(documentSettings.userId, userId))
        .returning();
    } else {
      [result] = await db
        .insert(documentSettings)
        .values({ userId, ...updateData })
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error('Erreur mise à jour thème factures:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/settings/theme/quote - Mettre à jour le thème devis
router.put('/theme/quote', async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Non authentifié' });

    const {
      quoteTheme, quotePrimaryColor, quoteSecondaryColor, quoteAccentColor,
      quoteFontFamily, quoteLogoPosition, quoteShowWatermark, quoteWatermarkText,
      quoteHeaderStyle, quoteTableStyle
    } = req.body;

    const [existing] = await db
      .select()
      .from(documentSettings)
      .where(eq(documentSettings.userId, userId));

    const updateData = {
      quoteTheme, quotePrimaryColor, quoteSecondaryColor, quoteAccentColor,
      quoteFontFamily, quoteLogoPosition, quoteShowWatermark, quoteWatermarkText,
      quoteHeaderStyle, quoteTableStyle,
      updatedAt: new Date()
    };

    let result;
    if (existing) {
      [result] = await db
        .update(documentSettings)
        .set(updateData)
        .where(eq(documentSettings.userId, userId))
        .returning();
    } else {
      [result] = await db
        .insert(documentSettings)
        .values({ userId, ...updateData })
        .returning();
    }

    res.json(result);
  } catch (error) {
    console.error('Erreur mise à jour thème devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
