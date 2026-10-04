import { motion } from 'framer-motion';
import { Cpu, Database, Layers, LucideIcon } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { CLASS_SPLIT, TOTAL_CLASSES } from '../lib/classData';

type Feature = {
  icon: LucideIcon;
  accent: 'coral' | 'green' | 'teal';
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: Cpu,
    accent: 'coral',
    title: 'Transfer Learning Base',
    body: 'Built on EfficientNetV2 architecture, utilizing Fused-MBConv blocks and strided convolutions (rather than heavy max pooling) to maximize edge-inference speed while maintaining >99% accuracy.',
  },
  {
    icon: Layers,
    accent: 'green',
    title: 'Custom Classification Head',
    body: 'Employs a Global Average Pooling 2D (GAP) layer, followed by dense layers with aggressive dropout, outputting probabilities across 38 distinct crop-disease classes using softmax. This architectural choice resulted in an exceptional 0.67% train/val overfitting gap.',
  },
  {
    icon: Database,
    accent: 'teal',
    title: 'Stratified Data Balancing Pipeline',
    body: 'The 38 classes were aggressively balanced using downsampling and image augmentation to a strict cap of 500 images per class, completely eliminating the previous class imbalance.',
  },
];

const accentMap = {
  coral: { bg: 'bg-accent-coral-soft', text: 'text-accent-coral' },
  green: { bg: 'bg-accent-green-soft', text: 'text-accent-green' },
  teal: { bg: 'bg-accent-teal/15', text: 'text-accent-teal' },
};

const DONUT_DATA = [
  { name: 'Balanced Diseased Classes', value: CLASS_SPLIT.diseased, color: '#4d5757' },
  { name: 'Balanced Healthy Classes', value: CLASS_SPLIT.healthy, color: '#c9cbbe' },
];

export default function Overview() {
  return (
    <>
      <PageHeader
        title="Project Overview"
        subtitle="Architecture details and dataset distribution for Leaflytics."
      />

      <div className="feature-grid">
        {FEATURES.map((f) => {
          const a = accentMap[f.accent];
          const Icon = f.icon;
          return (
            <motion.div key={f.title} whileHover={{ opacity: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
              <Card className="feature-card h-full p-5">
                <div className={`mb-4 flex h-9 w-9 items-center justify-center rounded-lg ${a.bg}`}>
                  <Icon className={`h-4 w-4 ${a.text}`} strokeWidth={2.2} />
                </div>
                <h3 className="text-[15px] font-semibold tracking-tight text-ink-primary">
                  {f.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">{f.body}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="distribution-card mt-6 p-5">
        <h3 className="text-[15px] font-semibold tracking-tight text-ink-primary">
          PlantVillage Dataset Distribution
        </h3>

        <div className="relative mt-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DONUT_DATA}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {DONUT_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, n: string) => [`${v} classes`, n]}
                cursor={{ fill: 'transparent' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] font-semibold leading-none tracking-tight text-ink-primary">
              {TOTAL_CLASSES}
            </span>
            <span className="mt-1 text-[11px] uppercase tracking-wider text-ink-muted">classes</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-[12px]">
          {DONUT_DATA.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-ink-secondary">{d.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
