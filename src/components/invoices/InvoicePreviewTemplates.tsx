import { motion } from 'framer-motion';
import type { InvoiceTheme } from './InvoiceThemeSystem';
import { FONTS } from './InvoiceThemeSystem';

interface InvoiceData {
  invoiceNumber: string;
  clientName: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  companyName?: string;
  companyAddress?: string;
}

interface PreviewProps {
  theme: InvoiceTheme;
  data: InvoiceData;
  scale?: number;
}

// ============================================
// FUN LAYOUT - Playful & Creative
// ============================================

function FunLayout({ theme, data, scale = 0.6 }: PreviewProps) {
  const font = FONTS.find(f => f.id === theme.font)?.family || 'Inter';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl overflow-hidden shadow-2xl"
      style={{ 
        fontFamily: font,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,
      }}
    >
      {/* Wavy Header */}
      <div className="relative h-40 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
        />
        {/* Wave SVG */}
        <svg 
          className="absolute bottom-0 w-full" 
          viewBox="0 0 1440 120" 
          fill="white"
        >
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,69.3C960,85,1056,107,1152,101.3C1248,96,1344,64,1392,48L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
        </svg>
        
        {/* Header Content */}
        <div className="relative z-10 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{data.companyName || 'Votre Entreprise'}</h1>
              <p className="text-white/80 text-sm mt-1">{data.companyAddress}</p>
            </div>
            <div className="text-right">
              <span 
                className="inline-block px-4 py-2 rounded-full text-sm font-bold"
                style={{ backgroundColor: theme.accentColor }}
              >
                FACTURE
              </span>
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div 
          className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-20"
          style={{ backgroundColor: theme.accentColor }}
        />
        <div 
          className="absolute top-12 right-20 w-10 h-10 rounded-full opacity-30"
          style={{ backgroundColor: theme.accentColor }}
        />
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Invoice Info & Client */}
        <div className="flex justify-between mb-8">
          <div 
            className="p-4 rounded-2xl"
            style={{ backgroundColor: `${theme.primaryColor}10` }}
          >
            <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Facturé à</p>
            <p className="font-bold text-lg" style={{ color: theme.primaryColor }}>{data.clientName}</p>
            <p className="text-sm text-gray-500">{data.clientAddress}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">N° Facture</p>
            <p className="font-bold text-xl" style={{ color: theme.primaryColor }}>{data.invoiceNumber}</p>
            <p className="text-sm text-gray-500 mt-2">
              Émise le {data.issueDate}<br />
              Échéance {data.dueDate}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="rounded-2xl overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: `${theme.primaryColor}10` }}>
                <th className="text-left p-4 text-sm font-bold" style={{ color: theme.primaryColor }}>Description</th>
                <th className="text-center p-4 text-sm font-bold" style={{ color: theme.primaryColor }}>Qté</th>
                <th className="text-right p-4 text-sm font-bold" style={{ color: theme.primaryColor }}>Prix</th>
                <th className="text-right p-4 text-sm font-bold" style={{ color: theme.primaryColor }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="p-4 text-gray-700">{item.description}</td>
                  <td className="p-4 text-center text-gray-500">{item.quantity}</td>
                  <td className="p-4 text-right text-gray-500">{item.unitPrice.toFixed(2)} €</td>
                  <td className="p-4 text-right font-bold" style={{ color: theme.primaryColor }}>{item.total.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div 
            className="w-64 p-4 rounded-2xl"
            style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
          >
            <div className="flex justify-between text-white/80 mb-2">
              <span>Sous-total</span>
              <span>{data.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-white/80 mb-2">
              <span>TVA (20%)</span>
              <span>{data.tax.toFixed(2)} €</span>
            </div>
            <div className="h-px bg-white/30 my-2" />
            <div className="flex justify-between text-white text-xl font-bold">
              <span>Total</span>
              <span>{data.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="p-4 text-center text-sm"
        style={{ backgroundColor: `${theme.accentColor}20`, color: theme.accentColor }}
      >
        Merci pour votre confiance ! 🎉
      </div>
    </motion.div>
  );
}

// ============================================
// PROFESSIONAL LAYOUT - Clean & Corporate
// ============================================

function ProfessionalLayout({ theme, data, scale = 0.6 }: PreviewProps) {
  const font = FONTS.find(f => f.id === theme.font)?.family || 'Inter';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white overflow-hidden shadow-2xl"
      style={{ 
        fontFamily: font,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,
      }}
    >
      {/* Clean Header Bar */}
      <div 
        className="h-2"
        style={{ backgroundColor: theme.primaryColor }}
      />

      {/* Header */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 
              className="text-2xl font-bold tracking-tight"
              style={{ color: theme.primaryColor }}
            >
              {data.companyName || 'ENTREPRISE'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{data.companyAddress}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-gray-300 uppercase tracking-widest">Facture</h2>
            <p 
              className="text-xl font-bold mt-1"
              style={{ color: theme.primaryColor }}
            >
              {data.invoiceNumber}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Two columns: Client & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p 
              className="text-xs uppercase tracking-wider font-bold mb-2"
              style={{ color: theme.secondaryColor }}
            >
              Facturé à
            </p>
            <p className="font-semibold text-gray-800">{data.clientName}</p>
            <p className="text-sm text-gray-500">{data.clientAddress}</p>
          </div>
          <div className="text-right">
            <div className="inline-block text-left">
              <div className="flex gap-8 text-sm">
                <div>
                  <p className="text-gray-400">Date d'émission</p>
                  <p className="font-semibold text-gray-800">{data.issueDate}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date d'échéance</p>
                  <p className="font-semibold text-gray-800">{data.dueDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table - Sharp style */}
        <table className="w-full">
          <thead>
            <tr 
              className="border-y-2"
              style={{ borderColor: theme.primaryColor }}
            >
              <th className="text-left py-3 text-xs uppercase tracking-wider" style={{ color: theme.secondaryColor }}>Description</th>
              <th className="text-center py-3 text-xs uppercase tracking-wider" style={{ color: theme.secondaryColor }}>Quantité</th>
              <th className="text-right py-3 text-xs uppercase tracking-wider" style={{ color: theme.secondaryColor }}>Prix unitaire</th>
              <th className="text-right py-3 text-xs uppercase tracking-wider" style={{ color: theme.secondaryColor }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-4 text-gray-700">{item.description}</td>
                <td className="py-4 text-center text-gray-500">{item.quantity}</td>
                <td className="py-4 text-right text-gray-500">{item.unitPrice.toFixed(2)} €</td>
                <td className="py-4 text-right font-semibold text-gray-800">{item.total.toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals - Right aligned box */}
        <div className="mt-8 flex justify-end">
          <div className="w-72">
            <div className="flex justify-between py-2 text-gray-500">
              <span>Sous-total HT</span>
              <span>{data.subtotal.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between py-2 text-gray-500">
              <span>TVA (20%)</span>
              <span>{data.tax.toFixed(2)} €</span>
            </div>
            <div 
              className="flex justify-between py-3 mt-2 border-t-2 font-bold text-lg"
              style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
            >
              <span>Total TTC</span>
              <span>{data.total.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          Conditions de paiement : Paiement à réception par virement bancaire
        </p>
      </div>
    </motion.div>
  );
}

// ============================================
// ARTISTIC LAYOUT - Elegant & Creative
// ============================================

function ArtisticLayout({ theme, data, scale = 0.6 }: PreviewProps) {
  const font = FONTS.find(f => f.id === theme.font)?.family || 'Playfair Display';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white overflow-hidden shadow-2xl"
      style={{ 
        fontFamily: font,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: `${100 / scale}%`,
      }}
    >
      {/* Side accent bar */}
      <div className="flex">
        <div 
          className="w-3"
          style={{ background: `linear-gradient(to bottom, ${theme.accentColor}, ${theme.primaryColor})` }}
        />
        
        <div className="flex-1">
          {/* Header */}
          <div className="p-12 pb-8">
            <div className="flex justify-between items-end">
              <div>
                <p 
                  className="text-xs uppercase tracking-[0.3em] mb-2"
                  style={{ color: theme.secondaryColor }}
                >
                  Facture
                </p>
                <h1 
                  className="text-4xl font-light"
                  style={{ color: theme.primaryColor }}
                >
                  {data.companyName || 'Studio'}
                </h1>
              </div>
              <div className="text-right">
                <p 
                  className="text-5xl font-light"
                  style={{ color: theme.accentColor }}
                >
                  {data.invoiceNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Divider with accent */}
          <div className="px-12">
            <div className="h-px bg-gray-200 relative">
              <div 
                className="absolute left-0 top-0 h-px w-24"
                style={{ backgroundColor: theme.accentColor }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-12 pt-8">
            {/* Client Info */}
            <div className="mb-12">
              <p 
                className="text-xs uppercase tracking-[0.2em] mb-3"
                style={{ color: theme.secondaryColor }}
              >
                Destinataire
              </p>
              <p className="text-xl" style={{ color: theme.primaryColor }}>{data.clientName}</p>
              <p className="text-gray-400 mt-1">{data.clientAddress}</p>
            </div>

            {/* Dates - minimal style */}
            <div className="flex gap-16 mb-12 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Date</p>
                <p style={{ color: theme.primaryColor }}>{data.issueDate}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Échéance</p>
                <p style={{ color: theme.primaryColor }}>{data.dueDate}</p>
              </div>
            </div>

            {/* Items - Minimal table */}
            <div className="space-y-4">
              {data.items.map((item, i) => (
                <div key={i} className="flex justify-between items-baseline py-4 border-b border-gray-100">
                  <div className="flex-1">
                    <p className="text-gray-700">{item.description}</p>
                    <p className="text-sm text-gray-400 mt-1">{item.quantity} × {item.unitPrice.toFixed(2)} €</p>
                  </div>
                  <p 
                    className="text-lg font-light"
                    style={{ color: theme.primaryColor }}
                  >
                    {item.total.toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>

            {/* Total - Artistic style */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-end">
                <div>
                  <p 
                    className="text-xs uppercase tracking-[0.2em]"
                    style={{ color: theme.secondaryColor }}
                  >
                    Total à payer
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">
                    HT {data.subtotal.toFixed(2)} € + TVA {data.tax.toFixed(2)} €
                  </p>
                  <p 
                    className="text-4xl font-light"
                    style={{ color: theme.accentColor }}
                  >
                    {data.total.toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN PREVIEW COMPONENT
// ============================================

export function InvoicePreview({ theme, data, scale = 0.6 }: PreviewProps) {
  switch (theme.layout) {
    case 'fun':
      return <FunLayout theme={theme} data={data} scale={scale} />;
    case 'professional':
      return <ProfessionalLayout theme={theme} data={data} scale={scale} />;
    case 'artistic':
      return <ArtisticLayout theme={theme} data={data} scale={scale} />;
    default:
      return <ProfessionalLayout theme={theme} data={data} scale={scale} />;
  }
}

// Sample data for preview
export const SAMPLE_INVOICE_DATA: InvoiceData = {
  invoiceNumber: 'FAC-2026-001',
  companyName: 'Studio Créatif',
  companyAddress: '12 rue de l\'Innovation, 75001 Paris',
  clientName: 'Acme Corporation',
  clientAddress: '45 avenue des Champs-Élysées, 75008 Paris',
  issueDate: '02/01/2026',
  dueDate: '02/02/2026',
  items: [
    { description: 'Design de site web', quantity: 1, unitPrice: 2500, total: 2500 },
    { description: 'Développement frontend', quantity: 40, unitPrice: 75, total: 3000 },
    { description: 'Intégration CMS', quantity: 1, unitPrice: 800, total: 800 },
  ],
  subtotal: 6300,
  tax: 1260,
  total: 7560,
};
