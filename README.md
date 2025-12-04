# Build-Break-Balance Atlas

An interactive data visualization atlas exploring AI governance across nations. This platform visualizes three critical dimensions:

- **Build**: AI capability and infrastructure capacity
- **Break**: Labour market exposure to AI automation  
- **Balance**: Governance readiness and regulatory capacity

The core insight: these three dimensions should **NOT** be aggregated because they represent qualitatively different risk profiles.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **Vite 5.x** - Build tool and dev server
- **React 18.x** - UI framework
- **TypeScript 5.x** - Type safety (strict mode)
- **Tailwind CSS 3.x** - Styling
- **Zustand 4.x** - State management
- **Framer Motion 11.x** - Animations
- **D3.js 7.x** - Data visualization
- **Papa Parse 5.x** - CSV parsing
- **Lucide React** - Icons

## Project Structure

```
src/
├── main.tsx                 # App entry point
├── App.tsx                  # Root component
├── components/
│   ├── layout/              # App shell, header, theme toggle
│   ├── scrollytelling/      # Narrative story components
│   ├── exploration/         # Interactive exploration views
│   ├── visualisations/      # D3 chart components
│   ├── country/             # Country detail components
│   └── ui/                  # Reusable UI primitives
├── data/                    # Static data files
├── store/                   # Zustand state management
├── types/                   # TypeScript interfaces
├── utils/                   # Data loading and helpers
├── hooks/                   # Custom React hooks
└── styles/                  # Global CSS and design tokens
```

## Design System

The atlas uses a dual-theme system with CSS custom properties:

### Theme Colors

| Token | Light | Dark |
|-------|-------|------|
| `--bg-primary` | #FAFAFA | #0A0A0A |
| `--bg-secondary` | #FFFFFF | #141414 |
| `--text-primary` | #171717 | #FAFAFA |
| `--accent-primary` | #2563EB | #3B82F6 |

### Pillar Colors

| Pillar | Color | CSS Variable |
|--------|-------|--------------|
| Build | Amber | `--color-build: #F59E0B` |
| Break | Red | `--color-break: #EF4444` |
| Balance | Emerald | `--color-balance: #10B981` |
| Risk | Purple | `--color-risk: #8B5CF6` |

## Data Schema

Countries are characterized by:

- **Build Indicators**: Compute, datacentres, energy, research
- **Break Indicators**: Exposure, complementarity
- **Balance Indicators**: Legal, standards, audit, worker protections, transparency
- **Risk Imbalance**: Build - Balance gap (higher = more governance risk)

## License

MIT

