import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, TrendingUp, Shield } from 'lucide-react';
import { GlassPanel } from '../components/ui';

const mockData = {
  quarterlyRevenue: 25500,
  rate: 0.22,
  urssafDue: 5610,
  vatCollected: 5100,
  vatDeductible: 1200,
  vatDue: 3900,
  nextDeadline: '2024-04-30',
  daysRemaining: 89,
};

export function URSSAF() {
  const [isArmed, setIsArmed] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const sliderX = useMotionValue(0);
  const sliderProgress = useTransform(sliderX, [0, 250], [0, 100]);
  
  // Warp speed animation
  const [showWarp, setShowWarp] = useState(false);

  useEffect(() => {
    const unsubscribe = sliderProgress.on('change', (value) => {
      if (value >= 95 && !isPaid) {
        setIsArmed(true);
      }
    });
    return unsubscribe;
  }, [sliderProgress, isPaid]);

  const handlePayment = () => {
    if (isArmed) {
      setIsPaid(true);
      setShowWarp(true);
      setTimeout(() => setShowWarp(false), 2000);
    }
  };

  const threatLevel = mockData.daysRemaining < 30 ? 'critical' : mockData.daysRemaining < 60 ? 'warning' : 'nominal';
  const threatColors = {
    critical: '#ff6b00',
    warning: '#ff00ff',
    nominal: '#00f0ff',
  };

  return (
    <div className="p-6 space-y-6 relative overflow-hidden">
      {/* Warp Speed Effect */}
      {showWarp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 bg-gradient-to-b from-neon-cyan to-transparent"
              style={{
                left: `${Math.random() * 100}%`,
                top: '50%',
                height: '2px',
              }}
              initial={{ scaleY: 1, y: 0, opacity: 0 }}
              animate={{
                scaleY: [1, 50, 100],
                y: [0, -500],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
          <motion.div
            className="absolute inset-0 bg-neon-cyan/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.5 }}
          />
        </motion.div>
      )}

      {/* Threat Indicator */}
      <GlassPanel className="p-6" variant={threatLevel === 'critical' ? 'danger' : 'default'}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                scale: threatLevel === 'critical' ? [1, 1.2, 1] : 1,
                opacity: threatLevel === 'critical' ? [1, 0.5, 1] : 1,
              }}
              transition={{ duration: 0.8, repeat: threatLevel === 'critical' ? Infinity : 0 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${threatColors[threatLevel]}20`,
                border: `2px solid ${threatColors[threatLevel]}`,
                boxShadow: `0 0 30px ${threatColors[threatLevel]}40`,
              }}
            >
              <AlertTriangle size={28} style={{ color: threatColors[threatLevel] }} />
            </motion.div>
            <div>
              <h2 className="text-xl font-mono font-bold text-white">ANOMALIE DÉTECTÉE</h2>
              <p className="text-sm font-mono text-white/50">Échéance URSSAF T1 2024</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 text-white/50">
              <Calendar size={16} />
              <span className="font-mono text-sm">{mockData.nextDeadline}</span>
            </div>
            <p className="text-2xl font-mono font-bold mt-1" style={{ color: threatColors[threatLevel] }}>
              J-{mockData.daysRemaining}
            </p>
          </div>
        </div>

        {/* Visual threat bar */}
        <div className="mt-6 h-2 bg-void-light rounded-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{
              background: `linear-gradient(90deg, ${threatColors.nominal}, ${threatColors.warning}, ${threatColors.critical})`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${100 - (mockData.daysRemaining / 120) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </GlassPanel>

      {/* Calculators Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* URSSAF Calculator */}
        <GlassPanel className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-neon-magenta" />
            <h3 className="text-sm font-mono tracking-widest text-white/50">COTISATIONS URSSAF</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-glass-border">
              <span className="text-sm text-white/60">CA Trimestriel</span>
              <span className="font-mono font-bold text-white">
                {mockData.quarterlyRevenue.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-glass-border">
              <span className="text-sm text-white/60">Taux applicable</span>
              <span className="font-mono font-bold text-neon-cyan">
                {(mockData.rate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-neon-magenta/10 rounded px-3 -mx-3">
              <span className="text-sm font-bold text-white">MONTANT DÛ</span>
              <span className="text-2xl font-mono font-bold text-neon-magenta">
                {mockData.urssafDue.toLocaleString('fr-FR')} €
              </span>
            </div>
          </div>
        </GlassPanel>

        {/* TVA Calculator */}
        <GlassPanel className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-neon-cyan" />
            <h3 className="text-sm font-mono tracking-widest text-white/50">TVA À DÉCLARER</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-glass-border">
              <span className="text-sm text-white/60">TVA Collectée</span>
              <span className="font-mono font-bold text-neon-green">
                +{mockData.vatCollected.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-glass-border">
              <span className="text-sm text-white/60">TVA Déductible</span>
              <span className="font-mono font-bold text-neon-orange">
                -{mockData.vatDeductible.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-neon-cyan/10 rounded px-3 -mx-3">
              <span className="text-sm font-bold text-white">TVA NETTE</span>
              <span className="text-2xl font-mono font-bold text-neon-cyan">
                {mockData.vatDue.toLocaleString('fr-FR')} €
              </span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Payment Slider */}
      <GlassPanel className="p-6" variant={isPaid ? 'highlight' : 'default'} glow={isPaid}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono tracking-widest text-white/50">
            {isPaid ? 'DÉCLARATION TRANSMISE' : 'VALIDATION DE DÉCLARATION'}
          </h3>
          {isPaid && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 bg-neon-green/20 rounded-full text-xs font-mono text-neon-green"
            >
              ✓ VALIDÉ
            </motion.span>
          )}
        </div>

        {!isPaid ? (
          <div className="relative">
            {/* Slider track */}
            <div className="h-14 bg-void-light rounded-lg border border-glass-border relative overflow-hidden">
              {/* Progress fill */}
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-cyan/20 to-neon-green/20"
                style={{ width: useTransform(sliderProgress, (v) => `${v}%`) }}
              />
              
              {/* Slider handle */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 250 }}
                dragElastic={0}
                style={{ x: sliderX }}
                onDragEnd={() => {
                  if (!isArmed) {
                    animate(sliderX, 0, { type: 'spring', stiffness: 500 });
                  } else {
                    handlePayment();
                  }
                }}
                className={`
                  absolute top-1 left-1 bottom-1 w-20 rounded-md
                  flex items-center justify-center cursor-grab active:cursor-grabbing
                  ${isArmed
                    ? 'bg-neon-green border-neon-green shadow-[0_0_20px_rgba(0,255,136,0.5)]'
                    : 'bg-neon-cyan/80 border-neon-cyan'
                  }
                  border
                `}
              >
                <span className="text-xs font-mono font-bold text-void-black">
                  {isArmed ? 'ARMÉ' : '>>>'}
                </span>
              </motion.div>
              
              {/* Label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm font-mono text-white/30 tracking-widest">
                  GLISSER POUR VALIDER
                </span>
              </div>
            </div>
            
            <p className="text-xs text-white/30 text-center mt-2 font-mono">
              Montant total: {(mockData.urssafDue + mockData.vatDue).toLocaleString('fr-FR')} €
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4"
          >
            <p className="text-lg font-mono text-neon-green">
              Déclaration validée avec succès
            </p>
            <p className="text-sm text-white/50 mt-2">
              Référence: URSSAF-2024-T1-{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
          </motion.div>
        )}
      </GlassPanel>
    </div>
  );
}
