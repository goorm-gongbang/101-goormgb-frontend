import { NextResponse } from 'next/server';
import { createDemoChallenge } from '../../_lib/challenge-store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const matchId = typeof body?.matchId === 'number' ? body.matchId : 0;
  const challenge = createDemoChallenge();

  return NextResponse.json({
    challengeId: `${matchId}-${challenge.challengeId}`,
    remainingAttempts: challenge.remainingAttempts,
    expiresAtMs: challenge.expiresAtMs,
  });
}
