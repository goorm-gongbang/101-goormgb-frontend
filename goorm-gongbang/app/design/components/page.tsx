import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { TertiaryButton } from "@/components/common/TertiaryButton";

function ToneRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <div className="h-px flex-1 bg-[var(--Foundation-Neutral-200, #e5e7eb)]" />
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border p-4">
        {children}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export default function Components() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Buttons Preview</h1>
        <p className="text-sm text-muted-foreground">
          버튼의 tone & size 상태를 한 화면에서 확인합니다.
        </p>
      </div>

      {/* Primary */}
      <Section title="Primary Button">
        <ToneRow title="Strong">
          <PrimaryButton uiSize="lg" tone="strong">LG</PrimaryButton>
          <PrimaryButton uiSize="md" tone="strong">MD</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="strong">SM</PrimaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButton uiSize="lg" tone="strong" disabled>LG Disabled</PrimaryButton>
          <PrimaryButton uiSize="md" tone="strong" disabled>MD Disabled</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="strong" disabled>SM Disabled</PrimaryButton>
        </ToneRow>

        <ToneRow title="Base">
          <PrimaryButton uiSize="lg" tone="base">LG</PrimaryButton>
          <PrimaryButton uiSize="md" tone="base">MD</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="base">SM</PrimaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButton uiSize="lg" tone="base" disabled>LG Disabled</PrimaryButton>
          <PrimaryButton uiSize="md" tone="base" disabled>MD Disabled</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="base" disabled>SM Disabled</PrimaryButton>
        </ToneRow>

        <ToneRow title="Soft">
          <PrimaryButton uiSize="lg" tone="soft">LG</PrimaryButton>
          <PrimaryButton uiSize="md" tone="soft">MD</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="soft">SM</PrimaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButton uiSize="lg" tone="soft" disabled>LG Disabled</PrimaryButton>
          <PrimaryButton uiSize="md" tone="soft" disabled>MD Disabled</PrimaryButton>
          <PrimaryButton uiSize="sm" tone="soft" disabled>SM Disabled</PrimaryButton>
        </ToneRow>
      </Section>

      {/* Secondary */}
      <Section title="Secondary Button">
        <ToneRow title="Strong">
          <SecondaryButton uiSize="lg" tone="strong">LG</SecondaryButton>
          <SecondaryButton uiSize="md" tone="strong">MD</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="strong">SM</SecondaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButton uiSize="lg" tone="strong" disabled>LG Disabled</SecondaryButton>
          <SecondaryButton uiSize="md" tone="strong" disabled>MD Disabled</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="strong" disabled>SM Disabled</SecondaryButton>
        </ToneRow>

        <ToneRow title="Base">
          <SecondaryButton uiSize="lg" tone="base">LG</SecondaryButton>
          <SecondaryButton uiSize="md" tone="base">MD</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="base">SM</SecondaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButton uiSize="lg" tone="base" disabled>LG Disabled</SecondaryButton>
          <SecondaryButton uiSize="md" tone="base" disabled>MD Disabled</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="base" disabled>SM Disabled</SecondaryButton>
        </ToneRow>

        <ToneRow title="Soft">
          <SecondaryButton uiSize="lg" tone="soft">LG</SecondaryButton>
          <SecondaryButton uiSize="md" tone="soft">MD</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="soft">SM</SecondaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButton uiSize="lg" tone="soft" disabled>LG Disabled</SecondaryButton>
          <SecondaryButton uiSize="md" tone="soft" disabled>MD Disabled</SecondaryButton>
          <SecondaryButton uiSize="sm" tone="soft" disabled>SM Disabled</SecondaryButton>
        </ToneRow>
      </Section>

      {/* Tertiary */}
      <Section title="Tertiary Button">
        <ToneRow title="Strong">
          <TertiaryButton uiSize="lg" tone="strong">LG</TertiaryButton>
          <TertiaryButton uiSize="md" tone="strong">MD</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="strong">SM</TertiaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButton uiSize="lg" tone="strong" disabled>LG Disabled</TertiaryButton>
          <TertiaryButton uiSize="md" tone="strong" disabled>MD Disabled</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="strong" disabled>SM Disabled</TertiaryButton>
        </ToneRow>

        <ToneRow title="Base">
          <TertiaryButton uiSize="lg" tone="base">LG</TertiaryButton>
          <TertiaryButton uiSize="md" tone="base">MD</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="base">SM</TertiaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButton uiSize="lg" tone="base" disabled>LG Disabled</TertiaryButton>
          <TertiaryButton uiSize="md" tone="base" disabled>MD Disabled</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="base" disabled>SM Disabled</TertiaryButton>
        </ToneRow>

        <ToneRow title="Soft">
          <TertiaryButton uiSize="lg" tone="soft">LG</TertiaryButton>
          <TertiaryButton uiSize="md" tone="soft">MD</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="soft">SM</TertiaryButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButton uiSize="lg" tone="soft" disabled>LG Disabled</TertiaryButton>
          <TertiaryButton uiSize="md" tone="soft" disabled>MD Disabled</TertiaryButton>
          <TertiaryButton uiSize="sm" tone="soft" disabled>SM Disabled</TertiaryButton>
        </ToneRow>
      </Section>
    </div>
  );
}
