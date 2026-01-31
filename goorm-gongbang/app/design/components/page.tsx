import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { TertiaryButton } from "@/components/common/TertiaryButton";
import { PrimaryButtonWithIcon, SecondaryButtonWithIcon, TertiaryButtonWithIcon } from "@/components/common/ButtonWithIcon";
import { Plus } from "lucide-react";
import { DestructiveButton } from "@/components/common/ButtonDestructive";
import { KakaoButton } from "@/components/login/KakaoButton";
import { GoogleButton } from "@/components/login/GoogleButton";
import { ButtonSpinner } from "@/components/common/ButtonLoading";
import { Toggle } from "@/components/common/Toggle";
import { ChipButton } from "@/components/common/ChipButton";
import { UiCheckbox } from "@/components/common/UiCheckbox";

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
        <div className="h-px flex-1 bg-[var(--foundation-neutral-200, #e5e7eb)]" />
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

      {/* Button with icon */}
      <Section title="Button with icon">
        {/* Primary */}
        <ToneRow title="Primary / Strong">
          <PrimaryButtonWithIcon
            tone="strong"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong
          </PrimaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButtonWithIcon
            tone="strong"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong Disabled
          </PrimaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Primary / Base">
          <PrimaryButtonWithIcon
            tone="base"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base
          </PrimaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButtonWithIcon
            tone="base"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base Disabled
          </PrimaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Primary / Soft">
          <PrimaryButtonWithIcon
            tone="soft"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft
          </PrimaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <PrimaryButtonWithIcon
            tone="soft"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft Disabled
          </PrimaryButtonWithIcon>
        </ToneRow>

        {/* Secondary */}
        <ToneRow title="Secondary / Strong">
          <SecondaryButtonWithIcon
            tone="strong"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong
          </SecondaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButtonWithIcon
            tone="strong"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong Disabled
          </SecondaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Secondary / Base">
          <SecondaryButtonWithIcon
            tone="base"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base
          </SecondaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButtonWithIcon
            tone="base"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base Disabled
          </SecondaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Secondary / Soft">
          <SecondaryButtonWithIcon
            tone="soft"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft
          </SecondaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <SecondaryButtonWithIcon
            tone="soft"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft Disabled
          </SecondaryButtonWithIcon>
        </ToneRow>

        {/* Tertiary */}
        <ToneRow title="Tertiary / Strong">
          <TertiaryButtonWithIcon
            tone="strong"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong
          </TertiaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButtonWithIcon
            tone="strong"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Strong Disabled
          </TertiaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Tertiary / Base">
          <TertiaryButtonWithIcon
            tone="base"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base
          </TertiaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButtonWithIcon
            tone="base"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Base Disabled
          </TertiaryButtonWithIcon>
        </ToneRow>

        <ToneRow title="Tertiary / Soft">
          <TertiaryButtonWithIcon
            tone="soft"
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft
          </TertiaryButtonWithIcon>

          <div className="mx-2 h-8 w-px bg-border" />

          <TertiaryButtonWithIcon
            tone="soft"
            disabled
            leftIcon={<Plus className="h-full w-full" />}
          >
            Soft Disabled
          </TertiaryButtonWithIcon>
        </ToneRow>
      </Section>

      {/* Button Destructive */}
      <Section title="Button Destructive">
        <ToneRow title="Base">
          <DestructiveButton tone="base">취소하기</DestructiveButton>
        </ToneRow>

        <ToneRow title="Strong">
          <DestructiveButton tone="strong">취소하기</DestructiveButton>
        </ToneRow>

        <ToneRow title="Soft">
          <DestructiveButton tone="soft">취소하기</DestructiveButton>
        </ToneRow>

        <ToneRow title="Lighter">
          <DestructiveButton tone="lighter">취소하기</DestructiveButton>
        </ToneRow>
      </Section>

      {/* Login Button */}
      <Section title="Login Button">
        <ToneRow title="kakao">
          <KakaoButton bgVariant="kakao" contentPadding="20" />
          <KakaoButton bgVariant="kakao" contentPadding="6" />
          <KakaoButton bgVariant="yellow" contentPadding="20" />
          <KakaoButton bgVariant="yellow" contentPadding="6" />
        </ToneRow>
        <ToneRow title="google">
          <GoogleButton fixedWidth="w-80" theme="light" />
          <GoogleButton fixedWidth="w-52" theme="light" />
          <GoogleButton fixedWidth="w-80" theme="dark" />
          <GoogleButton fixedWidth="w-52" theme="dark" />
        </ToneRow>
      </Section>

      {/* Button Loading */}
      <Section title="Button Loading">
        <ToneRow title="Button Loading">
          <ButtonSpinner />
        </ToneRow>
      </Section>

      {/* Toggle */}
      <Section title="Toggle">
        <ToneRow title="Toggle">
          <Toggle />
        </ToneRow>
      </Section>

      {/* Chip Button */}
      <Section title="Chip Button">
        <ToneRow title="Strong">
          <ChipButton uiSize="lg" tone="strong">LG</ChipButton>
          <ChipButton uiSize="md" tone="strong">MD</ChipButton>
          <ChipButton uiSize="sm" tone="strong">SM</ChipButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <ChipButton uiSize="lg" tone="strong" disabled>LG Disabled</ChipButton>
          <ChipButton uiSize="md" tone="strong" disabled>MD Disabled</ChipButton>
          <ChipButton uiSize="sm" tone="strong" disabled>SM Disabled</ChipButton>
        </ToneRow>

        <ToneRow title="Base">
          <ChipButton uiSize="lg" tone="base">LG</ChipButton>
          <ChipButton uiSize="md" tone="base">MD</ChipButton>
          <ChipButton uiSize="sm" tone="base">SM</ChipButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <ChipButton uiSize="lg" tone="base" disabled>LG Disabled</ChipButton>
          <ChipButton uiSize="md" tone="base" disabled>MD Disabled</ChipButton>
          <ChipButton uiSize="sm" tone="base" disabled>SM Disabled</ChipButton>
        </ToneRow>

        <ToneRow title="Soft">
          <ChipButton uiSize="lg" tone="soft">LG</ChipButton>
          <ChipButton uiSize="md" tone="soft">MD</ChipButton>
          <ChipButton uiSize="sm" tone="soft">SM</ChipButton>

          <div className="mx-2 h-8 w-px bg-border" />

          <ChipButton uiSize="lg" tone="soft" disabled>LG Disabled</ChipButton>
          <ChipButton uiSize="md" tone="soft" disabled>MD Disabled</ChipButton>
          <ChipButton uiSize="sm" tone="soft" disabled>SM Disabled</ChipButton>
        </ToneRow>
        <ToneRow title="chipButton">
          <ChipButton tone="strong" uiSize="lg" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="strong" uiSize="md" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="strong" uiSize="sm" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="strong" uiSize="lg" disabled leftIcon={<Plus size={16} />}>추가</ChipButton>

          <ChipButton tone="base" uiSize="lg" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="base" uiSize="md" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="base" uiSize="sm" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="base" uiSize="lg" disabled leftIcon={<Plus size={16} />}>추가</ChipButton>

          <ChipButton tone="soft" uiSize="lg" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="soft" uiSize="md" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="soft" uiSize="sm" leftIcon={<Plus size={16} />}>추가</ChipButton>
          <ChipButton tone="soft" uiSize="lg" disabled leftIcon={<Plus size={16} />}>추가</ChipButton>
        </ToneRow>
      </Section>

      {/* Checkbox */}
      <Section title="Checkbox">
        <ToneRow title="Checkbox">
          <UiCheckbox />
        </ToneRow>
      </Section>
    </div>
  );
}
