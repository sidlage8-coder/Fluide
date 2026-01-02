const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('/api') ? `${API_BASE_URL}${endpoint}` : endpoint;
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(error.error || 'Erreur serveur');
  }

  return response.json();
}

// ============================================
// CLIENTS API
// ============================================

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  siret: string | null;
  vatNumber: string | null;
  status: 'active' | 'pending' | 'inactive';
  totalRevenue: string | null;
  invoiceCount: number | null;
  clientType: 'company' | 'individual';
  parentCompanyId: string | null;
  firstName: string | null;
  lastName: string | null;
  jobTitle: string | null;
  legalForm: string | null;
  capital: string | null;
  rcs: string | null;
  radarAngle: number | null;
  radarDistance: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  siret?: string;
  vatNumber?: string;
  notes?: string;
  clientType?: 'company' | 'individual';
  parentCompanyId?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  legalForm?: string;
  capital?: string;
  rcs?: string;
}

export const clientsApi = {
  list: () => fetchApi<Client[]>('/api/clients'),
  get: (id: string) => fetchApi<Client>(`/api/clients/${id}`),
  create: (data: CreateClientData) => fetchApi<Client>('/api/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<Client>) => fetchApi<Client>(`/api/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/clients/${id}`, {
    method: 'DELETE',
  }),
};

// ============================================
// INVOICES API
// ============================================

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'invoice' | 'credit_note';
  relatedInvoiceId: string | null;
  clientId: string;
  clientName: string | null;
  clientEmail?: string | null;
  clientAddress?: string | null;
  clientCity?: string | null;
  clientPostalCode?: string | null;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  total: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
  isFinalized: boolean;
  issueDate: string;
  dueDate: string;
  paidAt: string | null;
  finalizedAt: string | null;
  description: string | null;
  notes?: string | null;
  items?: InvoiceItem[];
  createdAt: string;
}

export interface CreateInvoiceData {
  clientId: string;
  items: InvoiceItem[];
  vatRate?: number;
  dueDate?: string;
  description?: string;
  notes?: string;
}

export const invoicesApi = {
  list: () => fetchApi<Invoice[]>('/api/invoices'),
  get: (id: string) => fetchApi<Invoice>(`/api/invoices/${id}`),
  create: (data: CreateInvoiceData) => fetchApi<Invoice>('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<CreateInvoiceData> & { status?: Invoice['status']; paymentStatus?: string }) => 
    fetchApi<Invoice>(`/api/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/invoices/${id}`, {
    method: 'DELETE',
  }),
  finalize: (id: string) => fetchApi<Invoice>(`/api/invoices/${id}/finalize`, {
    method: 'POST',
  }),
  createCreditNote: (id: string) => fetchApi<Invoice>(`/api/invoices/${id}/credit-note`, {
    method: 'POST',
  }),
  updatePayment: (id: string, paymentStatus: string) => fetchApi<Invoice>(`/api/invoices/${id}/payment`, {
    method: 'PUT',
    body: JSON.stringify({ paymentStatus }),
  }),
  convertToQuote: (id: string) => fetchApi<{ success: boolean; quote: Quote }>(`/api/invoices/${id}/convert-to-quote`, {
    method: 'POST',
  }),
};

// ============================================
// QUOTES API
// ============================================

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientName: string | null;
  clientEmail?: string | null;
  clientAddress?: string | null;
  clientCity?: string | null;
  clientPostalCode?: string | null;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  total: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  issueDate: string;
  validUntil: string;
  acceptedAt: string | null;
  description: string | null;
  notes?: string | null;
  convertedToInvoiceId: string | null;
  items?: InvoiceItem[];
  createdAt: string;
}

export interface CreateQuoteData {
  clientId: string;
  items: InvoiceItem[];
  vatRate?: number;
  validUntil?: string;
  description?: string;
  notes?: string;
}

export interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate?: number;
  discount?: number;
  total?: number;
}

// ============================================
// PAYMENTS API
// ============================================

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  clientName?: string;
  amount: string;
  method: 'bank_transfer' | 'card' | 'cash' | 'check' | 'other';
  reference: string | null;
  notes: string | null;
  paymentDate: string;
  createdAt: string;
}

export interface PaymentStats {
  month: {
    encaisse: number;
    facture: number;
  };
  enAttente: number;
  overdue: {
    count: number;
    total: number;
  };
  recentPayments: Payment[];
}

export interface InvoicePayments {
  payments: Payment[];
  summary: {
    invoiceTotal: number;
    totalPaid: number;
    balanceDue: number;
  };
}

export const paymentsApi = {
  list: () => fetchApi<Payment[]>('/api/payments'),
  getByInvoice: (invoiceId: string) => fetchApi<InvoicePayments>(`/api/payments/invoice/${invoiceId}`),
  create: (data: { invoiceId: string; amount: number; method: string; reference?: string; notes?: string; paymentDate?: string }) => 
    fetchApi<Payment>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/payments/${id}`, {
    method: 'DELETE',
  }),
  getStats: () => fetchApi<PaymentStats>('/api/payments/stats'),
};

export const quotesApi = {
  list: () => fetchApi<Quote[]>('/api/quotes'),
  get: (id: string) => fetchApi<Quote>(`/api/quotes/${id}`),
  create: (data: CreateQuoteData) => fetchApi<Quote>('/api/quotes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Partial<CreateQuoteData> & { status?: Quote['status'] }) => 
    fetchApi<Quote>(`/api/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchApi<{ success: boolean }>(`/api/quotes/${id}`, {
    method: 'DELETE',
  }),
  convertToInvoice: (id: string) => fetchApi<{ quote: Quote; invoice: Invoice }>(`/api/quotes/${id}/convert`, {
    method: 'POST',
  }),
  duplicate: (id: string) => fetchApi<Quote>(`/api/quotes/${id}/duplicate`, {
    method: 'POST',
  }),
  sign: (id: string, signatureData?: string) => fetchApi<Quote>(`/api/quotes/${id}/sign`, {
    method: 'POST',
    body: JSON.stringify({ signatureData }),
  }),
};
