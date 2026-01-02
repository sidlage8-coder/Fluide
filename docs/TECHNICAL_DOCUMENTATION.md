# ORBITAL COMMAND - Documentation Technique v1.0

> **Type:** Application SaaS de Gestion Administrative Gamifiée  
> **Version:** 0.1.0 (MVP)  
> **Date:** 01 Janvier 2026  
> **Stack:** React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + Framer Motion

---

## Table des Matières

1. [Architecture Générale](#1-architecture-générale)
2. [Stack Technique](#2-stack-technique)
3. [Design System](#3-design-system)
4. [Structure des Fichiers](#4-structure-des-fichiers)
5. [Composants UI](#5-composants-ui)
6. [Composants Dashboard](#6-composants-dashboard)
7. [Composants Layout](#7-composants-layout)
8. [Pages](#8-pages)
9. [Animations & Interactions](#9-animations--interactions)
10. [État & Data Flow](#10-état--data-flow)
11. [Performance](#11-performance)
12. [Conventions de Code](#12-conventions-de-code)
13. [Roadmap Technique](#13-roadmap-technique)

---

## 1. Architecture Générale

### 1.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORBITAL COMMAND                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────────────────────┐  │
│  │   SIDEBAR   │  │              MAIN CONTENT               │  │
│  │             │  │  ┌───────────────────────────────────┐  │  │
│  │  ┌───────┐  │  │  │            HEADER                 │  │  │
│  │  │ Logo  │  │  │  └───────────────────────────────────┘  │  │
│  │  └───────┘  │  │  ┌───────────────────────────────────┐  │  │
│  │             │  │  │                                   │  │  │
│  │  ┌───────┐  │  │  │         PAGE CONTENT              │  │  │
│  │  │ Nav   │  │  │  │    (Dashboard/Clients/etc.)       │  │  │
│  │  │ Items │  │  │  │                                   │  │  │
│  │  └───────┘  │  │  │                                   │  │  │
│  │             │  │  │                                   │  │  │
│  │  ┌───────┐  │  │  └───────────────────────────────────┘  │  │
│  │  │Config │  │  │                                         │  │
│  │  └───────┘  │  │                                         │  │
│  └─────────────┘  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    XP BAR (Fixed Top)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 PARALLAX GRID (Background)               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Flux de Données (Actuel - MVP)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   App.tsx    │────▶│    Pages     │────▶│  Components  │
│  (State)     │     │  (Views)     │     │  (UI/Logic)  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────┐
│                    Mock Data (Temporaire)                 │
└──────────────────────────────────────────────────────────┘
```

### 1.3 Flux de Données (Cible - avec Supabase)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   App.tsx    │────▶│    Pages     │────▶│  Components  │
│  (Context)   │     │  (Views)     │     │  (UI/Logic)  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────┐
│                   React Query / Zustand                   │
│                    (Cache & State)                        │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    Supabase Client                        │
│         (Auth, Database, Realtime, Storage)               │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                     │
│                      (Supabase)                           │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Stack Technique

### 2.1 Dépendances Principales

| Package | Version | Usage |
|---------|---------|-------|
| `react` | ^19.2.0 | Framework UI |
| `react-dom` | ^19.2.0 | DOM Renderer |
| `framer-motion` | latest | Animations & Gestures |
| `gsap` | latest | Animations SVG complexes (futur) |
| `lucide-react` | latest | Icônes SVG |
| `@supabase/supabase-js` | latest | Backend-as-a-Service |
| `react-router-dom` | latest | Routing (préparé) |

### 2.2 Dépendances de Développement

| Package | Version | Usage |
|---------|---------|-------|
| `vite` | ^7.2.4 | Build tool & Dev server |
| `typescript` | ~5.9.3 | Typage statique |
| `tailwindcss` | latest | CSS Utility-first |
| `@tailwindcss/vite` | latest | Plugin Vite |
| `@vitejs/plugin-react` | ^5.1.1 | Fast Refresh |
| `eslint` | ^9.39.1 | Linting |

### 2.3 Configuration Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 2.4 Configuration TypeScript

- **Target:** ES2020
- **Module:** ESNext
- **Strict Mode:** Enabled
- **verbatimModuleSyntax:** Enabled (imports type séparés)

---

## 3. Design System

### 3.1 Tokens de Couleurs

```css
/* Palette - Deep Void */
--color-void-black: #050505;      /* Fond principal */
--color-void-dark: #0a0a0a;       /* Fond secondaire */
--color-void-gray: #111111;       /* Éléments subtils */
--color-void-light: #1a1a1a;      /* Surfaces élevées */

/* Palette - Neon Accents */
--color-neon-cyan: #00f0ff;       /* Systèmes nominaux, revenus */
--color-neon-cyan-dim: #00f0ff80; /* Cyan 50% opacity */
--color-neon-cyan-glow: #00f0ff40;/* Cyan pour glows */

--color-neon-magenta: #ff00ff;    /* Dépenses, en attente */
--color-neon-magenta-dim: #ff00ff80;
--color-neon-magenta-glow: #ff00ff40;

--color-neon-orange: #ff6b00;     /* Alertes, retards */
--color-neon-orange-dim: #ff6b0080;
--color-neon-orange-glow: #ff6b0040;

--color-neon-green: #00ff88;      /* Succès, payé */
--color-neon-green-dim: #00ff8880;

/* Glass Effects */
--color-glass-primary: rgba(255, 255, 255, 0.03);
--color-glass-secondary: rgba(255, 255, 255, 0.05);
--color-glass-border: rgba(255, 255, 255, 0.08);
--color-glass-border-light: rgba(255, 255, 255, 0.12);
```

### 3.2 Typographie

```css
/* Fonts */
--font-mono: 'JetBrains Mono', 'Space Mono', monospace;
--font-sans: 'Inter', system-ui, sans-serif;
```

| Élément | Font | Poids | Tracking |
|---------|------|-------|----------|
| Titres/Data | `--font-mono` | 700 | `tracking-wider` |
| Labels | `--font-mono` | 400 | `tracking-widest` |
| Corps | `--font-sans` | 400 | Normal |
| Boutons | `--font-mono` | 500 | `tracking-widest` |

### 3.3 Shadows & Glows

```css
/* Neon Glow Effects */
--shadow-neon-cyan: 0 0 20px rgba(0,240,255,0.4), 0 0 40px rgba(0,240,255,0.2);
--shadow-neon-magenta: 0 0 20px rgba(255,0,255,0.4), 0 0 40px rgba(255,0,255,0.2);
--shadow-neon-orange: 0 0 20px rgba(255,107,0,0.4), 0 0 40px rgba(255,107,0,0.2);
```

### 3.4 Spacing Scale

Utilisation de l'échelle Tailwind standard (4px base):
- `p-1` = 4px
- `p-2` = 8px
- `p-3` = 12px
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px

### 3.5 Border Radius

| Taille | Valeur | Usage |
|--------|--------|-------|
| `rounded` | 4px | Boutons, inputs |
| `rounded-lg` | 8px | Panels, cards |
| `rounded-full` | 9999px | Avatars, badges |

---

## 4. Structure des Fichiers

```
orbital-command/
├── docs/
│   └── TECHNICAL_DOCUMENTATION.md
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── CoreStability.tsx    # Jauge trésorerie animée
│   │   │   ├── KPICard.tsx          # Carte indicateur
│   │   │   ├── ParallaxGrid.tsx     # Grille de fond interactive
│   │   │   ├── XPBar.tsx            # Barre de progression XP
│   │   │   └── index.ts             # Barrel export
│   │   ├── layout/
│   │   │   ├── Header.tsx           # En-tête avec status
│   │   │   ├── Sidebar.tsx          # Navigation latérale
│   │   │   └── index.ts
│   │   └── ui/
│   │       ├── Button.tsx           # Bouton générique
│   │       ├── DataText.tsx         # Texte animé (compteur)
│   │       ├── GlassPanel.tsx       # Panel glassmorphism
│   │       └── index.ts
│   ├── pages/
│   │   ├── Clients.tsx              # Vue radar clients
│   │   ├── Dashboard.tsx            # Vue principale
│   │   ├── Invoices.tsx             # Gestion factures
│   │   ├── URSSAF.tsx               # Calculateur charges
│   │   └── index.ts
│   ├── App.tsx                      # Composant racine
│   ├── index.css                    # Design System Tailwind
│   └── main.tsx                     # Point d'entrée
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 5. Composants UI

### 5.1 GlassPanel

**Fichier:** `src/components/ui/GlassPanel.tsx`

**Description:** Panel avec effet glassmorphism et bordure lumineuse.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Contenu |
| `variant` | `'default' \| 'highlight' \| 'danger'` | `'default'` | Style de bordure |
| `glow` | `boolean` | `false` | Active le glow externe |
| `className` | `string` | `''` | Classes additionnelles |

**Exemple:**

```tsx
<GlassPanel variant="highlight" glow className="p-4">
  <h2>Contenu</h2>
</GlassPanel>
```

**Styles par Variant:**

| Variant | Border Color | Glow |
|---------|--------------|------|
| `default` | `glass-border` | None |
| `highlight` | `neon-cyan/30` | Cyan glow |
| `danger` | `neon-orange/30` | Orange glow |

---

### 5.2 Button

**Fichier:** `src/components/ui/Button.tsx`

**Description:** Bouton avec animations hover/tap et variants.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Label |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'primary'` | Style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Taille |
| `icon` | `ReactNode` | - | Icône à gauche |

**Animations:**
- `whileHover`: scale 1.02
- `whileTap`: scale 0.98
- Transition: 150ms

---

### 5.3 DataText

**Fichier:** `src/components/ui/DataText.tsx`

**Description:** Affichage de nombres avec animation de compteur (odometer effect).

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | - | Valeur à afficher |
| `prefix` | `string` | `''` | Préfixe (ex: "€") |
| `suffix` | `string` | `''` | Suffixe |
| `decimals` | `number` | `0` | Décimales |
| `color` | `'cyan' \| 'magenta' \| 'orange' \| 'green' \| 'white'` | `'cyan'` | Couleur |

**Implémentation:**

```tsx
const spring = useSpring(0, { stiffness: 100, damping: 30 });
const display = useTransform(spring, (current) =>
  current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
);
```

---

## 6. Composants Dashboard

### 6.1 CoreStability

**Fichier:** `src/components/dashboard/CoreStability.tsx`

**Description:** Jauge circulaire SVG représentant la santé de la trésorerie. Animation continue avec comportement variable selon le niveau de santé.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `health` | `number` | - | 0-100, niveau de santé |
| `value` | `number` | - | Valeur monétaire |
| `label` | `string` | `'TRÉSORERIE'` | Label affiché |

**Comportements Visuels:**

| Health | Couleur | Rotation | Forme |
|--------|---------|----------|-------|
| > 70% | Cyan | Fluide, rapide | Cercle parfait |
| 40-70% | Magenta | Moyenne | Légère ellipse |
| < 40% | Orange | Lente, saccadée | Ellipse instable |
| < 20% | Orange | + Pulsation | + Clignotement |

**Structure SVG:**
1. Background circles (3 niveaux)
2. Rotating ring group (tick marks + main ring)
3. Health arc (progression)
4. Center point (pulsant si critique)

**Animation Loop:**

```tsx
useAnimationFrame((t) => {
  const speed = baseSpeed * (health / 100);
  const jitter = isUnstable ? Math.sin(t * 0.01) * (1 - health / 100) * 5 : 0;
  setRotation((prev) => prev + speed * delta + jitter);
});
```

---

### 6.2 ParallaxGrid

**Fichier:** `src/components/dashboard/ParallaxGrid.tsx`

**Description:** Grille de fond réactive au mouvement de la souris.

**Couches:**
1. **Main Grid** (50px) - Déplacement 1:1
2. **Fine Grid** (10px) - Déplacement 0.5:1
3. **Radial Gradient** - Vignette vers les bords
4. **Corner Accents** - SVG décoratifs

**Configuration Spring:**

```tsx
const springConfig = { stiffness: 50, damping: 20 };
```

---

### 6.3 KPICard

**Fichier:** `src/components/dashboard/KPICard.tsx`

**Description:** Carte affichant un indicateur clé avec tendance.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Titre de l'indicateur |
| `value` | `number` | Valeur principale |
| `prefix/suffix` | `string` | Formatage |
| `icon` | `ReactNode` | Icône Lucide |
| `trend` | `number` | Variation en % |
| `color` | `string` | Thème de couleur |

---

### 6.4 XPBar

**Fichier:** `src/components/dashboard/XPBar.tsx`

**Description:** Barre d'expérience fixe en haut avec effet shimmer.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `currentXP` | `number` | XP actuelle |
| `maxXP` | `number` | XP pour level up |
| `level` | `number` | Niveau actuel |

**Effet Shimmer:**

```tsx
animate={{
  x: ['-100%', '200%'],
}}
transition={{
  duration: 2,
  repeat: Infinity,
  ease: 'linear',
}}
```

---

## 7. Composants Layout

### 7.1 Sidebar

**Fichier:** `src/components/layout/Sidebar.tsx`

**Description:** Navigation latérale avec indicateur actif animé.

**Navigation Items:**

| ID | Label | Icône | Page |
|----|-------|-------|------|
| `dashboard` | TACTICAL | `LayoutDashboard` | Dashboard |
| `clients` | RADAR | `Users` | Clients |
| `invoices` | ARMURERIE | `FileText` | Invoices |
| `urssaf` | MENACE | `Calculator` | URSSAF |

**Indicateur Actif:**
- `layoutId="activeIndicator"` pour animation Framer Motion
- Barre verticale cyan avec glow

---

### 7.2 Header

**Fichier:** `src/components/layout/Header.tsx`

**Description:** En-tête avec titre dynamique, status système et actions.

**Sections:**
1. **Left:** Titre + Sous-titre
2. **Center:** Status "SYSTÈMES NOMINAUX" avec LED pulsante
3. **Right:** Search, Notifications, Profil

---

## 8. Pages

### 8.1 Dashboard

**Fichier:** `src/pages/Dashboard.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  KPI Card │ KPI Card │ KPI Card │ KPI Card          │
├───────────────────────────────┬─────────────────────┤
│                               │                     │
│       CoreStability           │   Activity Feed     │
│       (Jauge centrale)        │   (Flux récent)     │
│                               │                     │
├───────────────────────────────┴─────────────────────┤
│   Stat Bar  │   Stat Bar   │   Stat Bar            │
└─────────────────────────────────────────────────────┘
```

**Mock Data:**
- `treasury`: 12450€
- `health`: 75%
- `monthlyRevenue`: 8500€
- `pendingInvoices`: 3200€
- `expenses`: 2100€
- `urssafDue`: 1850€

---

### 8.2 Clients (Radar View)

**Fichier:** `src/pages/Clients.tsx`

**Composants:**
1. **Radar SVG** - Grille concentrique avec ligne de scan rotative
2. **Client Blips** - Points positionnés par angle/distance
3. **Target Lock** - Animation de sélection
4. **Detail Panel** - Panneau latéral coulissant

**Calcul Position:**

```tsx
const x = Math.cos((client.angle * Math.PI) / 180) * (client.distance * 2);
const y = Math.sin((client.angle * Math.PI) / 180) * (client.distance * 2);
```

**États Client:**
- `active` → Cyan
- `pending` → Magenta
- `inactive` → Orange

---

### 8.3 Invoices

**Fichier:** `src/pages/Invoices.tsx`

**Fonctionnalités:**
- Filtrage par status (all/draft/sent/paid/overdue)
- Tableau interactif avec hover states
- Actions par ligne (View, Download, Delete)
- Stats agrégées en header

**Status Config:**

| Status | Couleur | Icône | Label |
|--------|---------|-------|-------|
| `draft` | white/40 | Clock | Brouillon |
| `sent` | magenta | Send | Envoyée |
| `paid` | green | Check | Payée |
| `overdue` | orange | AlertTriangle | En retard |

---

### 8.4 URSSAF

**Fichier:** `src/pages/URSSAF.tsx`

**Sections:**

1. **Threat Indicator** - Jauge de menace avec countdown
2. **URSSAF Calculator** - CA × Taux = Montant
3. **TVA Calculator** - Collectée - Déductible = Net
4. **Payment Slider** - Validation par glissement

**Threat Levels:**

| Jours restants | Level | Couleur |
|----------------|-------|---------|
| > 60 | nominal | Cyan |
| 30-60 | warning | Magenta |
| < 30 | critical | Orange + Pulsation |

**Slider Mécanique:**

```tsx
drag="x"
dragConstraints={{ left: 0, right: 250 }}
onDragEnd → Si progress >= 95% → Armé → Release → Paiement
```

**Warp Speed Effect:**
- 100 lignes animées verticalement
- Flash lumineux sur validation

---

## 9. Animations & Interactions

### 9.1 Principes

| Principe | Valeur | Justification |
|----------|--------|---------------|
| Response time | < 100ms | Perception instantanée |
| Duration courte | 150-300ms | UI snappy |
| Duration longue | 500-800ms | Transitions de page |
| Easing | `[0.23, 1, 0.32, 1]` | Courbe custom "unfold" |

### 9.2 Framer Motion Patterns

**Page Transitions:**

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={activeTab}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
```

**Hover/Tap:**

```tsx
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
transition={{ duration: 0.15 }}
```

**Stagger Children:**

```tsx
{items.map((item, index) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
  />
))}
```

### 9.3 SVG Animations

**Rotation Continue:**

```tsx
useAnimationFrame((time) => {
  setRotation(prev => prev + speed * delta);
});
```

**Stroke Animation:**

```tsx
<motion.circle
  strokeDasharray={`${progress * circumference} ${circumference}`}
  initial={{ strokeDasharray: '0 659.73' }}
  animate={{ strokeDasharray: `${value} 659.73` }}
/>
```

---

## 10. État & Data Flow

### 10.1 État Actuel (MVP)

**Local State uniquement:**

```tsx
// App.tsx
const [activeTab, setActiveTab] = useState('dashboard');

// Pages
const [selectedClient, setSelectedClient] = useState<Client | null>(null);
const [filter, setFilter] = useState<'all' | Status>('all');
```

### 10.2 Architecture Cible

```
┌─────────────────────────────────────────────────────────┐
│                    React Context                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ AuthContext │  │ UserContext │  │ ThemeContext│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Zustand Stores                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ clientStore │  │invoiceStore │  │ financeStore│     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    React Query                           │
│         (Server State, Cache, Mutations)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 11. Performance

### 11.1 Optimisations Actuelles

| Technique | Implémentation |
|-----------|----------------|
| Code Splitting | Vite automatic chunks |
| CSS | Tailwind purge en prod |
| Images | SVG inline (pas de requêtes) |
| Animations | GPU-accelerated (transform, opacity) |
| Re-renders | Local state isolation |

### 11.2 Métriques Cibles

| Métrique | Cible | Actuel |
|----------|-------|--------|
| FCP | < 1.5s | ~1s |
| LCP | < 2.5s | ~1.5s |
| CLS | < 0.1 | ~0 |
| TTI | < 3.5s | ~2s |
| Bundle Size | < 200KB | ~150KB |

### 11.3 Recommandations Futures

1. **Lazy Loading** des pages avec `React.lazy()`
2. **Memoization** des composants lourds
3. **Virtual Scrolling** pour listes longues
4. **Service Worker** pour cache offline

---

## 12. Conventions de Code

### 12.1 Naming

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `GlassPanel.tsx` |
| Hooks | camelCase + use | `useClientData` |
| Utils | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `Client`, `Invoice` |
| Constants | SCREAMING_SNAKE | `MAX_ITEMS` |

### 12.2 Imports

```tsx
// 1. React
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// 2. External libs
import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';

// 3. Internal components
import { GlassPanel } from '../components/ui';

// 4. Types/Utils
import type { Client } from '../types';
```

### 12.3 Component Structure

```tsx
// 1. Imports
import { motion } from 'framer-motion';

// 2. Types
interface ComponentProps {
  prop: string;
}

// 3. Constants
const CONFIG = {};

// 4. Component
export function Component({ prop }: ComponentProps) {
  // State
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  const handleClick = () => {};
  
  // Render
  return <div />;
}
```

---

## 13. Roadmap Technique

### Phase 1 : Core (ACTUEL) ✅

- [x] Setup projet (Vite + React + TS)
- [x] Design System Tailwind v4
- [x] Composants UI de base
- [x] Dashboard avec CoreStability
- [x] Vue Radar Clients
- [x] Liste Factures
- [x] Calculateur URSSAF
- [x] Navigation + Layout
- [x] Animations Framer Motion

### Phase 2 : Backend (À FAIRE)

- [ ] Configuration Supabase
- [ ] Schéma base de données
- [ ] Authentification
- [ ] CRUD Clients
- [ ] CRUD Factures
- [ ] Calculs automatiques

### Phase 3 : Features Avancées

- [ ] Connexion bancaire (API)
- [ ] Génération PDF
- [ ] Sound Design
- [ ] Système XP complet
- [ ] Skins documents
- [ ] Notifications temps réel

### Phase 4 : Production

- [ ] Tests E2E
- [ ] CI/CD
- [ ] Monitoring
- [ ] Documentation utilisateur
- [ ] Wrapper Tauri (Desktop)

---

## Annexes

### A. Variables d'Environnement

```env
# .env.local (à créer)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

### B. Scripts NPM

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

### C. Ressources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Lucide Icons](https://lucide.dev/)

---

*Documentation générée le 01/01/2026 - ORBITAL COMMAND v0.1.0*
