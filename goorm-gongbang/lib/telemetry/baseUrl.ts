const AI_PATH_SUFFIX = '/ai';

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return AI_PATH_SUFFIX;
  return trimmed.endsWith(AI_PATH_SUFFIX) ? trimmed : `${trimmed}${AI_PATH_SUFFIX}`;
}

export function resolveAiBaseUrl(): string {
  const publicBase =
    process.env.NEXT_PUBLIC_API_BASE?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || '';

  return publicBase ? normalizeBaseUrl(publicBase) : AI_PATH_SUFFIX;
}
