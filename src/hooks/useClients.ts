import { useState, useEffect, useCallback } from 'react';
import { clientsApi } from '../lib/api';
import type { Client, CreateClientData } from '../lib/api';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientsApi.list();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = async (data: CreateClientData) => {
    const newClient = await clientsApi.create(data);
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = async (id: string, data: Partial<Client>) => {
    const updated = await clientsApi.update(id, data);
    setClients(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const deleteClient = async (id: string) => {
    await clientsApi.delete(id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}
