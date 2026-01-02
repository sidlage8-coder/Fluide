import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, User, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GlassPanel } from '../components/ui';

interface LoginProps {
  onSuccess: () => void;
}

export function Login({ onSuccess }: LoginProps) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let result;
      if (isRegister) {
        result = await register(email, password, name);
      } else {
        result = await login(email, password);
      }

      if (result.error) {
        setError(result.error);
      } else {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void-black flex items-center justify-center p-4">
      {/* Background Grid */}
      <div className="fixed inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,240,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,240,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassPanel variant="highlight" glow className="p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-cyan/20 border border-neon-cyan/50 flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-neon-cyan/50 animate-pulse" />
            </motion.div>
            <h1 className="font-mono text-2xl font-bold text-white tracking-wider">
              ORBITAL COMMAND
            </h1>
            <p className="font-mono text-xs text-white/50 tracking-widest mt-2">
              {isRegister ? 'CRÉER UN COMPTE' : 'AUTHENTIFICATION REQUISE'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-3 rounded bg-neon-orange/10 border border-neon-orange/30 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-neon-orange" />
              <span className="font-mono text-sm text-neon-orange">{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block font-mono text-xs text-white/50 tracking-widest mb-2">
                  NOM D'OPÉRATEUR
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded pl-10 pr-4 py-3 font-mono text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                    placeholder="Commander"
                    required={isRegister}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block font-mono text-xs text-white/50 tracking-widest mb-2">
                IDENTIFIANT
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded pl-10 pr-4 py-3 font-mono text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                  placeholder="commander@orbital.io"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-white/50 tracking-widest mb-2">
                CODE D'ACCÈS
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded pl-10 pr-4 py-3 font-mono text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 py-3 rounded font-mono text-sm tracking-widest bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  CONNEXION EN COURS...
                </>
              ) : (
                isRegister ? 'INITIALISER COMPTE' : 'ACCÉDER AU SYSTÈME'
              )}
            </motion.button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="font-mono text-xs text-white/50 hover:text-neon-cyan transition-colors"
            >
              {isRegister ? 'DÉJÀ ENREGISTRÉ ? CONNEXION' : 'NOUVEL OPÉRATEUR ? INSCRIPTION'}
            </button>
          </div>

          {/* Status */}
          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="font-mono text-xs text-white/30 tracking-widest">
              SYSTÈME OPÉRATIONNEL
            </span>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
