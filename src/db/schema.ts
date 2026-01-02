import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const clientStatusEnum = pgEnum('client_status', ['active', 'pending', 'inactive']);
export const clientTypeEnum = pgEnum('client_type', ['company', 'individual']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'paid', 'overdue', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'partial', 'paid', 'overdue']);
export const invoiceTypeEnum = pgEnum('invoice_type', ['invoice', 'credit_note']);
export const quoteStatusEnum = pgEnum('quote_status', ['draft', 'sent', 'accepted', 'rejected', 'expired']);
export const paymentMethodEnum = pgEnum('payment_method', ['bank_transfer', 'card', 'cash', 'check', 'other']);

// ============================================
// USERS TABLE (pour Better-Auth)
// ============================================

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  passwordHash: text('password_hash'),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// SESSIONS TABLE (pour Better-Auth)
// ============================================

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// ACCOUNTS TABLE (pour Better-Auth OAuth)
// ============================================

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// VERIFICATIONS TABLE (pour Better-Auth)
// ============================================

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// CLIENTS TABLE
// ============================================

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Type: entreprise ou individu
  clientType: clientTypeEnum('client_type').default('company').notNull(),
  parentCompanyId: uuid('parent_company_id'), // Pour lier un individu à une entreprise
  
  // Informations de base
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  
  // Informations individuelles
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  jobTitle: varchar('job_title', { length: 100 }),
  
  // Adresse
  address: text('address'),
  city: varchar('city', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('France'),
  
  // Informations légales (entreprises)
  siret: varchar('siret', { length: 14 }),
  vatNumber: varchar('vat_number', { length: 20 }),
  legalForm: varchar('legal_form', { length: 50 }), // SARL, SAS, etc.
  capital: decimal('capital', { precision: 12, scale: 2 }),
  rcs: varchar('rcs', { length: 100 }), // RCS Ville
  
  // Statut et métadonnées Orbital
  status: clientStatusEnum('status').default('active').notNull(),
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).default('0'),
  invoiceCount: integer('invoice_count').default(0),
  
  // Position radar (pour la vue Radar)
  radarAngle: integer('radar_angle').default(0), // 0-360
  radarDistance: integer('radar_distance').default(50), // 0-100
  
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// INVOICES TABLE
// ============================================

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  
  // Numérotation
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  
  // Type de document (facture ou avoir)
  invoiceType: invoiceTypeEnum('invoice_type').default('invoice').notNull(),
  relatedInvoiceId: uuid('related_invoice_id'), // Pour les avoirs: référence à la facture originale
  
  // Montants
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  vatRate: decimal('vat_rate', { precision: 5, scale: 2 }).default('20.00'),
  vatAmount: decimal('vat_amount', { precision: 12, scale: 2 }).notNull(),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  
  // Statuts
  status: invoiceStatusEnum('status').default('draft').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('unpaid').notNull(),
  isFinalized: boolean('is_finalized').default(false).notNull(), // Une fois true, immutable
  
  // Dates
  issueDate: timestamp('issue_date').defaultNow().notNull(),
  dueDate: timestamp('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  finalizedAt: timestamp('finalized_at'), // Date de verrouillage
  
  // Contenu
  description: text('description'),
  notes: text('notes'),
  
  // Métadonnées
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// INVOICE ITEMS TABLE
// ============================================

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// QUOTES TABLE (Devis)
// ============================================

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  
  quoteNumber: varchar('quote_number', { length: 50 }).notNull(),
  
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  vatRate: decimal('vat_rate', { precision: 5, scale: 2 }).default('20.00'),
  vatAmount: decimal('vat_amount', { precision: 12, scale: 2 }).notNull(),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  
  status: quoteStatusEnum('status').default('draft').notNull(),
  issueDate: timestamp('issue_date').defaultNow().notNull(),
  validUntil: timestamp('valid_until').notNull(),
  acceptedAt: timestamp('accepted_at'),
  
  description: text('description'),
  notes: text('notes'),
  
  convertedToInvoiceId: uuid('converted_to_invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// QUOTE ITEMS TABLE
// ============================================

export const quoteItems = pgTable('quote_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  vatRate: decimal('vat_rate', { precision: 5, scale: 2 }).default('20.00'),
  discount: decimal('discount', { precision: 5, scale: 2 }).default('0'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// PAYMENTS TABLE (Paiements reçus sur factures)
// ============================================

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum('method').notNull(),
  reference: varchar('reference', { length: 100 }), // Référence transaction bancaire
  notes: text('notes'),
  
  paymentDate: timestamp('payment_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// TRANSACTIONS TABLE (pour le suivi trésorerie)
// ============================================

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
  
  type: varchar('type', { length: 20 }).notNull(), // 'income', 'expense', 'urssaf', 'tva'
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  
  transactionDate: timestamp('transaction_date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  clients: many(clients),
  invoices: many(invoices),
  quotes: many(quotes),
  payments: many(payments),
  transactions: many(transactions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  invoices: many(invoices),
  quotes: many(quotes),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  items: many(invoiceItems),
  payments: many(payments),
  transactions: many(transactions),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [transactions.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
}));

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  user: one(users, {
    fields: [quotes.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [quotes.clientId],
    references: [clients.id],
  }),
  items: many(quoteItems),
  convertedInvoice: one(invoices, {
    fields: [quotes.convertedToInvoiceId],
    references: [invoices.id],
  }),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteItems.quoteId],
    references: [quotes.id],
  }),
}));

