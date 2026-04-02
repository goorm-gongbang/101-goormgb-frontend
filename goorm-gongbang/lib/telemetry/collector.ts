/**
 * AI Telemetry SDK - Event Collector
 *
 * raw pointer 이벤트를 로컬 버퍼에 적재하고, 필요 시 flush()로 전송한다.
 */

import type {
  TelemetryEvent,
  TelemetryEventType,
  TicketingStage,
  TelemetryConfig,
} from './types';
import { resolveAiBaseUrl } from './baseUrl';

const DEFAULT_MOUSE_SAMPLE_INTERVAL = 50;
const DEFAULT_MAX_BUFFER_SIZE = 1000;

export class TelemetryCollector {
  private buffer: TelemetryEvent[] = [];
  private config: Required<TelemetryConfig>;
  private currentStage: TicketingStage = 'QUEUE_ENTER_PRECLICK';
  private lastMouseSampleTime = 0;
  private listeners: Array<{ target: EventTarget; type: string; handler: EventListener }> = [];
  private isCollecting = false;

  constructor(config: TelemetryConfig) {
    this.config = {
      matchId: config.matchId,
      mouseSampleInterval: config.mouseSampleInterval ?? DEFAULT_MOUSE_SAMPLE_INTERVAL,
      maxBufferSize: config.maxBufferSize ?? DEFAULT_MAX_BUFFER_SIZE,
      aiBaseUrl: config.aiBaseUrl ?? resolveAiBaseUrl(),
      debug: config.debug ?? false,
    };
  }

  start(): void {
    if (this.isCollecting) {
      this.log('Already collecting');
      return;
    }

    this.isCollecting = true;
    this.attachListeners();
    this.log('Collection started');
  }

  stop(): void {
    if (!this.isCollecting) return;

    this.isCollecting = false;
    this.detachListeners();
    this.log('Collection stopped');
  }

  setStage(stage: TicketingStage): void {
    const previousStage = this.currentStage;
    this.currentStage = stage;
    this.log(`Stage changed: ${previousStage} -> ${stage}`);
  }

  getStage(): TicketingStage {
    return this.currentStage;
  }

  flush(): TelemetryEvent[] {
    const events = [...this.buffer];
    this.buffer = [];
    this.log(`Flushed ${events.length} events`);
    return events;
  }

  getBufferSize(): number {
    return this.buffer.length;
  }

  getConfig(): Required<TelemetryConfig> {
    return { ...this.config };
  }

  private attachListeners(): void {
    if (typeof window === 'undefined') return;

    this.addListener(document, 'mousemove', this.handleMouseMove.bind(this));
    this.addListener(document, 'mousedown', this.handleMouseDown.bind(this));
    this.addListener(document, 'mouseup', this.handleMouseUp.bind(this));
    this.addListener(document, 'click', this.handleClick.bind(this));
  }

  private detachListeners(): void {
    for (const { target, type, handler } of this.listeners) {
      target.removeEventListener(type, handler);
    }
    this.listeners = [];
  }

  private addListener(
    target: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    target.addEventListener(type, handler, options);
    this.listeners.push({ target, type, handler });
  }

  private handleMouseMove(e: Event): void {
    const event = e as MouseEvent;
    const now = Date.now();

    if (now - this.lastMouseSampleTime < this.config.mouseSampleInterval) {
      return;
    }

    this.addToBuffer(this.buildPointerEvent('mousemove', event));
    this.lastMouseSampleTime = now;
  }

  private handleMouseDown(e: Event): void {
    this.addToBuffer(this.buildPointerEvent('mousedown', e as MouseEvent, true));
  }

  private handleMouseUp(e: Event): void {
    this.addToBuffer(this.buildPointerEvent('mouseup', e as MouseEvent, true));
  }

  private handleClick(e: Event): void {
    this.addToBuffer(this.buildPointerEvent('click', e as MouseEvent, true));
  }

  private buildPointerEvent(
    type: TelemetryEventType,
    event: MouseEvent,
    includeButton = false
  ): TelemetryEvent {
    const { xNorm, yNorm } = this.normalizeCoordinates(event.clientX, event.clientY);

    return {
      type,
      tsMs: Date.now(),
      xNorm,
      yNorm,
      ...(includeButton ? { button: event.button } : {}),
    };
  }

  private normalizeCoordinates(x: number, y: number): { xNorm: number; yNorm: number } {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;

    return {
      xNorm: this.clamp(x / viewportWidth),
      yNorm: this.clamp(y / viewportHeight),
    };
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(1, Number(value.toFixed(6))));
  }

  private addToBuffer(event: TelemetryEvent): void {
    if (this.buffer.length >= this.config.maxBufferSize) {
      this.buffer.shift();
    }

    this.buffer.push(event);
  }

  private log(message: string): void {
    if (this.config.debug) {
    }
  }
}
