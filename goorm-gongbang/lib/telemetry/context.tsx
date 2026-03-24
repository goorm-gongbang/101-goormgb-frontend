'use client';

/**
 * AI Telemetry Context Provider
 *
 * 티켓팅 페이지 전체에서 telemetry 인스턴스 공유
 *
 * 사용법:
 * ```tsx
 * // layout.tsx 또는 page.tsx
 * import { TelemetryProvider } from '@/lib/telemetry/context';
 *
 * export default function TicketingLayout({ children, params }) {
 *   return (
 *     <TelemetryProvider matchId={params.matchId}>
 *       {children}
 *     </TelemetryProvider>
 *   );
 * }
 *
 * // 하위 컴포넌트에서
 * import { useTelemetryContext } from '@/lib/telemetry/context';
 *
 * function SeatSelection() {
 *   const { setStage } = useTelemetryContext();
 *
 *   useEffect(() => {
 *     setStage('SEAT_SELECTION');
 *   }, []);
 * }
 * ```
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useTelemetry, TelemetryInstance, UseTelemetryOptions } from './index';

const TelemetryContext = createContext<TelemetryInstance | null>(null);

export interface TelemetryProviderProps extends UseTelemetryOptions {
  children: ReactNode;
}

export function TelemetryProvider({
  children,
  ...options
}: TelemetryProviderProps): React.ReactElement {
  const telemetry = useTelemetry(options);

  return (
    <TelemetryContext.Provider value={telemetry}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetryContext(): TelemetryInstance {
  const context = useContext(TelemetryContext);

  if (!context) {
    throw new Error('useTelemetryContext must be used within TelemetryProvider');
  }

  return context;
}
