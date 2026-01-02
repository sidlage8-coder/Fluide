import { useState, useEffect, useCallback } from 'react';
import { paymentsApi } from '../lib/api';
import type { Payment, PaymentStats, InvoicePayments } from '../lib/api';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [paymentsData, statsData] = await Promise.all([
        paymentsApi.list(),
        paymentsApi.getStats(),
      ]);
      setPayments(paymentsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const createPayment = async (data: { invoiceId: string; amount: number; method: string; reference?: string; notes?: string; paymentDate?: string }) => {
    const newPayment = await paymentsApi.create(data);
    await fetchPayments(); // Refresh to get updated stats
    return newPayment;
  };

  const deletePayment = async (id: string) => {
    await paymentsApi.delete(id);
    await fetchPayments();
  };

  return {
    payments,
    stats,
    loading,
    error,
    refetch: fetchPayments,
    createPayment,
    deletePayment,
  };
}

export function useInvoicePayments(invoiceId: string | null) {
  const [data, setData] = useState<InvoicePayments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    if (!invoiceId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await paymentsApi.getByInvoice(invoiceId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const addPayment = async (paymentData: { amount: number; method: string; reference?: string; notes?: string; paymentDate?: string }) => {
    if (!invoiceId) return;
    await paymentsApi.create({ invoiceId, ...paymentData });
    await fetchPayments();
  };

  const removePayment = async (id: string) => {
    await paymentsApi.delete(id);
    await fetchPayments();
  };

  return {
    data,
    loading,
    error,
    refetch: fetchPayments,
    addPayment,
    removePayment,
  };
}
