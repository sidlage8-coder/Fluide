import { useState, useEffect, useCallback } from 'react';
import { invoicesApi } from '../lib/api';
import type { Invoice, CreateInvoiceData } from '../lib/api';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await invoicesApi.list();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const createInvoice = async (data: CreateInvoiceData) => {
    const newInvoice = await invoicesApi.create(data);
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = async (id: string, data: Partial<CreateInvoiceData> & { status?: Invoice['status'] }) => {
    const updated = await invoicesApi.update(id, data);
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updated } : inv));
    return updated;
  };

  const deleteInvoice = async (id: string) => {
    await invoicesApi.delete(id);
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const markAsPaid = async (id: string) => {
    return updateInvoice(id, { status: 'paid' });
  };

  const markAsSent = async (id: string) => {
    return updateInvoice(id, { status: 'sent' });
  };

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    markAsPaid,
    markAsSent,
  };
}
