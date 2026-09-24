import type { GameEventPayloads } from '../types/events';

type Listener<T> = (payload: T) => void;

export class EventBus {
  private static instance: EventBus;
  private listeners: { [K in keyof GameEventPayloads]?: Listener<GameEventPayloads[K]>[] } = {};

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * 이벤트 리스너 등록
   */
  public on<K extends keyof GameEventPayloads>(
    event: K,
    callback: Listener<GameEventPayloads[K]>
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }

  /**
   * 이벤트 리스너 등록 해제
   */
  public off<K extends keyof GameEventPayloads>(
    event: K,
    callback: Listener<GameEventPayloads[K]>
  ): void {
    const list = this.listeners[event];
    if (!list) return;

    this.listeners[event] = list.filter((cb) => cb !== callback) as any;
  }

  /**
   * 일회성 이벤트 리스너 등록
   */
  public once<K extends keyof GameEventPayloads>(
    event: K,
    callback: Listener<GameEventPayloads[K]>
  ): void {
    const wrapper = (payload: GameEventPayloads[K]) => {
      callback(payload);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * 이벤트 발행
   */
  public emit<K extends keyof GameEventPayloads>(
    event: K,
    payload: GameEventPayloads[K]
  ): void {
    if (import.meta.env.DEV) {
      console.log(`[EventBus] Emit: ${event}`, payload);
    }

    const list = this.listeners[event];
    if (!list) return;

    const targets = [...list];
    for (const cb of targets) {
      try {
        cb(payload);
      } catch (err) {
        console.error(`이벤트 콜백 실행 에러 (${event}):`, err);
      }
    }
  }

  /**
   * 모든 리스너 제거
   */
  public clear(): void {
    this.listeners = {};
  }

  /**
   * 등록된 리스너의 총 수량 조회
   */
  public getListenerCount(): number {
    let count = 0;
    for (const list of Object.values(this.listeners)) {
      if (list) {
        count += list.length;
      }
    }
    return count;
  }
}
