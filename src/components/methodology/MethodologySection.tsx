import { motion } from 'framer-motion';
import { ExternalLink, AlertTriangle } from 'lucide-react';

const dataSources = [
  { name: 'ILOSTAT × Gmyrek (2023): GenAI task exposure scores', url: 'https://ilostat.ilo.org/' },
  { name: 'World Bank WDI: WGI Regulatory Quality, OADR, GDP per capita PPP', url: 'https://data.worldbank.org/' },
  { name: 'World Bank WGI: governance estimates', url: 'https://info.worldbank.org/governance/wgi/' },
  { name: 'AWS / Azure / Google Cloud / Alibaba / Tencent: hyperscale cloud regions', url: 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/' },
  { name: 'Cloudscene / DataCenterMap: colocation density', url: 'https://cloudscene.com/' },
  { name: 'Ookla / Speedtest Global Index: international bandwidth', url: 'https://www.speedtest.net/global-index' },
  { name: '92 national AI / data-protection policy documents (governance corpus)', url: '#' },
];

const Section = ({
  delay = 0,
  title,
  conceptTag,
  children,
  accent,
}: {
  delay?: number;
  title: string;
  conceptTag?: string;
  accent?: string;
  children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="mb-8 p-6 rounded-xl bg-bg-secondary border border-border-subtle"
  >
    <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-3">
      {accent && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />}
      <span>{title}</span>
      {conceptTag && (
        <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-normal ml-1">
          {conceptTag}
        </span>
      )}
    </h2>
    <div className="space-y-3 text-sm text-text-secondary leading-relaxed">{children}</div>
  </motion.section>
);

const Formula = ({ children }: { children: React.ReactNode }) => (
  <div className="my-3 px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle font-mono text-[13px] text-text-primary overflow-x-auto">
    {children}
  </div>
);

const Quote = ({ children }: { children: React.ReactNode }) => (
  <blockquote className="border-l-2 border-accent-primary/60 pl-4 italic text-text-secondary my-3">
    {children}
  </blockquote>
);

export const MethodologySection = () => {
  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-y-auto bg-bg-primary">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-10 md:py-14">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 tracking-tight">
            Methodology
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed">
            The Atlas surfaces the Build–Break–Balance framework developed in{' '}
            <span className="text-text-primary">
              Mynott (2026), "Build–Break–Balance: A Non-Compensatory Framework for Cross-National
              AI Governance Risk Assessment"
            </span>{' '}
            (UCL Geography, supervised by Andrew Barry and Alan Ingram). All numbers below are from
            the canonical methodology run (March 2026). Definitions, formulas, and cluster labels
            follow the dissertation verbatim.
          </p>
        </motion.div>

        <Section delay={0.05} title="The framework">
          <p>
            The framework adapts the Hazard–Exposure–Resilience triad from disaster-risk geography
            (Wisner et al., 2004) into three pillars kept analytically distinct: <strong className="text-text-primary">Build</strong> (Hazard) is where AI capability physically concentrates;{' '}
            <strong className="text-text-primary">Break</strong> (Exposure) is where labour markets
            face AI-driven task transformation; <strong className="text-text-primary">Balance</strong>{' '}
            (Resilience) is whether governance institutions have the implemented capacity to manage
            disruption.
          </p>
          <Quote>
            "Their weighting schemes allow strength in one dimension to offset weakness in another,
            so the gap between capability and governance never surfaces in the output. It has been
            averaged away."
          </Quote>
          <p>
            The framework is <em>diagnostically non-compensatory</em>: each pillar is reported and
            interpretable independently. Pillars combine multiplicatively into Net Displacement Risk,
            but the composite never replaces the pillar-level view.
          </p>
        </Section>

        <Section
          delay={0.1}
          title="Build · Hazard"
          conceptTag="Where capability physically concentrates"
          accent="#F59E0B"
        >
          <p>
            Build treats AI capability as a hazard source, not an asset. It is decomposed into two
            channels with distinct governance implications.
          </p>
          <ul className="space-y-2 ml-1">
            <li>
              <strong className="text-text-primary">Build-supply</strong> — domestic AI deployment
              capacity. Hyperscale cloud regions (AWS / Azure / GCP / Alibaba / Tencent),
              colocation data centre density per million population (Cloudscene), grid reliability
              (World Bank WDI).
            </li>
            <li>
              <strong className="text-text-primary">Build-access</strong> — connectivity through which
              imported AI services reach the economy. Internet penetration (WDI), international
              bandwidth per user (Ookla).
            </li>
          </ul>
          <Formula>Hazard = 1 − (1 − Build-supply)(1 − Build-access)</Formula>
          <p>
            Probabilistic union ensures either channel can generate hazard independently. Channels
            stay separate for the risk computation so governance can moderate each one differently.
            All indicators are winsorised at the 95th percentile and min-max scaled to [0, 1].
          </p>
        </Section>

        <Section
          delay={0.15}
          title="Break · Exposure"
          conceptTag="Demographic decomposition"
          accent="#EF4444"
        >
          <p>
            The same task-exposure measure splits into two opposing terms depending on workforce age
            structure. Old-age dependency ratio (OADR) drives the split.
          </p>
          <Formula>
            Break-displacement = Exposure × (1 − OADR_norm) &nbsp;·&nbsp; enters risk
            <br />
            Break-shortage &nbsp;= Exposure × OADR_norm &nbsp;·&nbsp; companion only
          </Formula>
          <Quote>
            "Take two countries with the same aggregate task-exposure score, say 0.6. In Nigeria,
            the workforce is young and expanding… In Japan, the workforce is ageing and shrinking.
            Same number. Completely different situation."
          </Quote>
          <p>
            Japan and the United States have nearly identical raw exposure (0.319 vs 0.315) and both
            sit at high Hazard (0.92 / 1.00). Japan registers zero displacement risk; the United
            States ranks seventh. The decomposition is the framework's single most consequential
            design choice — and the dissertation's most fragile, by its own admission.
          </p>
        </Section>

        <Section
          delay={0.2}
          title="Balance · Resilience"
          conceptTag="Documented governance, not governance itself"
          accent="#10B981"
        >
          <p>
            Balance is scored from 92 national AI and data-protection policy documents across 48
            units. An LLM jury applies three structurally enforced perspectives per evidence bundle
            (Bureaucrat — de jure 0-2; Skeptic — de facto 2-3; Judge — anomalies). Every score
            traces to a verbatim, algorithmically verified quotation in the source document.
          </p>
          <p className="text-text-primary font-medium">Five governance sub-pillars, each scored 0-3 on de jure and de facto:</p>
          <ul className="space-y-1.5 ml-1">
            <li>· Legal and Institutional Framework</li>
            <li>· Standards and Certification Infrastructure</li>
            <li>· Audit and Oversight Capacity</li>
            <li>· Worker Protection and Adaptation Systems</li>
            <li>· Transparency and Participation Mechanisms</li>
          </ul>
          <p>
            Per sub-pillar: (de jure + de facto) / 2. Averaged across observed sub-pillars (≥4 of 5
            required). Final divided by 3 to map onto [0, 1]. Coverage threshold is met for all 48
            units in the current run.
          </p>
          <Quote>
            "Balance-raw should therefore be interpreted as a conservative lower bound on
            documented, machine-recoverable governance evidence — still more than existing indices
            measure, because they do not make the de jure / de facto distinction at all."
          </Quote>
          <p className="text-text-tertiary text-[13px]">
            <strong className="text-text-secondary">Headline finding:</strong> Worker Protection is
            the most deficient governance dimension globally. 14 of 47 sovereign states score zero
            on both de jure and de facto. Singapore — audit and enforcement 3/3, worker protection
            0/0 — is the canonical case of the commensuration problem the framework was built to
            detect.
          </p>
        </Section>

        <Section delay={0.25} title="Sovereignty discount" conceptTag="Channel-specific governance" accent="#14B8A6">
          <Formula>S = 0.5 + 0.5 × (domestic cloud regions / total cloud regions)</Formula>
          <p>
            S applies only to the supply-side balance term: <code className="text-text-primary">balance_supply = balance_raw × S</code>;{' '}
            <code className="text-text-primary">balance_access = balance_raw</code>. A country can have
            strong governance on paper, but if its cloud is run by foreign hyperscalers, its
            effective leverage over supply-side risk is halved. In practice, S primarily
            differentiates the United States (S = 0.92) from all other countries with cloud presence
            (S = 0.50). Countries with no cloud regions receive S = 1.0.
          </p>
        </Section>

        <Section delay={0.3} title="Net Displacement Risk" conceptTag="The composite" accent="#8B5CF6">
          <Formula>
            Risk-supply = Build-supply × Break-displacement × (1 − Balance-supply)
            <br />
            Risk-access = Build-access × Break-displacement × (1 − Balance-access)
            <br />
            Risk &nbsp;= 1 − (1 − Risk-supply)(1 − Risk-access)
            <br />
            Risk-viz &nbsp;= Risk^(1/3) &nbsp;·&nbsp; choropleth colour only; does not alter rank order
          </Formula>
          <p>
            The composite is multiplicative because each term must be non-trivial for risk to
            register: capability × vulnerability × failure-to-mitigate. Build × Break ≈ 0 in
            Ethiopia (no infrastructure) and in Japan / Finland / Portugal (aging absorbs
            displacement). High Build × high Break × low Balance — the High-risk cluster — is where
            the framework concentrates concern.
          </p>
          <Quote>
            "In compensatory indices, high capability makes a country appear safer. In this
            specification, high capability makes a country appear riskier. Build is a risk factor,
            not a protective factor."
          </Quote>
        </Section>

        <Section delay={0.35} title="Cluster typology · k = 5" conceptTag="Selected by silhouette">
          <p>
            k-medoids clustering on (Hazard, Break-displacement, Balance-raw) with Gower distance
            and 500 bootstrap iterations. The dissertation's verbatim cluster labels:
          </p>
          <div className="space-y-2 mt-3">
            {[
              { id: 1, label: 'EU regulatory', desc: 'High Hazard 0.88, highest Balance 0.55, lowest Risk 0.09. 14 EU states + UK + EU itself.', color: '#10B981' },
              { id: 2, label: 'Emerging', desc: 'Middle-income across Latin America, Sub-Saharan Africa, South/Southeast Asia. Build exceeds Balance.', color: '#F59E0B' },
              { id: 3, label: 'High-income non-EU', desc: 'Highest Hazard 0.94. USA, JPN, KOR, AUS, CAN, CHE, CHL, THA, VNM.', color: '#3B82F6' },
              { id: 4, label: 'Low-income', desc: 'Near-zero Hazard 0.23. Risk low because the infrastructure to generate disruption is absent.', color: '#6B7280' },
              { id: 5, label: 'High-risk', desc: 'Gulf states + ISR + MYS + SGP. Highest Risk 0.56, lowest Balance 0.20 — lower than the Low-income cluster.', color: '#EF4444' },
            ].map((c) => (
              <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary border border-border-subtle">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${c.color} 18%, transparent)`,
                    color: c.color,
                    border: `1px solid color-mix(in srgb, ${c.color} 35%, transparent)`,
                  }}
                >
                  {c.id}
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary">{c.label}</div>
                  <div className="text-[13px] text-text-secondary leading-snug">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3">
            The High-risk cluster (5) is the least stable. In the canonical run, Israel (0.66),
            Singapore (0.65) and Malaysia (0.68) sit below the 0.70 bootstrap stability threshold —
            their assignment is sensitive to sample composition. The cluster is{' '}
            <em>interpretively useful</em>, not a hard classification for those three cases. The
            UAE (0.88) and Saudi Arabia (0.86) are stably assigned to it here, though the
            dissertation's discussion treats all five members as boundary cases worth flagging.
          </p>
        </Section>

        <Section delay={0.4} title="The governance gap" conceptTag="Headline finding" accent="#8B5CF6">
          <Quote>
            "The five countries this framework identifies as facing the greatest AI governance risk
            (the UAE, Singapore, Saudi Arabia, Israel and Malaysia) are precisely the countries that
            major readiness indices rank among the most AI-ready. Compensatory aggregation averages
            the gap away."
          </Quote>
          <p>
            Under compensatory indices (Oxford Insights GAI Readiness, Global Innovation Index), the
            top-5 risk countries appear most ready. Here, the same strengths become risk factors —
            Hazard amplifies governance weakness rather than offsetting it. The framework
            "measures against that grain." This is not a marginal reordering; it is a qualitative
            reversal of which countries the measurement instrument flags as problematic.
          </p>
        </Section>

        <Section delay={0.45} title="Sample" conceptTag="48 units">
          <p>
            47 sovereign states + the European Union as a supranational entity, stratified across
            World Bank income groups and UN geoscheme regions. The EU is included in clustering as a
            distinct unit alongside its member states — its pillar scores are computed from sampled
            member-state data and the EU AI Act (which contributes the only de jure = 3.0 on
            Standards in the sample).
          </p>
        </Section>

        <Section delay={0.5} title="Validation and sensitivity" conceptTag="9 specifications">
          <p>
            Eight of nine sensitivity specifications produce Spearman rank correlations above 0.95
            with the baseline. The single fragile specification is the demographic decomposition
            itself: removing OADR weighting and substituting raw exposure produces ρ = 0.50 and
            reorders 46 of 48 countries (Japan drops 38 places, becoming a high-risk country).
          </p>
          <Quote>
            "This is not a deficiency in the robustness architecture. It is a substantive finding
            about what the framework is measuring."
          </Quote>
          <p>
            Convergent validity against the WGI Regulatory Quality index: Spearman ρ = 0.566
            (p &lt; 0.001) — moderate by design. Too high a correlation would suggest Balance is
            simply proxying for general state regulatory capacity; too low would raise questions
            about whether it measures governance at all.
          </p>
        </Section>

        <Section delay={0.55} title="Limitations that bite">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-text-primary font-medium">Kafala caveat (Gulf states)</p>
                <p className="text-[13px] mt-1">
                  OADR does not directly measure labour scarcity. In kafala-sponsorship regimes,
                  migrant workforces push OADR down despite no conventional labour shortage. The
                  framework's two highest-risk findings (UAE and Saudi Arabia) are therefore
                  partially contingent on a proxy whose validity is weakest for exactly those
                  countries.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-text-primary font-medium">Informal sector underestimation</p>
                <p className="text-[13px] mt-1">
                  Task exposure captures formal occupational structures. In countries where informal
                  employment exceeds 50% of total employment, Break-displacement measures exposure
                  in the fraction of the labour market least representative of the workforce that
                  will actually experience AI-driven disruption.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-text-primary font-medium">Typology over ordinal precision</p>
                <p className="text-[13px] mt-1">
                  38 country pairs are statistically indistinguishable. Australia (rank 8) and the
                  Philippines (rank 17) have a rank-reversal probability of 0.500. Mid-table ranks
                  should be treated as approximate; the robust signal is in cluster archetypes and
                  extreme positions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-text-primary font-medium">Extraterritorial governance</p>
                <p className="text-[13px] mt-1">
                  Governance is modelled as a property of the consuming state. AI imported through
                  Build-access may carry safety properties imposed by the provider's home
                  jurisdiction — an extraterritorial dimension this framework does not capture.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section delay={0.6} title="Auto-critique" conceptTag="From the dissertation">
          <p>The author identifies three things he would do differently:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Code a human benchmark. The LLM jury is auditable but not validated against expert
              judgment.
            </li>
            <li>
              Run at least one alternative demographic proxy as a formal sensitivity test — labour
              force participation by age band, dependency-rate alternatives — rather than leaving
              that for future work.
            </li>
            <li>
              Stress-test the Acemoglu–Restrepo theoretical mechanism in non-market labour regimes
              (kafala, conscription, state-allocation) before operationalising it. The kafala
              divergence is not just a limitation of the proxy but a limitation of the theoretical
              transfer.
            </li>
          </ol>
        </Section>

        <Section delay={0.65} title="Data sources">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataSources.map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-bg-primary border border-border-subtle hover:border-accent-primary transition-colors"
              >
                <span className="text-[13px] text-text-primary">{source.name}</span>
                <ExternalLink className="w-4 h-4 text-text-tertiary shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </Section>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-[12px] text-text-tertiary text-center mb-8"
        >
          Run: <code className="font-mono">run_20260311_133135</code> · n = 48 · k = 5 ·{' '}
          documents = 92
        </motion.p>
      </div>
    </div>
  );
};
