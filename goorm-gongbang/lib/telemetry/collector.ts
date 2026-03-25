/**
 * AI Telemetry SDK - Event Collector
 *
 * 사용자 행동 이벤트 수집 및 로컬 버퍼링
 * 필요 시 flush() 호출하여 batch 전송
 */

import type {
  TelemetryEvent,
  MouseMoveEvent,
  ClickEvent,
  ScrollEvent,
  KeystrokeEvent,
  FocusEvent,
  VisibilityEvent,
  TicketingStage,
  TelemetryConfig,
} from './types';

const DEFAULT_MOUSE_SAMPLE_INTERVAL = 50; // 50ms
const DEFAULT_MAX_BUFFER_SIZE = 1000;

export class TelemetryCollector {
  private buffer: TelemetryEvent[] = [];
  private config: Required<TelemetryConfig>;
  private currentStage: TicketingStage = 'LANDING';

  // 마우스 이벤트 샘플링
  private lastMouseEvent: { x: number; y: number; time: number } | null = null;
  private lastMouseSampleTime = 0;

  // 키 입력 dwell time 추적
  private keyDownTimes: Map<number, number> = new Map();

  // 이벤트 리스너 참조 (cleanup용)
  private listeners: Array<{ target: EventTarget; type: string; handler: EventListener }> = [];

  // 상태
  private isCollecting = false;

  constructor(config: TelemetryConfig) {
    this.config = {
      sid: config.sid,
      matchId: config.matchId,
      mouseSampleInterval: config.mouseSampleInterval ?? DEFAULT_MOUSE_SAMPLE_INTERVAL,
      maxBufferSize: config.maxBufferSize ?? DEFAULT_MAX_BUFFER_SIZE,
      aiBaseUrl: config.aiBaseUrl ?? '/ai',
      debug: config.debug ?? false,
    };
  }

  /**
   * 수집 시작
   */
  start(): void {
    if (this.isCollecting) {
      this.log('Already collecting');
      return;
    }

    this.isCollecting = true;
    this.attachListeners();
    this.log('Collection started');
  }

  /**
   * 수집 중지 (리스너 제거)
   */
  stop(): void {
    if (!this.isCollecting) return;

    this.isCollecting = false;
    this.detachListeners();
    this.log('Collection stopped');
  }

  /**
   * Stage 변경
   */
  setStage(stage: TicketingStage): void {
    const previousStage = this.currentStage;
    this.currentStage = stage;
    this.log(`Stage changed: ${previousStage} -> ${stage}`);
  }

  /**
   * 현재 Stage 반환
   */
  getStage(): TicketingStage {
    return this.currentStage;
  }

  /**
   * 버퍼 flush (이벤트 반환 후 버퍼 초기화)
   */
  flush(): TelemetryEvent[] {
    const events = [...this.buffer];
    this.buffer = [];
    this.log(`Flushed ${events.length} events`);
    return events;
  }

  /**
   * 현재 버퍼 크기
   */
  getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * 설정 반환
   */
  getConfig(): Required<TelemetryConfig> {
    return { ...this.config };
  }

  // =========================================================================
  // Private: 이벤트 리스너 관리
  // =========================================================================

