import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Viewpoint = "CENTER" | "INFIELD_1B" | "INFIELD_3B" | "OUTFIELD_L" | "OUTFIELD_C" | "OUTFIELD_R";
export type SeatHeight = "LOW" | "MID" | "HIGH" | "ANY";
export type Section = "CENTER_SIDE" | "MIDDLE" | "CORNER" | "ANY";
export type SeatPositionPref = "AISLE" | "MIDDLE" | "ANY";
export type EnvironmentPref = "SHADE" | "SUN_OK" | "ANY";
export type MoodPref = "CHEERFUL" | "QUIET" | "ANY";
export type ObstructionSensitivity = "NET_SENSITIVE" | "RAIL_PILLAR_SENSITIVE" | "NORMAL" | "ANY";
export type PriceMode = "ANY" | "RANGE";

export type Preference = {
    priority: 1 | 2 | 3;
    viewpoint: Viewpoint;
    seatHeight: SeatHeight;
    section: Section;

    seatPositionPref: SeatPositionPref;
    environmentPref: EnvironmentPref;
    moodPref: MoodPref;
    obstructionSensitivity: ObstructionSensitivity;

    priceMode: PriceMode;
    priceMin?: number | null;
    priceMax?: number | null;
};

/* 1단계에서 받는 값 */
export type PreferenceBase = Pick<Preference, "priority" | "viewpoint" | "seatHeight" | "section">;

type OnboardingPrefState = {
    preferences: Preference[];
    marketingAgreed: boolean;

    setBasePreferences: (prefs: PreferenceBase[]) => void;
    setMarketingAgreed: (v: boolean) => void;
    updatePreference: (priority: 1 | 2 | 3, patch: Partial<Preference>) => void;
    reset: () => void;
};

export const useOnboardingPrefStore = create<OnboardingPrefState>()(
    persist(
        (set, get) => ({
            preferences: [],
            marketingAgreed: false,

            setBasePreferences: (basePrefs) => {
                // priority 정렬 + 중복 제거/검증
                const sorted = [...basePrefs].sort((a, b) => a.priority - b.priority);

                // priority 1~3 모두 있는지 간단 체크(없으면 그냥 저장 안 함)
                const prioritys = new Set(sorted.map((p) => p.priority));
                if (!(prioritys.has(1) && prioritys.has(2) && prioritys.has(3))) {
                    console.warn("[onboardingPrefStore] invalid basePrefs:", basePrefs);
                    return;
                }

                const merged: Preference[] = sorted.map((b) => ({
                    ...b,
                    seatPositionPref: "ANY",
                    environmentPref: "ANY",
                    moodPref: "ANY",
                    obstructionSensitivity: "ANY",
                    priceMode: "ANY",
                    // priceMin/priceMax는 priceMode=RANGE일 때만 채워질 예정
                }));
                set({ preferences: merged });

                console.log("[onboardingPrefStore] after setBasePreferences:", get().preferences);
            },

            setMarketingAgreed: (v) => {
                set({ marketingAgreed: v });

                console.log("[onboardingPrefStore] after setMarketingAgreed:", get().marketingAgreed);
            },

            updatePreference: (priority, patch) => {
                const prev = get().preferences;
                const next = prev.map((p) => (p.priority === priority ? { ...p, ...patch } : p));
                set({ preferences: next });

                console.log("[onboardingPrefStore] after updatePreference:", get().preferences);
            },

            reset: () => {
                set({ preferences: [], marketingAgreed: false });

                console.log("[onboardingPrefStore] after reset:", {
                    preferences: get().preferences,
                    marketingAgreed: get().marketingAgreed,
                });
            }
        }),
        {
            name: "onboarding-preferences",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
