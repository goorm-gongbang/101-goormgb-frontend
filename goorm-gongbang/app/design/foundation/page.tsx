'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Swatch = {
  label: string;     // 예: Primary 900
  cssVar: string;    // 예: --foundation-primary-900
  text: 'light' | 'dark';
};

function SwatchGrid({ items }: { items: Swatch[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((it) => (
        <div
          key={it.cssVar}
          className="flex items-center justify-between rounded-lg border px-3 py-2"
          style={{ borderColor: 'var(--foundation-neutral-840)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-md border"
              style={{
                backgroundColor: `var(${it.cssVar})`,
                borderColor: 'var(--foundation-neutral-800)',
              }}
              aria-label={it.label}
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold">{it.label}</div>
              <div className="text-xs opacity-70">var({it.cssVar})</div>
            </div>
          </div>

          <div
            className="rounded-md px-2 py-1 text-xs font-medium"
            style={{
              backgroundColor: `var(${it.cssVar})`,
              color: it.text === 'light' ? '#0a0a0a' : '#ffffff',
              border: '1px solid',
              borderColor: 'rgba(0,0,0,0.08)',
              minWidth: 76,
              textAlign: 'center',
            }}
          >
            Preview
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, items }: { title: string; items: Swatch[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <SwatchGrid items={items} />
      </CardContent>
    </Card>
  );
}

export default function FoundationColorsPage() {
  // ✅ Primary (어두운 쪽 글씨 흰색, 밝은 쪽 글씨 검정)
  const primary: Swatch[] = [
    { label: 'Primary 900', cssVar: '--foundation-primary-900', text: 'dark' },
    { label: 'Primary 800', cssVar: '--foundation-primary-800', text: 'dark' },
    { label: 'Primary 700', cssVar: '--foundation-primary-700', text: 'dark' },
    { label: 'Primary 600', cssVar: '--foundation-primary-600', text: 'dark' },
    { label: 'Primary 500', cssVar: '--foundation-primary-500', text: 'light' },
    { label: 'Primary 400', cssVar: '--foundation-primary-400', text: 'light' },
    { label: 'Primary 300', cssVar: '--foundation-primary-300', text: 'light' },
    { label: 'Primary 200', cssVar: '--foundation-primary-200', text: 'light' },
    { label: 'Primary 100', cssVar: '--foundation-primary-100', text: 'light' },
    { label: 'Primary 50', cssVar: '--foundation-primary-50', text: 'light' },
    { label: 'Primary 10', cssVar: '--foundation-primary-10', text: 'light' },
  ];

  // ✅ Secondary
  const secondary: Swatch[] = [
    { label: 'Secondary 900', cssVar: '--foundation-secondary-900', text: 'dark' },
    { label: 'Secondary 800', cssVar: '--foundation-secondary-800', text: 'dark' },
    { label: 'Secondary 700', cssVar: '--foundation-secondary-700', text: 'dark' },
    { label: 'Secondary 600', cssVar: '--foundation-secondary-600', text: 'dark' },
    { label: 'Secondary 500', cssVar: '--foundation-secondary-500', text: 'light' },
    { label: 'Secondary 400', cssVar: '--foundation-secondary-400', text: 'light' },
    { label: 'Secondary 300', cssVar: '--foundation-secondary-300', text: 'light' },
    { label: 'Secondary 200', cssVar: '--foundation-secondary-200', text: 'light' },
    { label: 'Secondary 100', cssVar: '--foundation-secondary-100', text: 'light' },
    { label: 'Secondary 50', cssVar: '--foundation-secondary-50', text: 'light' },
    { label: 'Secondary 10', cssVar: '--foundation-secondary-10', text: 'light' },
  ];

  // ✅ Neutral
  const neutral: Swatch[] = [
    { label: 'Neutral Black', cssVar: '--foundation-neutral-black', text: 'dark' },
    { label: 'Neutral 20', cssVar: '--foundation-neutral-20', text: 'dark' },
    { label: 'Neutral 40', cssVar: '--foundation-neutral-40', text: 'dark' },
    { label: 'Neutral 60', cssVar: '--foundation-neutral-60', text: 'dark' },
    { label: 'Neutral 80', cssVar: '--foundation-neutral-80', text: 'dark' },
    { label: 'Neutral 100', cssVar: '--foundation-neutral-100', text: 'dark' },
    { label: 'Neutral 120', cssVar: '--foundation-neutral-120', text: 'dark' },
    { label: 'Neutral 160', cssVar: '--foundation-neutral-160', text: 'dark' },
    { label: 'Neutral 200', cssVar: '--foundation-neutral-200', text: 'dark' },
    { label: 'Neutral 240', cssVar: '--foundation-neutral-240', text: 'dark' },
    { label: 'Neutral 280', cssVar: '--foundation-neutral-280', text: 'dark' },
    { label: 'Neutral 320', cssVar: '--foundation-neutral-320', text: 'dark' },
    { label: 'Neutral 360', cssVar: '--foundation-neutral-360', text: 'dark' },
    { label: 'Neutral 400', cssVar: '--foundation-neutral-400', text: 'dark' },
    { label: 'Neutral 440', cssVar: '--foundation-neutral-440', text: 'dark' },
    { label: 'Neutral 480', cssVar: '--foundation-neutral-480', text: 'dark' },
    { label: 'Neutral 520', cssVar: '--foundation-neutral-520', text: 'light' },
    { label: 'Neutral 560', cssVar: '--foundation-neutral-560', text: 'light' },
    { label: 'Neutral 600', cssVar: '--foundation-neutral-600', text: 'light' },
    { label: 'Neutral 640', cssVar: '--foundation-neutral-640', text: 'light' },
    { label: 'Neutral 680', cssVar: '--foundation-neutral-680', text: 'light' },
    { label: 'Neutral 720', cssVar: '--foundation-neutral-720', text: 'light' },
    { label: 'Neutral 760', cssVar: '--foundation-neutral-760', text: 'light' },
    { label: 'Neutral 800', cssVar: '--foundation-neutral-800', text: 'light' },
    { label: 'Neutral 840', cssVar: '--foundation-neutral-840', text: 'light' },
    { label: 'Neutral 880', cssVar: '--foundation-neutral-880', text: 'light' },
    { label: 'Neutral 900', cssVar: '--foundation-neutral-900', text: 'light' },
    { label: 'Neutral 920', cssVar: '--foundation-neutral-920', text: 'light' },
    { label: 'Neutral 940', cssVar: '--foundation-neutral-940', text: 'light' },
    { label: 'Neutral 960', cssVar: '--foundation-neutral-960', text: 'light' },
    { label: 'Neutral 980', cssVar: '--foundation-neutral-980', text: 'light' },
    { label: 'Neutral White', cssVar: '--foundation-neutral-white', text: 'light' },
  ];

  const makeScale = (name: string, steps: number[], darkTextUntil?: number): Swatch[] => {
    return steps.map((n) => ({
      label: `${name} ${n}`,
      cssVar: `--foundation-${name.toLowerCase()}-${n}`,
      // 대략적으로 900~600은 글씨 흰색, 그 아래는 검정 (필요하면 조정 가능)
      text: darkTextUntil && n >= darkTextUntil ? 'dark' : n >= 600 ? 'dark' : 'light',
    }));
  };

  const red = makeScale('Red', [900, 800, 700, 600, 500, 400, 300, 200, 100, 50], 700);
  const orange = makeScale('Orange', [900, 800, 700, 600, 500, 400, 300, 200, 100, 50], 700);
  const yellow = makeScale('Yellow', [900, 800, 700, 600, 500, 400, 300, 200, 100, 50], 700);
  const green  = makeScale('Green',  [900, 800, 700, 600, 500, 400, 300, 200, 100, 50], 700);
  const blue   = makeScale('Blue',   [900, 800, 700, 600, 500, 400, 300, 200, 100, 50], 700);
  const indigo = makeScale('Indigo', [900, 800, 700, 600, 500, 400, 300, 200, 100, 50], 700);
  const purple = makeScale('Purple', [900, 800, 700, 600, 500, 400, 300, 200, 100, 50], 700);
  const pink   = makeScale('Pink',   [900, 800, 700, 600, 500, 400, 300, 200, 100, 50], 700);
  const brown  = makeScale('Brown',  [900, 800, 700, 600, 500, 400, 300, 200, 100, 50], 700);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Foundation Colors</h1>
        </div>

        <div className="grid gap-6">
          <Section title="Foundation / Primary" items={primary} />
          <Section title="Foundation / Neutral" items={neutral} />
          <Section title="Foundation / Secondary" items={secondary} />
          <Section title="Foundation / Red" items={red} />
          <Section title="Foundation / Orange" items={orange} />
          <Section title="Foundation / Yellow" items={yellow} />
          <Section title="Foundation / Green" items={green} />
          <Section title="Foundation / Blue" items={blue} />
          <Section title="Foundation / Indigo" items={indigo} />
          <Section title="Foundation / Purple" items={purple} />
          <Section title="Foundation / Pink" items={pink} />
          <Section title="Foundation / Brown" items={brown} />
        </div>
      </div>
    </main>
  );
}