  private attachListeners(): void {
    if (typeof window === 'undefined') return;

    // Mouse move (샘플링)
    this.addListener(document, 'mousemove', this.handleMouseMove.bind(this));

    // Click
    this.addListener(document, 'click', this.handleClick.bind(this));
    this.addListener(document, 'contextmenu', this.handleClick.bind(this));

    // Scroll
    this.addListener(window, 'scroll', this.handleScroll.bind(this), { passive: true });

    // Keyboard
    this.addListener(document, 'keydown', this.handleKeyDown.bind(this));
    this.addListener(document, 'keyup', this.handleKeyUp.bind(this));

    // Focus/Blur
    this.addListener(window, 'focus', this.handleFocus.bind(this));
    this.addListener(window, 'blur', this.handleBlur.bind(this));

    // Visibility
    this.addListener(document, 'visibilitychange', this.handleVisibility.bind(this));
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

  // =========================================================================
  // Private: 이벤트 핸들러
  // =========================================================================

  private handleMouseMove(e: Event): void {
    const event = e as MouseEvent;
    const now = Date.now();

    // 샘플링 간격 체크
    if (now - this.lastMouseSampleTime < this.config.mouseSampleInterval) {
      return;
    }

    // 속도 계산
    let velocityX = 0;
    let velocityY = 0;
    if (this.lastMouseEvent) {
      const dt = (now - this.lastMouseEvent.time) / 1000;
      if (dt > 0) {
        velocityX = (event.clientX - this.lastMouseEvent.x) / dt;
        velocityY = (event.clientY - this.lastMouseEvent.y) / dt;
      }
    }

    const mouseEvent: MouseMoveEvent = {
      type: 'mouse_move',
      timestamp: now,
      x: event.clientX,
      y: event.clientY,
      velocityX: Math.round(velocityX),
      velocityY: Math.round(velocityY),
    };

    this.addToBuffer(mouseEvent);

    this.lastMouseEvent = { x: event.clientX, y: event.clientY, time: now };
    this.lastMouseSampleTime = now;
  }

  private handleClick(e: Event): void {
    const event = e as MouseEvent;

    const buttonType: ClickEvent['buttonType'] =
      event.button === 0 ? 'left' : event.button === 2 ? 'right' : 'middle';

    const clickEvent: ClickEvent = {
      type: 'click',
      timestamp: Date.now(),
      x: event.clientX,
      y: event.clientY,
      target: this.getTargetSelector(event.target as Element),
      buttonType,
    };

    this.addToBuffer(clickEvent);
  }

  private handleScroll(): void {
    const scrollEvent: ScrollEvent = {
      type: 'scroll',
      timestamp: Date.now(),
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      deltaX: 0, // scroll 이벤트에서는 delta 사용 불가
      deltaY: 0,
    };

    this.addToBuffer(scrollEvent);
  }

  private handleKeyDown(e: Event): void {
    const event = e as KeyboardEvent;

    // dwell time 측정 시작
    if (!this.keyDownTimes.has(event.keyCode)) {
      this.keyDownTimes.set(event.keyCode, Date.now());
    }
  }

  private handleKeyUp(e: Event): void {
    const event = e as KeyboardEvent;
    const target = event.target as HTMLElement;

    // dwell time 계산
    const downTime = this.keyDownTimes.get(event.keyCode);
    const dwellTime = downTime ? Date.now() - downTime : undefined;
    this.keyDownTimes.delete(event.keyCode);

    const keystrokeEvent: KeystrokeEvent = {
      type: 'keystroke',
      timestamp: Date.now(),
      keyCode: event.keyCode,
      targetType: target.tagName.toLowerCase(),
      dwellTime,
    };

    this.addToBuffer(keystrokeEvent);
  }

  private handleFocus(): void {
    const focusEvent: FocusEvent = {
      type: 'focus',
      timestamp: Date.now(),
      target: 'window',
    };

    this.addToBuffer(focusEvent);
  }

  private handleBlur(): void {
    const blurEvent: FocusEvent = {
      type: 'blur',
      timestamp: Date.now(),
      target: 'window',
    };

    this.addToBuffer(blurEvent);
  }

  private handleVisibility(): void {
    const visibilityEvent: VisibilityEvent = {
      type: 'visibility',
      timestamp: Date.now(),
      visible: document.visibilityState === 'visible',
    };

    this.addToBuffer(visibilityEvent);
  }

  // =========================================================================
  // Private: 유틸리티
  // =========================================================================

  private addToBuffer(event: TelemetryEvent): void {
    // 버퍼 크기 제한
    if (this.buffer.length >= this.config.maxBufferSize) {
      // 오래된 이벤트 제거 (FIFO)
      this.buffer.shift();
    }

    this.buffer.push(event);
  }

  private getTargetSelector(element: Element | null): string {
    if (!element) return '';

    // 간단한 selector 생성
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className
      ? `.${element.className.split(' ').filter(Boolean).join('.')}`
      : '';

    return `${tag}${id}${classes}`.slice(0, 100); // 최대 100자
  }

  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[TelemetryCollector] ${message}`);
    }
  }
}
