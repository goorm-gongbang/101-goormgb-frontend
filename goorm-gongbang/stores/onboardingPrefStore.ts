import { create } from "zustand";
import type {
  Viewpoint,
  SeatHeight,
  Section,
  SeatPositionPref,
  EnvironmentPref,
  MoodPref,
  ObstructionSensitivity,
  PriceMode,
} from "@/lib/types";

export type {
  Viewpoint,
  SeatHeight,
  Section,
  SeatPositionPref,
  EnvironmentPref,
  MoodPref,
  ObstructionSensitivity,
  PriceMode,
};

export type CheerProximityPref = "NEAR" | "FAR" | "ANY";

export type OnboardingOptionDraft = {
  seatHeight: SeatHeight;
  section: Section;
  seatPositionPref: SeatPositionPref;
  environmentPref: EnvironmentPref;
  moodPref: MoodPref;
  obstructionSensitivity: ObstructionSensitivity;
  priceMode: PriceMode;
  priceMin: number | null;
  priceMax: number | null;
};

type OnboardingPrefState = {
  marketingAgreed: boolean;
  favoriteClubId: number | null;
  cheerProximityPref: CheerProximityPref | null;
  preferredBlockIds: number[];
  viewpoints: Viewpoint[];
  optionDraft: OnboardingOptionDraft;
  setMarketingAgreed: (value: boolean) => void;
  setPreferredBlockIds: (value: number[]) => void;
  setFavoriteClubId: (value: number) => void;
  setCheerProximityPref: (value: CheerProximityPref) => void;
  setViewpoints: (value: Viewpoint[]) => void;
  setOptionDraft: (value: Partial<OnboardingOptionDraft>) => void;
  reset: () => void;
};

const initialOptionDraft: OnboardingOptionDraft = {
  seatHeight: "ANY",
  section: "ANY",
  seatPositionPref: "ANY",
  environmentPref: "ANY",
  moodPref: "ANY",
  obstructionSensitivity: "ANY",
  priceMode: "ANY",
  priceMin: null,
  priceMax: null,
};

export const useOnboardingPrefStore = create<OnboardingPrefState>((set) => ({
  marketingAgreed: false,
  favoriteClubId: null,
  cheerProximityPref: null,
  preferredBlockIds: [],
  viewpoints: [],
  optionDraft: initialOptionDraft,
  setMarketingAgreed: (value) => set({ marketingAgreed: value }), // 마케팅 수신 동의 여부
  setPreferredBlockIds: (value) => set({ preferredBlockIds: value }), // 선호 블럭 ID 리스트
  setFavoriteClubId: (value) => set({ favoriteClubId: value }), // 응원하는 구단 ID
  setCheerProximityPref: (value) => set({ cheerProximityPref: value }), // 응원석 근처 선호도
  setViewpoints: (value) => set({ viewpoints: value }), // 뷰포인트 우선순위 설정
  setOptionDraft: (value) =>
    set((state) => ({
      optionDraft: { ...state.optionDraft, ...value },
    })),
  reset: () =>
    set({
      marketingAgreed: false,
      favoriteClubId: null,
      cheerProximityPref: null,
      preferredBlockIds: [],
      viewpoints: [],
      optionDraft: initialOptionDraft,
    }),
}));
