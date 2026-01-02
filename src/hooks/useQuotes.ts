import { useState, useEffect, useCallback } from 'react';
import { quotesApi } from '../lib/api';
import type { Quote, CreateQuoteData } from '../lib/api';

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quotesApi.list();
      setQuotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const createQuote = async (data: CreateQuoteData) => {
    const newQuote = await quotesApi.create(data);
    setQuotes(prev => [newQuote, ...prev]);
    return newQuote;
  };

  const updateQuote = async (id: string, data: Partial<CreateQuoteData> & { status?: Quote['status'] }) => {
    const updated = await quotesApi.update(id, data);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updated } : q));
    return updated;
  };

  const deleteQuote = async (id: string) => {
    await quotesApi.delete(id);
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const convertToInvoice = async (id: string) => {
    const result = await quotesApi.convertToInvoice(id);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'accepted' as const, convertedToInvoiceId: result.invoice.id } : q));
    return result;
  };

  return {
    quotes,
    loading,
    error,
    refetch: fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    convertToInvoice,
  };
}
