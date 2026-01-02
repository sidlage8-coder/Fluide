import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  Sparkles, Briefcase, Palette, Check, ChevronRight,
  Type, Layout, Paintbrush, Eye
} from 'lucide-react';

// ============================================
// FONT SYSTEM - 10 Premium Fonts
// ============================================

export const FONTS = [
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", category: 'Sans-Serif', preview: 'Aa' },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", category: 'Sans-Serif', preview: 'Aa' },
  { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif", category: 'Serif', preview: 'Aa' },
  { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'Sans-Serif', preview: 'Aa' },
  { id: 'roboto-slab', name: 'Roboto Slab', family: "'Roboto Slab', serif", category: 'Slab', preview: 'Aa' },
  { id: 'space-grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", category: 'Geometric', preview: 'Aa' },
  { id: 'dm-serif', name: 'DM Serif Display', family: "'DM Serif Display', serif", category: 'Serif', preview: 'Aa' },
  { id: 'jetbrains', name: 'JetBrains Mono', family: "'JetBrains Mono', monospace", category: 'Mono', preview: 'Aa' },
  { id: 'cormorant', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", category: 'Elegant', preview: 'Aa' },
  { id: 'archivo', name: 'Archivo Black', family: "'Archivo Black', sans-serif", category: 'Bold', preview: 'Aa' },
];

// ============================================
// LAYOUT TYPES
// ============================================

export type LayoutType = 'fun' | 'professional' | 'artistic';

export const LAYOUTS: Record<LayoutType, {
  id: LayoutType;
  name: string;
  description: string;
  icon: React.ReactNode;
  colors: { primary: string; secondary: string; accent: string };
  style: {
    headerStyle: 'wave' | 'clean' | 'artistic';
    tableStyle: 'rounded' | 'sharp' | 'minimal';
    accentPosition: 'top' | 'side' | 'corner';
  };
}> = {
  fun: {
    id: 'fun',
    name: 'Fun & Créatif',
    description: 'Couleurs vives, formes arrondies, ambiance décontractée',
    icon: <Sparkles size={24} />,
    colors: { primary: '#8b5cf6', secondary: '#ec4899', accent: '#fbbf24' },
    style: {
      headerStyle: 'wave',
      tableStyle: 'rounded',
      accentPosition: 'corner',
    },
  },
  professional: {
    id: 'professional',
    name: 'Professionnel',
    description: 'Design épuré, couleurs sobres, mise en page classique',
    icon: <Briefcase size={24} />,
    colors: { primary: '#1e40af', secondary: '#475569', accent: '#0ea5e9' },
    style: {
      headerStyle: 'clean',
      tableStyle: 'sharp',
      accentPosition: 'top',
    },
  },
  artistic: {
    id: 'artistic',
    name: 'Artistique',
    description: 'Typographie élégante, espaces généreux, touches créatives',
    icon: <Palette size={24} />,
    colors: { primary: '#0f172a', secondary: '#94a3b8', accent: '#f59e0b' },
    style: {
      headerStyle: 'artistic',
      tableStyle: 'minimal',
      accentPosition: 'side',
    },
  },
};

// ============================================
// THEME CONFIGURATION TYPE
// ============================================

export interface InvoiceTheme {
  layout: LayoutType;
  font: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  showLogo: boolean;
  logoPosition: 'left' | 'center' | 'right';
  showWatermark: boolean;
  watermarkText: string;
}

export const DEFAULT_THEME: InvoiceTheme = {
  layout: 'professional',
  font: 'inter',
  primaryColor: '#1e40af',
  secondaryColor: '#475569',
  accentColor: '#0ea5e9',
  showLogo: true,
  logoPosition: 'left',
  showWatermark: false,
  watermarkText: '',
};

// ============================================
// LAYOUT SELECTOR COMPONENT
// ============================================

interface LayoutSelectorProps {
  selected: LayoutType;
  onChange: (layout: LayoutType) => void;
}

export function LayoutSelector({ selected, onChange }: LayoutSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider">
        <Layout size={14} />
        Style de mise en page
      </label>
      
      <div className="grid grid-cols-3 gap-3">
        {Object.values(LAYOUTS).map((layout) => (
          <motion.button
            key={layout.id}
            onClick={() => onChange(layout.id)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer
              ${selected === layout.id 
                ? 'border-neon-cyan bg-neon-cyan/10' 
                : 'border-glass-border bg-glass-secondary hover:border-white/20'
              }
            `}
          >
            {/* Selected indicator */}
            {selected === layout.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center"
              >
                <Check size={14} className="text-void-black" />
              </motion.div>
            )}

            {/* Icon with gradient background */}
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 mx-auto"
              style={{ 
                background: `linear-gradient(135deg, ${layout.colors.primary}, ${layout.colors.secondary})`,
              }}
            >
              <span className="text-white">{layout.icon}</span>
            </div>

            {/* Name */}
            <h4 className={`font-mono font-bold text-sm text-center ${selected === layout.id ? 'text-neon-cyan' : 'text-white'}`}>
              {layout.name}
            </h4>

            {/* Mini preview bars */}
            <div className="mt-3 space-y-1">
              <div 
                className="h-1 rounded-full" 
                style={{ backgroundColor: layout.colors.primary, width: '100%' }}
              />
              <div 
                className="h-1 rounded-full" 
                style={{ backgroundColor: layout.colors.secondary, width: '70%' }}
              />
              <div 
                className="h-1 rounded-full" 
                style={{ backgroundColor: layout.colors.accent, width: '40%' }}
              />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// FONT SELECTOR COMPONENT
// ============================================

interface FontSelectorProps {
  selected: string;
  onChange: (font: string) => void;
}

export function FontSelector({ selected, onChange }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedFont = FONTS.find(f => f.id === selected) || FONTS[0];

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider">
        <Type size={14} />
        Police de caractères
      </label>

      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.01 }}
          className="w-full p-4 rounded-xl border border-glass-border bg-glass-secondary flex items-center justify-between cursor-pointer hover:border-white/20 transition-colors"
        >
          <div className="flex items-center gap-4">
            <span 
              className="text-3xl text-white/80"
              style={{ fontFamily: selectedFont.family }}
            >
              {selectedFont.preview}
            </span>
            <div className="text-left">
              <p className="font-mono font-bold text-white">{selectedFont.name}</p>
              <p className="text-xs text-white/40">{selectedFont.category}</p>
            </div>
          </div>
          <ChevronRight 
            size={20} 
            className={`text-white/40 transition-transform ${isOpen ? 'rotate-90' : ''}`} 
          />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="absolute z-50 w-full mt-2 rounded-xl border border-glass-border bg-void-gray/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="max-h-80 overflow-y-auto">
                {FONTS.map((font) => (
                  <motion.button
                    key={font.id}
                    onClick={() => {
                      onChange(font.id);
                      setIsOpen(false);
                    }}
                    whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                    className={`
                      w-full p-4 flex items-center gap-4 cursor-pointer transition-colors border-b border-glass-border last:border-0
                      ${selected === font.id ? 'bg-neon-cyan/10' : ''}
                    `}
                  >
                    <span 
                      className="text-2xl w-12 text-center text-white/80"
                      style={{ fontFamily: font.family }}
                    >
                      {font.preview}
                    </span>
                    <div className="flex-1 text-left">
                      <p 
                        className="font-bold text-white"
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </p>
                      <p className="text-xs text-white/40">{font.category}</p>
                    </div>
                    {selected === font.id && (
                      <Check size={18} className="text-neon-cyan" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// COLOR PICKER COMPONENT
// ============================================

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

export function ColorPicker({ label, value, onChange, presets = [] }: ColorPickerProps) {
  const defaultPresets = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
    '#10b981', '#06b6d4', '#1e40af', '#0f172a', '#475569',
  ];

  const colors = presets.length > 0 ? presets : defaultPresets;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider">
        <Paintbrush size={14} />
        {label}
      </label>

      <div className="flex items-center gap-3">
        {/* Custom color input */}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-glass-border"
          />
        </div>

        {/* Preset colors */}
        <div className="flex-1 flex flex-wrap gap-2">
          {colors.map((color) => (
            <motion.button
              key={color}
              onClick={() => onChange(color)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className={`
                w-8 h-8 rounded-lg cursor-pointer transition-all
                ${value === color ? 'ring-2 ring-white ring-offset-2 ring-offset-void-gray' : ''}
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// THEME CONFIGURATOR PANEL
// ============================================

interface ThemeConfiguratorProps {
  theme: InvoiceTheme;
  onChange: (theme: InvoiceTheme) => void;
}

export function ThemeConfigurator({ theme, onChange }: ThemeConfiguratorProps) {
  const updateTheme = (updates: Partial<InvoiceTheme>) => {
    onChange({ ...theme, ...updates });
  };

  const applyLayoutPreset = (layout: LayoutType) => {
    const preset = LAYOUTS[layout];
    updateTheme({
      layout,
      primaryColor: preset.colors.primary,
      secondaryColor: preset.colors.secondary,
      accentColor: preset.colors.accent,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Layout Selection */}
      <LayoutSelector 
        selected={theme.layout} 
        onChange={applyLayoutPreset}
      />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />

      {/* Font Selection */}
      <FontSelector 
        selected={theme.font} 
        onChange={(font) => updateTheme({ font })}
      />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />

      {/* Color Customization */}
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider">
          <Paintbrush size={14} />
          Personnalisation des couleurs
        </h4>

        <div className="grid grid-cols-1 gap-4">
          <ColorPicker
            label="Couleur principale"
            value={theme.primaryColor}
            onChange={(primaryColor) => updateTheme({ primaryColor })}
          />
          <ColorPicker
            label="Couleur secondaire"
            value={theme.secondaryColor}
            onChange={(secondaryColor) => updateTheme({ secondaryColor })}
          />
          <ColorPicker
            label="Couleur d'accent"
            value={theme.accentColor}
            onChange={(accentColor) => updateTheme({ accentColor })}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />

      {/* Logo Options */}
      <div className="space-y-3">
        <h4 className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider">
          <Eye size={14} />
          Options du logo
        </h4>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={theme.showLogo}
              onChange={(e) => updateTheme({ showLogo: e.target.checked })}
              className="w-4 h-4 rounded border-glass-border bg-void-dark accent-neon-cyan"
            />
            <span className="text-sm text-white/70">Afficher le logo</span>
          </label>
        </div>

        {theme.showLogo && (
          <div className="flex gap-2">
            {(['left', 'center', 'right'] as const).map((pos) => (
              <motion.button
                key={pos}
                onClick={() => updateTheme({ logoPosition: pos })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex-1 py-2 px-3 rounded-lg font-mono text-xs uppercase cursor-pointer transition-all
                  ${theme.logoPosition === pos 
                    ? 'bg-neon-cyan text-void-black' 
                    : 'bg-glass-secondary text-white/60 hover:text-white'
                  }
                `}
              >
                {pos === 'left' ? 'Gauche' : pos === 'center' ? 'Centre' : 'Droite'}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
