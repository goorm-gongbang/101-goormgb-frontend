import type { TicketingStage } from "./types";

export interface TelemetryRuntime {
  flushCurrentStageAndSend: () => Promise<number>;
  setStage: (stage: TicketingStage) => void;
  getStage: () => TicketingStage;
}

let activeRuntime: TelemetryRuntime | null = null;

export function registerTelemetryRuntime(runtime: TelemetryRuntime): void {
  activeRuntime = runtime;
}

export function unregisterTelemetryRuntime(runtime: TelemetryRuntime): void {
  if (activeRuntime === runtime) {
    activeRuntime = null;
  }
}

export async function flushTelemetryBeforeProtectedRequest(): Promise<void> {
  if (!activeRuntime) {
    return;
  }

  try {
    await activeRuntime.flushCurrentStageAndSend();
  } catch (error) {
    console.error("[Telemetry] Preflight flush failed:", error);
  }
}

export function setTelemetryStage(stage: TicketingStage): void {
  activeRuntime?.setStage(stage);
}

export function getTelemetryStage(): TicketingStage | null {
  return activeRuntime?.getStage() ?? null;
}
