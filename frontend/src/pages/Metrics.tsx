import { Activity, Boxes, Database, Target } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { HEADLINE, TRAINING_HISTORY } from '../lib/metricsData';

export default function Metrics() {
  return (
    <>
      <PageHeader
        title="Training Metrics"
        subtitle="Training curves and model characteristics. These are illustrative recorded figures, not live telemetry."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Validation Acc."
          value={HEADLINE.valAccuracy.toFixed(2)}
          unit="%"
          icon={Target}
          accent="green"
        />
        <StatCard
          label="Overfit Gap"
          value={HEADLINE.overfitGap.toFixed(2)}
          unit="%"
          icon={Activity}
          accent="coral"
        />
        <StatCard
          label="Classes"
          value={String(HEADLINE.classes)}
          icon={Boxes}
          accent="teal"
        />
        <StatCard
          label="Imgs / Class"
          value={String(HEADLINE.imagesPerClass)}
          icon={Database}
          accent="green"
        />
      </div>

      <div className="chart-grid mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-[15px] font-semibold tracking-tight text-ink-primary">
            Accuracy over Epochs
          </h3>
          <p className="mt-1 text-[12px] text-ink-secondary">Train vs. validation, 10 epochs</p>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TRAINING_HISTORY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="epoch" tickLine={false} axisLine={false} />
                <YAxis domain={[70, 100]} tickLine={false} axisLine={false} unit="%" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, color: '#b1bcb7' }} />
                <Line
                  type="monotone"
                  dataKey="train_acc"
                  name="Train"
                  stroke="#cef79e"
                  strokeWidth={2}
                  dot={{ r: 0, fill: '#cef79e' }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="val_acc"
                  name="Validation"
                  stroke="#c9cbbe"
                  strokeWidth={2}
                  dot={{ r: 0, fill: '#c9cbbe' }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-[15px] font-semibold tracking-tight text-ink-primary">
            Loss over Epochs
          </h3>
          <p className="mt-1 text-[12px] text-ink-secondary">Categorical cross-entropy</p>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TRAINING_HISTORY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="epoch" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11, color: '#b1bcb7' }} />
                <Line
                  type="monotone"
                  dataKey="train_loss"
                  name="Train"
                  stroke="#cef79e"
                  strokeWidth={2}
                  dot={{ r: 0, fill: '#cef79e' }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="val_loss"
                  name="Validation"
                  stroke="#c9cbbe"
                  strokeWidth={2}
                  dot={{ r: 0, fill: '#c9cbbe' }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <h3 className="text-[15px] font-semibold tracking-tight text-ink-primary">
          Methodology Notes
        </h3>
        <ul className="mt-3 space-y-2 text-[13px] text-ink-secondary">
          <li>
            <span className="text-ink-primary">Backbone:</span> EfficientNetV2 with Fused-MBConv blocks, image input 224×224, raw RGB values in <code className="text-ink-primary">[0, 255]</code>; preprocessing is built into the model.
          </li>
          <li>
            <span className="text-ink-primary">Head:</span> Global Average Pooling → Dense layers with aggressive dropout → 38-way softmax.
          </li>
          <li>
            <span className="text-ink-primary">Balancing:</span> Stratified downsampling capped at 500 images/class plus geometric &amp; photometric augmentation.
          </li>
          <li>
            <span className="text-ink-primary">Inference guardrail:</span> predictions below <code className="text-ink-primary">60%</code> confidence are surfaced as “Uncertain” and ask the user for a clearer image.
          </li>
        </ul>
      </Card>
    </>
  );
}
