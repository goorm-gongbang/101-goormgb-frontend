/**
 * Auth-Guard Service Types
 * 인증/인가 관련 타입 정의
 */

/** 로그인 요청 */
export type LoginRequest = {
  loginId: string;
  password: string;
};

/** 로그인 응답 */
export type LoginResponse = {
  accessToken: string;
  agreementRequired?: boolean;
  onboardingRequired?: boolean;
};

/** 토큰 갱신 응답 */
export type RefreshResponse = {
  code: string;
  message: string;
  data: { accessToken: string };
};

/** 카카오 로그인 요청 */
export type KakaoLoginRequest = {
  authorizationCode: string;
};

/** 카카오 로그인 응답 */
export type KakaoLoginResponse = {
  accessToken: string;
  user?: { userId: number; status: "ACTIVE" | "DEACTIVE" | string };
  onboardingRequired?: boolean;
};

/** 사용자 정보 */
export type User = {
  id: string;
  status: string;
  email?: string;
  nickname?: string;
  onboardingRequired?: boolean;
};

/** 내 정보 응답 */
export type MeResponse = {
  code: string;
  message: string;
  data: User | null;
};