// ============================================
// TYPES EXPORTÉS
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;

// ============================================
// DOCUMENT SETTINGS TABLE (Thèmes & Mentions légales)
// ============================================

export const documentSettings = pgTable('document_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Informations entreprise (pour les factures/devis)
  companyName: varchar('company_name', { length: 255 }),
  companyLogo: text('company_logo'), // URL ou base64
  companyAddress: text('company_address'),
  companyCity: varchar('company_city', { length: 100 }),
  companyPostalCode: varchar('company_postal_code', { length: 20 }),
  companyCountry: varchar('company_country', { length: 100 }).default('France'),
  companyPhone: varchar('company_phone', { length: 50 }),
  companyEmail: varchar('company_email', { length: 255 }),
  companyWebsite: varchar('company_website', { length: 255 }),
  
  // Informations légales
  siret: varchar('siret', { length: 14 }),
  vatNumber: varchar('vat_number', { length: 20 }),
  legalForm: varchar('legal_form', { length: 50 }),
  capital: varchar('capital', { length: 50 }),
  rcs: varchar('rcs', { length: 100 }),
  apeCode: varchar('ape_code', { length: 10 }),
  
  // Mentions légales personnalisées
  invoiceMentions: text('invoice_mentions'),
  quoteMentions: text('quote_mentions'),
  paymentTerms: text('payment_terms'),
  latePaymentTerms: text('late_payment_terms'),
  
  // Thème factures
  invoiceTheme: text('invoice_theme').default('modern'), // modern, classic, minimal, bold
  invoicePrimaryColor: varchar('invoice_primary_color', { length: 7 }).default('#0ea5e9'),
  invoiceSecondaryColor: varchar('invoice_secondary_color', { length: 7 }).default('#64748b'),
  invoiceAccentColor: varchar('invoice_accent_color', { length: 7 }).default('#10b981'),
  invoiceFontFamily: varchar('invoice_font_family', { length: 100 }).default('Inter'),
  invoiceLogoPosition: varchar('invoice_logo_position', { length: 20 }).default('left'), // left, center, right
  invoiceShowWatermark: boolean('invoice_show_watermark').default(false),
  invoiceWatermarkText: varchar('invoice_watermark_text', { length: 100 }),
  invoiceHeaderStyle: varchar('invoice_header_style', { length: 20 }).default('full'), // full, minimal, none
  invoiceTableStyle: varchar('invoice_table_style', { length: 20 }).default('striped'), // striped, bordered, minimal
  
  // Thème devis
  quoteTheme: text('quote_theme').default('modern'),
  quotePrimaryColor: varchar('quote_primary_color', { length: 7 }).default('#8b5cf6'),
  quoteSecondaryColor: varchar('quote_secondary_color', { length: 7 }).default('#64748b'),
  quoteAccentColor: varchar('quote_accent_color', { length: 7 }).default('#f59e0b'),
  quoteFontFamily: varchar('quote_font_family', { length: 100 }).default('Inter'),
  quoteLogoPosition: varchar('quote_logo_position', { length: 20 }).default('left'),
  quoteShowWatermark: boolean('quote_show_watermark').default(false),
  quoteWatermarkText: varchar('quote_watermark_text', { length: 100 }),
  quoteHeaderStyle: varchar('quote_header_style', { length: 20 }).default('full'),
  quoteTableStyle: varchar('quote_table_style', { length: 20 }).default('striped'),
  
  // Numérotation
  invoicePrefix: varchar('invoice_prefix', { length: 20 }).default('FAC'),
  invoiceStartNumber: integer('invoice_start_number').default(1),
  quotePrefix: varchar('quote_prefix', { length: 20 }).default('DEV'),
  quoteStartNumber: integer('quote_start_number').default(1),
  numberingFormat: varchar('numbering_format', { length: 50 }).default('{PREFIX}-{YEAR}-{NUMBER}'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type DocumentSettings = typeof documentSettings.$inferSelect;
export type NewDocumentSettings = typeof documentSettings.$inferInsert;

export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
