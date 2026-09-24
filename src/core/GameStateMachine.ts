import type { GameState } from '../types/game';
import { EventBus } from './EventBus';

export class GameStateMachine {
  private currentState: GameState = 'Boot';

  // 상태 전이 규칙 정의
  private allowedTransitions: Record<GameState, GameState[]> = {
    Boot: ['MainMenu'],
    MainMenu: ['Loading'],
    Loading: ['Playing'],
    Playing: ['Paused', 'Result'],
    Paused: ['Playing', 'MainMenu'],
    Result: ['MainMenu', 'Loading']
  };

  constructor() {}

  public getCurrentState(): GameState {
    return this.currentState;
  }

  /**
   * targetState로 전이 가능한지 체크
   */
  public canTransition(targetState: GameState): boolean {
    const allowed = this.allowedTransitions[this.currentState];
    return allowed ? allowed.includes(targetState) : false;
  }

  /**
   * 상태 전이 실행
   */
  public transitionTo(targetState: GameState): boolean {
    if (this.canTransition(targetState)) {
      const previousState = this.currentState;
      this.currentState = targetState;

      if (import.meta.env.DEV) {
        console.log(`[FSM] State Transited: ${previousState} -> ${targetState}`);
      }

      // 상태 변경 이벤트 발행
      EventBus.getInstance().emit('GAME_STATE_CHANGED', {
        currentState: targetState,
        previousState
      });

      return true;
    } else {
      const warningMsg = `[FSM Warn] 비정상적인 상태 전이 시도: ${this.currentState} -> ${targetState}`;
      if (import.meta.env.DEV) {
        console.warn(warningMsg);
      }
      return false;
    }
  }
}
