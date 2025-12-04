import { motion } from 'framer-motion';
import { ExternalLink, Download } from 'lucide-react';

const dataSources = [
  { name: 'Stanford HAI AI Index', url: 'https://aiindex.stanford.edu/' },
  { name: 'OECD AI Policy Observatory', url: 'https://oecd.ai/' },
  { name: 'Our World in Data', url: 'https://ourworldindata.org/' },
  { name: 'World Bank Open Data', url: 'https://data.worldbank.org/' },
  { name: 'World Governance Indicators (WGI)', url: 'https://info.worldbank.org/governance/wgi/' },
  { name: 'ILO Statistics', url: 'https://ilostat.ilo.org/' },
  { name: 'Scopus (Elsevier)', url: 'https://www.scopus.com/' },
];

/**
 * Methodology page explaining the Build-Break-Balance framework
 */
export const MethodologySection = () => {
  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto bg-bg-primary">
      <div className="max-w-4xl mx-auto px-8 py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Methodology
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            This atlas uses a non-compensatory framework to assess AI governance readiness. 
            Rather than aggregating scores into a single ranking, it keeps three dimensions 
            analytically separate to reveal structural tensions.
          </p>
        </motion.div>

        {/* Framework Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 via-red-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
              ⚖
            </span>
            The Build-Break-Balance Framework
          </h2>
          <div className="space-y-4">
            <p className="text-text-secondary leading-relaxed">
              Traditional AI readiness indices aggregate multiple dimensions into a single score, 
              obscuring the relationship between capability and governance. A country ranking highly 
              overall might have strong AI capability but weak worker protections—a tension invisible 
              in composite rankings.
            </p>
            <p className="text-text-secondary leading-relaxed">
              This framework keeps three pillars separate, enabling analysis of where capability 
              outpaces governance.
            </p>
          </div>
        </motion.section>

        {/* Build Pillar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 rounded-xl bg-bg-secondary border border-border-subtle"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            Build: Material AI Capacity
          </h2>
          <p className="text-text-secondary mb-4">
            Measures a country's tangible capacity to develop and deploy AI systems.
          </p>
          
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
            Indicators
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span><strong className="text-text-primary">Compute Infrastructure:</strong> Data centre capacity, GPU availability, cloud computing resources (Source: Cloudscene, 2024)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span><strong className="text-text-primary">Research Output:</strong> AI publications, citations, patent filings (Source: Scopus, USPTO, 2023-24)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span><strong className="text-text-primary">Talent Pool:</strong> AI researchers, engineering graduates, skills availability (Source: LinkedIn Talent Insights, OECD)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span><strong className="text-text-primary">Investment:</strong> Private AI investment, government R&D spending (Source: Stanford HAI Index, 2024)</span>
            </li>
          </ul>
          
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3 mt-6">
            Calculation
          </h3>
          <p className="text-sm text-text-secondary">
            Each indicator is normalized to 0-1 scale using min-max normalization across the sample. 
            Final Build score is the weighted average: Compute (30%), Research (25%), Talent (25%), Investment (20%).
          </p>
        </motion.section>

        {/* Break Pillar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 p-6 rounded-xl bg-bg-secondary border border-border-subtle"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            Break: Labour Market Exposure
          </h2>
          <p className="text-text-secondary mb-4">
            Measures how exposed a country's workforce is to AI-driven disruption.
          </p>
          
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
            Indicators
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span><strong className="text-text-primary">Task Exposure:</strong> Share of tasks automatable by current AI (Methodology: Acemoglu & Restrepo, 2022)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span><strong className="text-text-primary">Occupation Concentration:</strong> Employment in high-exposure occupations (Source: ILO, national labour statistics)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span><strong className="text-text-primary">Sector Vulnerability:</strong> GDP share from AI-exposed sectors (Source: World Bank, OECD)</span>
            </li>
          </ul>
          
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3 mt-6">
            Calculation
          </h3>
          <p className="text-sm text-text-secondary">
            Task exposure weighted by occupation share in national employment. Distinguishes between 
            high-exposure/low-complementarity (HELC) and high-exposure/high-complementarity (HEHC) jobs.
          </p>
        </motion.section>

        {/* Balance Pillar */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 p-6 rounded-xl bg-bg-secondary border border-border-subtle"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            Balance: Safety Capacity Index
          </h2>
          <p className="text-text-secondary mb-4">
            Measures implemented governance—not policy promises, but actual institutional capacity.
          </p>
          
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
            Sub-pillars
          </h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">•</span>
              <span><strong className="text-text-primary">Legal & Institutional:</strong> AI-specific legislation, regulatory bodies, enforcement mechanisms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">•</span>
              <span><strong className="text-text-primary">Standards & Certification:</strong> Technical standards adoption, conformity assessment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">•</span>
              <span><strong className="text-text-primary">Audit & Oversight:</strong> Algorithmic impact assessments, audit requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">•</span>
              <span><strong className="text-text-primary">Worker Protection:</strong> Retraining programs, transition support, consultation rights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">•</span>
              <span><strong className="text-text-primary">Transparency & Participation:</strong> Disclosure requirements, public engagement</span>
            </li>
          </ul>
          
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3 mt-6">
            Scoring (0-2 Scale)
          </h3>
          <p className="text-sm text-text-secondary mb-3">
            Each indicator is scored based on documentary evidence from primary sources:
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">•</span>
              <span><strong className="text-text-primary">0</strong> = No relevant capacity evident</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">•</span>
              <span><strong className="text-text-primary">1</strong> = High-level strategy, principles, or non-binding commitments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">•</span>
              <span><strong className="text-text-primary">2</strong> = Binding rules and a designated responsible authority</span>
            </li>
          </ul>

          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3 mt-6">
            Implementation Capacity
          </h3>
          <p className="text-sm text-text-secondary">
            Since consistent implementation evidence (enforcement statistics, budget documents, audit reports) 
            is not available globally, implementation capacity is modelled separately using World Governance 
            Indicators (WGI) as a proxy for national enforcement capacity. While not AI-specific, WGI provides 
            the best available measure of a country's general capacity to implement and enforce regulatory frameworks.
          </p>
          
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3 mt-6">
            Calculation
          </h3>
          <p className="text-sm text-text-secondary">
            Indicator scores within each sub-pillar are averaged. The five sub-pillar means are combined 
            with the WGI implementation proxy and rescaled to [0,1] to produce the final Safety Capacity Index.
          </p>
        </motion.section>

        {/* Risk Imbalance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12 p-6 rounded-xl bg-bg-secondary border border-border-subtle"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            Risk Imbalance: The Governance Gap
          </h2>
          <p className="text-text-secondary mb-4">
            Derived measure showing where capability and exposure together outpace governance.
          </p>
          
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
            Calculation
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            <code className="px-2 py-1 bg-bg-primary rounded text-xs font-mono">
              Risk Imbalance = (Build × Break) − Balance
            </code>
          </p>
          
          <p className="text-sm text-text-secondary mb-4">
            This formula embodies two substantive assumptions:
          </p>
          
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">1.</span>
              <span><strong className="text-text-primary">Build and Break interact multiplicatively</strong> — high material capability is most 
              concerning where labour exposure is also high. High exposure in the absence of capability to 
              deploy AI is less immediately risky. The product term reflects this joint dependence.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">2.</span>
              <span><strong className="text-text-primary">Balance moderates risk additively</strong> — safety capacity reduces net risk through 
              multiple, partially independent channels (legal limits, standards, enforcement, worker adaptation). 
              Additive subtraction captures this buffering effect.</span>
            </li>
          </ul>
          
          <p className="text-sm text-text-secondary mt-4">
            Positive values indicate that capability and exposure together exceed governance capacity (higher risk). 
            Negative values indicate governance capacity exceeds current capability-exposure levels.
          </p>
        </motion.section>

        {/* Data Sources */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Data Sources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataSources.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center justify-between p-3 rounded-lg 
                  bg-bg-secondary border border-border-subtle 
                  hover:border-accent-primary 
                  transition-colors
                "
              >
                <span className="text-sm text-text-primary">{source.name}</span>
                <ExternalLink className="w-4 h-4 text-text-tertiary" />
              </a>
            ))}
          </div>
        </motion.section>

        {/* Download Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12 p-6 rounded-xl bg-bg-secondary border border-border-subtle"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Full Documentation
          </h2>
          <p className="text-text-secondary mb-4">
            Download the complete methodology document including all indicator definitions, 
            data sources, and calculation procedures.
          </p>
          <a
            href="/methodology.pdf"
            target="_blank"
            className="
              inline-flex items-center gap-2 
              px-4 py-2.5 rounded-lg 
              bg-accent-primary text-white 
              text-sm font-medium 
              hover:opacity-90 
              transition-opacity
            "
          >
            <Download className="w-4 h-4" />
            Download Methodology (PDF)
          </a>
        </motion.section>

        {/* Sample & Limitations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Sample & Limitations
          </h2>
          <div className="space-y-4 text-text-secondary">
            <p>
              <strong className="text-text-primary">Sample:</strong> 35 countries selected for geographic diversity and data availability. 
              Includes G20 members, EU states, and emerging AI nations.
            </p>
            <p>
              <strong className="text-text-primary">Time period:</strong> 2023-2024 snapshot. Governance landscapes change rapidly; 
              scores reflect conditions at time of data collection.
            </p>
            <p>
              <strong className="text-text-primary">Limitations:</strong> Balance scores rely on de jure assessment of governance 
              mechanisms. De facto implementation and enforcement quality not fully captured. 
              Labour exposure estimates based on task-level analysis; actual displacement patterns 
              may differ.
            </p>
          </div>
        </motion.section>

      </div>
    </div>
  );
};

