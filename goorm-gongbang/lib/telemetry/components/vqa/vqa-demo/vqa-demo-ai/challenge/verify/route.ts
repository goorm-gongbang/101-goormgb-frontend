import { NextResponse } from 'next/server';
import { getDemoChallenge, updateDemoChallenge } from '../../_lib/challenge-store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const challengeId =
    typeof body?.challengeId === 'string' ? body.challengeId.split('-').slice(1).join('-') : '';
  const caught = body?.caught === true;

  const challenge = getDemoChallenge(challengeId);

  if (!challenge) {
    return NextResponse.json(
      { message: '데모 챌린지를 찾을 수 없습니다.' },
      { status: 404 },
    );
  }

  if (caught) {
    return NextResponse.json({
      success: true,
      remainingAttempts: challenge.remainingAttempts,
    });
  }

  const next = updateDemoChallenge(challengeId, (current) => ({
    ...current,
    remainingAttempts: Math.max(0, current.remainingAttempts - 1),
  }));

  return NextResponse.json({
    success: false,
    remainingAttempts: next?.remainingAttempts ?? 0,
  });
}
