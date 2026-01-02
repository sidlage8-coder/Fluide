import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, FileText, ClipboardList, ArrowRight, Loader2 } from 'lucide-react';
import { clientsApi, invoicesApi, quotesApi } from '../../lib/api';
import type { Client, Invoice, Quote } from '../../lib/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, id?: string) => void;
}

interface SearchResult {
  type: 'client' | 'invoice' | 'quote';
  id: string;
  title: string;
  subtitle: string;
  tab: string;
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const q = searchQuery.toLowerCase();
      const searchResults: SearchResult[] = [];

      // Search clients
      const clients = await clientsApi.list();
      clients
        .filter((c: Client) => 
          c.name.toLowerCase().includes(q) || 
          c.email?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q)
        )
        .slice(0, 5)
        .forEach((c: Client) => {
          searchResults.push({
            type: 'client',
            id: c.id,
            title: c.name,
            subtitle: c.company || c.email || 'Client',
            tab: 'clients',
          });
        });

      // Search invoices
      const invoices = await invoicesApi.list();
      invoices
        .filter((inv: Invoice) => 
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clientName?.toLowerCase().includes(q)
        )
        .slice(0, 5)
        .forEach((inv: Invoice) => {
          searchResults.push({
            type: 'invoice',
            id: inv.id,
            title: `#${inv.invoiceNumber}`,
            subtitle: `${inv.clientName || 'Client'} • ${parseFloat(inv.total).toLocaleString('fr-FR')} €`,
            tab: 'invoices',
          });
        });

      // Search quotes
      const quotes = await quotesApi.list();
      quotes
        .filter((q: Quote) => 
          q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .forEach((quote: Quote) => {
          searchResults.push({
            type: 'quote',
            id: quote.id,
            title: `#${quote.quoteNumber}`,
            subtitle: `${quote.clientName || 'Client'} • ${parseFloat(quote.total).toLocaleString('fr-FR')} €`,
            tab: 'quotes',
          });
        });

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    onNavigate(result.tab, result.id);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'client': return <User size={16} className="text-neon-cyan" />;
      case 'invoice': return <FileText size={16} className="text-emerald-400" />;
      case 'quote': return <ClipboardList size={16} className="text-purple-400" />;
      default: return <Search size={16} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'client': return 'Client';
      case 'invoice': return 'Facture';
      case 'quote': return 'Devis';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="w-full max-w-xl bg-void-gray border border-glass-border rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-glass-border">
            <Search size={20} className="text-white/40" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher clients, factures, devis..."
              className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-white/30"
              autoComplete="off"
            />
            {loading && <Loader2 size={20} className="text-neon-cyan animate-spin" />}
            <div className="flex items-center gap-1 text-xs text-white/30">
              <kbd className="px-1.5 py-0.5 bg-void-dark rounded border border-glass-border font-mono">ESC</kbd>
              <span>fermer</span>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {query && results.length === 0 && !loading && (
              <div className="p-8 text-center text-white/40">
                <Search size={32} className="mx-auto mb-3 opacity-50" />
                <p>Aucun résultat pour "{query}"</p>
              </div>
            )}

            {!query && (
              <div className="p-6 text-center text-white/40">
                <p className="text-sm">Commencez à taper pour rechercher</p>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                  <span className="flex items-center gap-1">
                    <User size={12} /> Clients
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={12} /> Factures
                  </span>
                  <span className="flex items-center gap-1">
                    <ClipboardList size={12} /> Devis
                  </span>
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => (
                  <motion.button
                    key={`${result.type}-${result.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelect(result); }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                      ${selectedIndex === index ? 'bg-neon-cyan/10' : 'hover:bg-glass-secondary'}
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${selectedIndex === index ? 'bg-neon-cyan/20' : 'bg-glass-primary'}
                    `}>
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{result.title}</p>
                      <p className="text-sm text-white/50 truncate">{result.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/30 px-2 py-0.5 bg-glass-primary rounded">
                        {getTypeLabel(result.type)}
                      </span>
                      {selectedIndex === index && (
                        <ArrowRight size={16} className="text-neon-cyan" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-glass-border bg-void-dark/50">
            <div className="flex items-center gap-4 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-void-dark rounded border border-glass-border font-mono">↑↓</kbd>
                naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-void-dark rounded border border-glass-border font-mono">↵</kbd>
                ouvrir
              </span>
            </div>
            <span className="text-xs text-white/20">
              {results.length > 0 && `${results.length} résultat${results.length > 1 ? 's' : ''}`}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
