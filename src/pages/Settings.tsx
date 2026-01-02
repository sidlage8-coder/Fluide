import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, Loader2, Building2, FileText, Palette, Scale, 
  Upload, Check, ChevronRight, Eye, RefreshCw, Sparkles
} from 'lucide-react';
import { GlassPanel, Button } from '../components/ui';

interface DocumentSettings {
  id?: string;
  companyName: string;
  companyLogo: string;
  companyAddress: string;
  companyCity: string;
  companyPostalCode: string;
  companyCountry: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  siret: string;
  vatNumber: string;
  legalForm: string;
  capital: string;
  rcs: string;
  apeCode: string;
  invoiceMentions: string;
  quoteMentions: string;
  paymentTerms: string;
  latePaymentTerms: string;
  invoiceTheme: string;
  invoicePrimaryColor: string;
  invoiceSecondaryColor: string;
  invoiceAccentColor: string;
  invoiceFontFamily: string;
  invoiceLogoPosition: string;
  invoiceShowWatermark: boolean;
  invoiceWatermarkText: string;
  invoiceHeaderStyle: string;
  invoiceTableStyle: string;
  quoteTheme: string;
  quotePrimaryColor: string;
  quoteSecondaryColor: string;
  quoteAccentColor: string;
  quoteFontFamily: string;
  quoteLogoPosition: string;
  quoteShowWatermark: boolean;
  quoteWatermarkText: string;
  quoteHeaderStyle: string;
  quoteTableStyle: string;
  invoicePrefix: string;
  quotePrefix: string;
}

const DEFAULT_SETTINGS: DocumentSettings = {
  companyName: '',
  companyLogo: '',
  companyAddress: '',
  companyCity: '',
  companyPostalCode: '',
  companyCountry: 'France',
  companyPhone: '',
  companyEmail: '',
  companyWebsite: '',
  siret: '',
  vatNumber: '',
  legalForm: '',
  capital: '',
  rcs: '',
  apeCode: '',
  invoiceMentions: '',
  quoteMentions: '',
  paymentTerms: 'Paiement à réception de facture par virement bancaire.',
  latePaymentTerms: 'En cas de retard de paiement, une pénalité égale à 3 fois le taux d\'intérêt légal sera exigible.',
  invoiceTheme: 'modern',
  invoicePrimaryColor: '#0ea5e9',
  invoiceSecondaryColor: '#64748b',
  invoiceAccentColor: '#10b981',
  invoiceFontFamily: 'Inter',
  invoiceLogoPosition: 'left',
  invoiceShowWatermark: false,
  invoiceWatermarkText: '',
  invoiceHeaderStyle: 'full',
  invoiceTableStyle: 'striped',
  quoteTheme: 'modern',
  quotePrimaryColor: '#8b5cf6',
  quoteSecondaryColor: '#64748b',
  quoteAccentColor: '#f59e0b',
  quoteFontFamily: 'Inter',
  quoteLogoPosition: 'left',
  quoteShowWatermark: false,
  quoteWatermarkText: '',
  quoteHeaderStyle: 'full',
  quoteTableStyle: 'striped',
  invoicePrefix: 'FAC',
  quotePrefix: 'DEV',
};

const THEMES = [
  { id: 'modern', name: 'Moderne', description: 'Design épuré et contemporain', colors: ['#0ea5e9', '#8b5cf6', '#10b981'] },
  { id: 'classic', name: 'Classique', description: 'Style professionnel traditionnel', colors: ['#1e40af', '#475569', '#059669'] },
  { id: 'minimal', name: 'Minimal', description: 'Simplicité maximale', colors: ['#18181b', '#71717a', '#a1a1aa'] },
  { id: 'bold', name: 'Audacieux', description: 'Couleurs vives et impactantes', colors: ['#dc2626', '#f97316', '#eab308'] },
];

const FONTS = [
  { name: 'Inter', style: 'font-sans' },
  { name: 'Roboto', style: 'font-sans' },
  { name: 'Open Sans', style: 'font-sans' },
  { name: 'Lato', style: 'font-sans' },
  { name: 'Montserrat', style: 'font-sans' },
  { name: 'Poppins', style: 'font-sans' },
  { name: 'Source Sans Pro', style: 'font-sans' },
];

