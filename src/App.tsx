import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ParallaxGrid } from './components/dashboard';
import { Sidebar, Header } from './components/layout';
import { CommandPalette, GameHUD, GameProvider } from './components/ui';
import { Dashboard, Clients, Invoices, Quotes, Treasury, Settings, URSSAF, Login } from './pages';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const pageConfig = {
  dashboard: { title: 'TACTICAL OVERVIEW', subtitle: 'Vue d\'ensemble opérationnelle' },
  clients: { title: 'RADAR VIEW', subtitle: 'Gestion des contacts' },
  quotes: { title: 'PROPOSITIONS', subtitle: 'Devis & Estimations' },
  invoices: { title: 'ARMURERIE', subtitle: 'Facturation' },
  treasury: { title: 'TRÉSORERIE', subtitle: 'Paiements & Encaissements' },
  settings: { title: 'PARAMÈTRES', subtitle: 'Configuration & Thèmes' },
  urssaf: { title: 'ZONE DE MENACE', subtitle: 'URSSAF & TVA' },
};

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setCommandPaletteOpen(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan animate-spin" />
          <p className="font-mono text-sm text-white/50 tracking-widest">INITIALISATION...</p>
        </div>
      </div>
    );
  }

  // Login screen if not authenticated
  if (!isAuthenticated) {
    return <Login onSuccess={() => window.location.reload()} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'quotes':
        return <Quotes />;
      case 'invoices':
        return <Invoices />;
      case 'treasury':
        return <Treasury />;
      case 'settings':
        return <Settings />;
      case 'urssaf':
        return <URSSAF />;
      default:
        return <Dashboard />;
    }
  };

  const currentPage = pageConfig[activeTab as keyof typeof pageConfig];

  return (
    <div className="min-h-screen bg-void-black text-white overflow-hidden">
      {/* Background Grid */}
      <ParallaxGrid />
      
      {/* Game HUD - Top bar with XP, stats, notifications */}
      <GameHUD />
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <main className="ml-20 pt-12 h-screen flex flex-col">
        <Header title={currentPage.title} subtitle={currentPage.subtitle} />
        
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
