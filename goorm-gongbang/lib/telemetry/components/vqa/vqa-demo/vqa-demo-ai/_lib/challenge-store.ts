type DemoChallengeState = {
  remainingAttempts: number;
  expiresAtMs: number;
};

const MAX_ATTEMPTS = 3;
const CHALLENGE_TTL_MS = 5 * 60 * 1000;

const challengeStore = new Map<string, DemoChallengeState>();

export function createDemoChallenge() {
  const challengeId = `demo-${Math.random().toString(36).slice(2, 10)}`;
  const challenge = {
    remainingAttempts: MAX_ATTEMPTS,
    expiresAtMs: Date.now() + CHALLENGE_TTL_MS,
  };

  challengeStore.set(challengeId, challenge);

  return {
    challengeId,
    ...challenge,
  };
}

export function getDemoChallenge(challengeId: string) {
  return challengeStore.get(challengeId) ?? null;
}

export function updateDemoChallenge(
  challengeId: string,
  updater: (challenge: DemoChallengeState) => DemoChallengeState,
) {
  const current = challengeStore.get(challengeId);

  if (!current) {
    return null;
  }

  const next = updater(current);
  challengeStore.set(challengeId, next);
  return next;
}