const LEGAL_FORMS = [
  'Auto-entrepreneur', 'EURL', 'SARL', 'SAS', 'SASU', 'SA', 'SCI', 'Association'
];

const COLOR_PRESETS = [
  { name: 'Cyan', primary: '#0ea5e9', secondary: '#64748b', accent: '#10b981' },
  { name: 'Violet', primary: '#8b5cf6', secondary: '#64748b', accent: '#f59e0b' },
  { name: 'Rose', primary: '#ec4899', secondary: '#6b7280', accent: '#14b8a6' },
  { name: 'Bleu', primary: '#3b82f6', secondary: '#475569', accent: '#22c55e' },
  { name: 'Orange', primary: '#f97316', secondary: '#57534e', accent: '#84cc16' },
  { name: 'Émeraude', primary: '#10b981', secondary: '#64748b', accent: '#06b6d4' },
];

type TabType = 'company' | 'legal' | 'theme-invoice' | 'theme-quote';

export function Settings() {
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [settings, setSettings] = useState<DocumentSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Erreur API');
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object') {
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur chargement settings:', err);
        setError('Impossible de charger les paramètres');
        setLoading(false);
      });
  }, []);

  const updateSettings = (updates: Partial<DocumentSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setSaved(false);
  };

  const handleSave = async (endpoint: string, data: object) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/settings${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(prev => ({ ...prev, ...updated }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        throw new Error('Erreur sauvegarde');
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCompany = () => {
    handleSave('/company', {
      companyName: settings.companyName,
      companyLogo: settings.companyLogo,
      companyAddress: settings.companyAddress,
      companyCity: settings.companyCity,
      companyPostalCode: settings.companyPostalCode,
      companyCountry: settings.companyCountry,
      companyPhone: settings.companyPhone,
      companyEmail: settings.companyEmail,
      companyWebsite: settings.companyWebsite,
      siret: settings.siret,
      vatNumber: settings.vatNumber,
      legalForm: settings.legalForm,
      capital: settings.capital,
      rcs: settings.rcs,
      apeCode: settings.apeCode,
    });
  };

  const handleSaveLegal = () => {
    handleSave('/legal', {
      invoiceMentions: settings.invoiceMentions,
      quoteMentions: settings.quoteMentions,
      paymentTerms: settings.paymentTerms,
      latePaymentTerms: settings.latePaymentTerms,
    });
  };

  const handleSaveInvoiceTheme = () => {
    handleSave('/theme/invoice', {
      invoiceTheme: settings.invoiceTheme,
      invoicePrimaryColor: settings.invoicePrimaryColor,
      invoiceSecondaryColor: settings.invoiceSecondaryColor,
      invoiceAccentColor: settings.invoiceAccentColor,
      invoiceFontFamily: settings.invoiceFontFamily,
      invoiceLogoPosition: settings.invoiceLogoPosition,
      invoiceShowWatermark: settings.invoiceShowWatermark,
      invoiceWatermarkText: settings.invoiceWatermarkText,
      invoiceHeaderStyle: settings.invoiceHeaderStyle,
      invoiceTableStyle: settings.invoiceTableStyle,
    });
  };

  const handleSaveQuoteTheme = () => {
    handleSave('/theme/quote', {
      quoteTheme: settings.quoteTheme,
      quotePrimaryColor: settings.quotePrimaryColor,
      quoteSecondaryColor: settings.quoteSecondaryColor,
      quoteAccentColor: settings.quoteAccentColor,
      quoteFontFamily: settings.quoteFontFamily,
      quoteLogoPosition: settings.quoteLogoPosition,
      quoteShowWatermark: settings.quoteShowWatermark,
      quoteWatermarkText: settings.quoteWatermarkText,
      quoteHeaderStyle: settings.quoteHeaderStyle,
      quoteTableStyle: settings.quoteTableStyle,
    });
  };

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0], type: 'invoice' | 'quote') => {
    if (type === 'invoice') {
      updateSettings({
        invoicePrimaryColor: preset.primary,
        invoiceSecondaryColor: preset.secondary,
        invoiceAccentColor: preset.accent,
      });
    } else {
      updateSettings({
        quotePrimaryColor: preset.primary,
        quoteSecondaryColor: preset.secondary,
        quoteAccentColor: preset.accent,
      });
    }
  };

  const tabs = [
    { id: 'company' as TabType, label: 'Mon entreprise', icon: Building2 },
    { id: 'legal' as TabType, label: 'Mentions légales', icon: Scale },
    { id: 'theme-invoice' as TabType, label: 'Thème Factures', icon: Palette },
    { id: 'theme-quote' as TabType, label: 'Thème Devis', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-neon-cyan mx-auto mb-4" />
          <p className="text-white/50">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-h-[calc(100vh-80px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-mono font-bold text-white">Paramètres</h1>
          <p className="text-sm text-white/50">Configuration de vos documents et mentions légales</p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-sm text-red-400">{error}</span>
          )}
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-emerald-400"
            >
              <Check size={16} /> Enregistré
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
          <GlassPanel className="p-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all
                    ${activeTab === tab.id 
                      ? 'bg-neon-cyan/20 text-neon-cyan' 
                      : 'text-white/60 hover:text-white hover:bg-glass-secondary'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
                </button>
              );
            })}
          </GlassPanel>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Tab: Mon entreprise */}
          {activeTab === 'company' && (
            <GlassPanel className="p-6">
              <h2 className="text-lg font-mono font-bold text-white mb-6 flex items-center gap-2">
                <Building2 size={20} className="text-neon-cyan" />
                Informations de l'entreprise
              </h2>

              <div className="space-y-6">
                {/* Logo */}
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-void-dark border border-glass-border flex items-center justify-center overflow-hidden">
                      {settings.companyLogo ? (
                        <img src={settings.companyLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <Upload size={24} className="text-white/30" />
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={settings.companyLogo}
                        onChange={e => updateSettings({ companyLogo: e.target.value })}
                        placeholder="URL du logo"
                        className="w-64 bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm focus:border-neon-cyan/50 outline-none"
                      />
                      <p className="text-xs text-white/40 mt-1">Format: PNG, JPG, SVG (URL)</p>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">Nom de l'entreprise *</label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={e => updateSettings({ companyName: e.target.value })}
                      placeholder="ORBITAL COMMAND"
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">Forme juridique</label>
                    <select
                      value={settings.legalForm}
                      onChange={e => updateSettings({ legalForm: e.target.value })}
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                    >
                      <option value="">Sélectionner</option>
                      {LEGAL_FORMS.map(form => (
                        <option key={form} value={form}>{form}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={settings.companyAddress}
                    onChange={e => updateSettings({ companyAddress: e.target.value })}
                    placeholder="123 Rue de l'Innovation"
                    className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">Code postal</label>
                    <input
                      type="text"
                      value={settings.companyPostalCode}
                      onChange={e => updateSettings({ companyPostalCode: e.target.value })}
                      placeholder="75001"
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">Ville</label>
                    <input
                      type="text"
                      value={settings.companyCity}
                      onChange={e => updateSettings({ companyCity: e.target.value })}
                      placeholder="Paris"
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">Pays</label>
                    <input
                      type="text"
                      value={settings.companyCountry}
                      onChange={e => updateSettings({ companyCountry: e.target.value })}
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.companyEmail}
                      onChange={e => updateSettings({ companyEmail: e.target.value })}
                      placeholder="contact@orbital.fr"
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={settings.companyPhone}
                      onChange={e => updateSettings({ companyPhone: e.target.value })}
                      placeholder="+33 1 23 45 67 89"
                      className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">Site web</label>
                  <input
                    type="url"
                    value={settings.companyWebsite}
                    onChange={e => updateSettings({ companyWebsite: e.target.value })}
                    placeholder="https://orbital-command.fr"
                    className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                  />
                </div>

                <div className="border-t border-glass-border pt-6 mt-6">
                  <h3 className="text-sm font-mono text-white/70 mb-4">Informations légales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">SIRET</label>
                      <input
                        type="text"
                        value={settings.siret}
                        onChange={e => updateSettings({ siret: e.target.value })}
                        placeholder="123 456 789 00012"
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">N° TVA</label>
                      <input
                        type="text"
                        value={settings.vatNumber}
                        onChange={e => updateSettings({ vatNumber: e.target.value })}
                        placeholder="FR12345678901"
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">RCS</label>
                      <input
                        type="text"
                        value={settings.rcs}
                        onChange={e => updateSettings({ rcs: e.target.value })}
                        placeholder="RCS Paris B 123 456 789"
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">Capital</label>
                      <input
                        type="text"
                        value={settings.capital}
                        onChange={e => updateSettings({ capital: e.target.value })}
                        placeholder="10 000 €"
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">Code APE</label>
                      <input
                        type="text"
                        value={settings.apeCode}
                        onChange={e => updateSettings({ apeCode: e.target.value })}
                        placeholder="6201Z"
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveCompany} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                    Enregistrer
                  </Button>
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Tab: Mentions légales */}
          {activeTab === 'legal' && (
            <GlassPanel className="p-6">
              <h2 className="text-lg font-mono font-bold text-white mb-6 flex items-center gap-2">
                <Scale size={20} className="text-neon-cyan" />
                Mentions légales
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">
                    Conditions de paiement (affiché sur les documents)
                  </label>
                  <textarea
                    value={settings.paymentTerms}
                    onChange={e => updateSettings({ paymentTerms: e.target.value })}
                    placeholder="Paiement à réception de facture par virement bancaire.&#10;IBAN: FR76 XXXX XXXX XXXX XXXX XXXX XXX&#10;BIC: XXXXXXXX"
                    rows={4}
                    className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">
                    Pénalités de retard
                  </label>
                  <textarea
                    value={settings.latePaymentTerms}
                    onChange={e => updateSettings({ latePaymentTerms: e.target.value })}
                    placeholder="En cas de retard de paiement, une pénalité égale à 3 fois le taux d'intérêt légal sera exigible."
                    rows={3}
                    className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">
                    Mentions légales factures
                  </label>
                  <textarea
                    value={settings.invoiceMentions}
                    onChange={e => updateSettings({ invoiceMentions: e.target.value })}
                    placeholder="TVA non applicable, art. 293 B du CGI (si auto-entrepreneur)"
                    rows={4}
                    className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/50 mb-2">
                    Mentions légales devis
                  </label>
                  <textarea
                    value={settings.quoteMentions}
                    onChange={e => updateSettings({ quoteMentions: e.target.value })}
                    placeholder="Devis valable 30 jours. Acompte de 30% à la signature."
                    rows={4}
                    className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white focus:border-neon-cyan/50 outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveLegal} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                    Enregistrer
                  </Button>
                </div>
              </div>
            </GlassPanel>
          )}

          {/* Tab: Thème Factures */}
          {activeTab === 'theme-invoice' && (
            <div className="space-y-6">
              <GlassPanel className="p-6">
                <h2 className="text-lg font-mono font-bold text-white mb-6 flex items-center gap-2">
                  <Palette size={20} className="text-neon-cyan" />
                  Générateur de Thème - Factures
                </h2>

                <div className="space-y-6">
                  {/* Theme Style Selection */}
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-3">Style de base</label>
                    <div className="grid grid-cols-4 gap-3">
                      {THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => updateSettings({ invoiceTheme: theme.id })}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            settings.invoiceTheme === theme.id
                              ? 'border-neon-cyan bg-neon-cyan/10'
                              : 'border-glass-border hover:border-white/30'
                          }`}
                        >
                          <div className="flex gap-1 mb-2">
                            {theme.colors.map((color, i) => (
                              <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                          <p className="font-medium text-white text-sm">{theme.name}</p>
                          <p className="text-xs text-white/50 mt-0.5">{theme.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Presets */}
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-3 flex items-center gap-2">
                      <Sparkles size={12} /> Palettes de couleurs
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => applyColorPreset(preset, 'invoice')}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-void-dark border border-glass-border hover:border-white/30 transition-colors"
                        >
                          <div className="flex gap-0.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                          </div>
                          <span className="text-xs text-white/70">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-3">Couleurs personnalisées</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Principale</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.invoicePrimaryColor}
                            onChange={e => updateSettings({ invoicePrimaryColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={settings.invoicePrimaryColor}
                            onChange={e => updateSettings({ invoicePrimaryColor: e.target.value })}
                            className="flex-1 bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Secondaire</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.invoiceSecondaryColor}
                            onChange={e => updateSettings({ invoiceSecondaryColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={settings.invoiceSecondaryColor}
                            onChange={e => updateSettings({ invoiceSecondaryColor: e.target.value })}
                            className="flex-1 bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Accent</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.invoiceAccentColor}
                            onChange={e => updateSettings({ invoiceAccentColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={settings.invoiceAccentColor}
                            onChange={e => updateSettings({ invoiceAccentColor: e.target.value })}
                            className="flex-1 bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Font & Layout */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">Police</label>
                      <select
                        value={settings.invoiceFontFamily}
                        onChange={e => updateSettings({ invoiceFontFamily: e.target.value })}
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white"
                      >
                        {FONTS.map(font => (
                          <option key={font.name} value={font.name}>{font.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">Position logo</label>
                      <select
                        value={settings.invoiceLogoPosition}
                        onChange={e => updateSettings({ invoiceLogoPosition: e.target.value })}
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white"
                      >
                        <option value="left">Gauche</option>
                        <option value="center">Centre</option>
                        <option value="right">Droite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">Style tableau</label>
                      <select
                        value={settings.invoiceTableStyle}
                        onChange={e => updateSettings({ invoiceTableStyle: e.target.value })}
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white"
                      >
                        <option value="striped">Rayé</option>
                        <option value="bordered">Bordures</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>
                  </div>

                  {/* Header Style */}
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-2">Style en-tête</label>
                    <div className="flex gap-3">
                      {['full', 'minimal', 'none'].map(style => (
                        <button
                          key={style}
                          onClick={() => updateSettings({ invoiceHeaderStyle: style })}
                          className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                            settings.invoiceHeaderStyle === style
                              ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                              : 'border-glass-border text-white/60 hover:text-white'
                          }`}
                        >
                          {style === 'full' ? 'Complet' : style === 'minimal' ? 'Minimal' : 'Sans'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Watermark */}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.invoiceShowWatermark}
                        onChange={e => updateSettings({ invoiceShowWatermark: e.target.checked })}
                        className="w-4 h-4 rounded border-glass-border"
                      />
                      <span className="text-sm text-white/70">Afficher un filigrane</span>
                    </label>
                    {settings.invoiceShowWatermark && (
                      <input
                        type="text"
                        value={settings.invoiceWatermarkText}
                        onChange={e => updateSettings({ invoiceWatermarkText: e.target.value })}
                        placeholder="PAYÉ, ANNULÉ..."
                        className="flex-1 bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm"
                      />
                    )}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-glass-border">
                    <Button variant="secondary" className="gap-2">
                      <Eye size={16} /> Aperçu
                    </Button>
                    <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => updateSettings({
                        invoiceTheme: 'modern',
                        invoicePrimaryColor: '#0ea5e9',
                        invoiceSecondaryColor: '#64748b',
                        invoiceAccentColor: '#10b981',
                      })}>
                        <RefreshCw size={16} /> Réinitialiser
                      </Button>
                      <Button onClick={handleSaveInvoiceTheme} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassPanel>

              {/* Live Preview */}
              <GlassPanel className="p-6">
                <h3 className="text-sm font-mono text-white/70 mb-4 flex items-center gap-2">
                  <Eye size={14} /> Aperçu en temps réel
                </h3>
                <div className="bg-white rounded-lg p-6 text-gray-900">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-xl font-bold" style={{ color: settings.invoicePrimaryColor }}>
                        FACTURE
                      </h1>
                      <p className="text-sm" style={{ color: settings.invoiceSecondaryColor }}>
                        N° FAC-2026-0001
                      </p>
                    </div>
                    <div className="text-right text-sm" style={{ color: settings.invoiceSecondaryColor }}>
                      <p className="font-medium">{settings.companyName || 'Votre entreprise'}</p>
                      <p>{settings.companyAddress || 'Adresse'}</p>
                    </div>
                  </div>
                  <table className="w-full text-sm mb-4">
                    <thead>
                      <tr style={{ 
                        backgroundColor: settings.invoiceTableStyle === 'striped' ? settings.invoicePrimaryColor + '20' : 'transparent',
                        borderBottom: settings.invoiceTableStyle === 'bordered' ? '2px solid ' + settings.invoicePrimaryColor : 'none'
                      }}>
                        <th className="text-left py-2 px-2">Description</th>
                        <th className="text-center py-2 px-2">Qté</th>
                        <th className="text-right py-2 px-2">Prix</th>
                        <th className="text-right py-2 px-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={settings.invoiceTableStyle === 'striped' ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-2">Développement web</td>
                        <td className="text-center py-2 px-2">5</td>
                        <td className="text-right py-2 px-2">500,00 €</td>
                        <td className="text-right py-2 px-2 font-medium">2 500,00 €</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">Design UI/UX</td>
                        <td className="text-center py-2 px-2">3</td>
                        <td className="text-right py-2 px-2">400,00 €</td>
                        <td className="text-right py-2 px-2 font-medium">1 200,00 €</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="flex justify-end">
                    <div className="w-48">
                      <div className="flex justify-between py-1 text-sm">
                        <span style={{ color: settings.invoiceSecondaryColor }}>Sous-total</span>
                        <span>3 700,00 €</span>
                      </div>
                      <div className="flex justify-between py-1 text-sm">
                        <span style={{ color: settings.invoiceSecondaryColor }}>TVA (20%)</span>
                        <span>740,00 €</span>
                      </div>
                      <div className="flex justify-between py-2 text-lg font-bold border-t mt-1" style={{ borderColor: settings.invoicePrimaryColor }}>
                        <span>Total</span>
                        <span style={{ color: settings.invoiceAccentColor }}>4 440,00 €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </div>
          )}

          {/* Tab: Thème Devis */}
          {activeTab === 'theme-quote' && (
            <div className="space-y-6">
              <GlassPanel className="p-6">
                <h2 className="text-lg font-mono font-bold text-white mb-6 flex items-center gap-2">
                  <FileText size={20} className="text-purple-400" />
                  Générateur de Thème - Devis
                </h2>

                <div className="space-y-6">
                  {/* Theme Style Selection */}
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-3">Style de base</label>
                    <div className="grid grid-cols-4 gap-3">
                      {THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => updateSettings({ quoteTheme: theme.id })}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            settings.quoteTheme === theme.id
                              ? 'border-purple-400 bg-purple-500/10'
                              : 'border-glass-border hover:border-white/30'
                          }`}
                        >
                          <div className="flex gap-1 mb-2">
                            {theme.colors.map((color, i) => (
                              <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                          <p className="font-medium text-white text-sm">{theme.name}</p>
                          <p className="text-xs text-white/50 mt-0.5">{theme.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Presets */}
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-3 flex items-center gap-2">
                      <Sparkles size={12} /> Palettes de couleurs
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map(preset => (
                        <button
                          key={preset.name}
                          onClick={() => applyColorPreset(preset, 'quote')}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-void-dark border border-glass-border hover:border-white/30 transition-colors"
                        >
                          <div className="flex gap-0.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                          </div>
                          <span className="text-xs text-white/70">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Colors */}
                  <div>
                    <label className="block text-xs font-mono text-white/50 mb-3">Couleurs personnalisées</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Principale</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.quotePrimaryColor}
                            onChange={e => updateSettings({ quotePrimaryColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={settings.quotePrimaryColor}
                            onChange={e => updateSettings({ quotePrimaryColor: e.target.value })}
                            className="flex-1 bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Secondaire</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.quoteSecondaryColor}
                            onChange={e => updateSettings({ quoteSecondaryColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={settings.quoteSecondaryColor}
                            onChange={e => updateSettings({ quoteSecondaryColor: e.target.value })}
                            className="flex-1 bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Accent</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={settings.quoteAccentColor}
                            onChange={e => updateSettings({ quoteAccentColor: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border-0"
                          />
                          <input
                            type="text"
                            value={settings.quoteAccentColor}
                            onChange={e => updateSettings({ quoteAccentColor: e.target.value })}
                            className="flex-1 bg-void-dark border border-glass-border rounded px-3 py-2 text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Font & Layout */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">Police</label>
                      <select
                        value={settings.quoteFontFamily}
                        onChange={e => updateSettings({ quoteFontFamily: e.target.value })}
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white"
                      >
                        {FONTS.map(font => (
                          <option key={font.name} value={font.name}>{font.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">Position logo</label>
                      <select
                        value={settings.quoteLogoPosition}
                        onChange={e => updateSettings({ quoteLogoPosition: e.target.value })}
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white"
                      >
                        <option value="left">Gauche</option>
                        <option value="center">Centre</option>
                        <option value="right">Droite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-white/50 mb-2">Style tableau</label>
                      <select
                        value={settings.quoteTableStyle}
                        onChange={e => updateSettings({ quoteTableStyle: e.target.value })}
                        className="w-full bg-void-dark border border-glass-border rounded-lg px-4 py-2.5 text-white"
                      >
                        <option value="striped">Rayé</option>
                        <option value="bordered">Bordures</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-glass-border">
                    <Button variant="secondary" className="gap-2">
                      <Eye size={16} /> Aperçu
                    </Button>
                    <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => updateSettings({
                        quoteTheme: 'modern',
                        quotePrimaryColor: '#8b5cf6',
                        quoteSecondaryColor: '#64748b',
                        quoteAccentColor: '#f59e0b',
                      })}>
                        <RefreshCw size={16} /> Réinitialiser
                      </Button>
                      <Button onClick={handleSaveQuoteTheme} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Enregistrer
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassPanel>

              {/* Live Preview */}
              <GlassPanel className="p-6">
                <h3 className="text-sm font-mono text-white/70 mb-4 flex items-center gap-2">
                  <Eye size={14} /> Aperçu en temps réel
                </h3>
                <div className="bg-white rounded-lg p-6 text-gray-900">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h1 className="text-xl font-bold" style={{ color: settings.quotePrimaryColor }}>
                        DEVIS
                      </h1>
                      <p className="text-sm" style={{ color: settings.quoteSecondaryColor }}>
                        N° DEV-2026-0001
                      </p>
                    </div>
                    <div className="text-right text-sm" style={{ color: settings.quoteSecondaryColor }}>
                      <p className="font-medium">{settings.companyName || 'Votre entreprise'}</p>
                      <p>Valable jusqu'au: 01/02/2026</p>
                    </div>
                  </div>
                  <table className="w-full text-sm mb-4">
                    <thead>
                      <tr style={{ 
                        backgroundColor: settings.quoteTableStyle === 'striped' ? settings.quotePrimaryColor + '20' : 'transparent',
                        borderBottom: settings.quoteTableStyle === 'bordered' ? '2px solid ' + settings.quotePrimaryColor : 'none'
                      }}>
                        <th className="text-left py-2 px-2">Description</th>
                        <th className="text-center py-2 px-2">Qté</th>
                        <th className="text-right py-2 px-2">Prix</th>
                        <th className="text-right py-2 px-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={settings.quoteTableStyle === 'striped' ? 'bg-gray-50' : ''}>
                        <td className="py-2 px-2">Consultation initiale</td>
                        <td className="text-center py-2 px-2">2h</td>
                        <td className="text-right py-2 px-2">150,00 €</td>
                        <td className="text-right py-2 px-2 font-medium">300,00 €</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">Développement sur mesure</td>
                        <td className="text-center py-2 px-2">10j</td>
                        <td className="text-right py-2 px-2">500,00 €</td>
                        <td className="text-right py-2 px-2 font-medium">5 000,00 €</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="flex justify-end">
                    <div className="w-48">
                      <div className="flex justify-between py-2 text-lg font-bold border-t" style={{ borderColor: settings.quotePrimaryColor }}>
                        <span>Total TTC</span>
                        <span style={{ color: settings.quoteAccentColor }}>5 300,00 €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
