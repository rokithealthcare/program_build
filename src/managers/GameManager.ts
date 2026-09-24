import { GameStateMachine } from '../core/GameStateMachine';
import { StageManager } from './StageManager';
import { EventBus } from '../core/EventBus';
import type { GameState } from '../types/game';

export class GameManager {
  private static instance: GameManager;

  private score: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  private life: number = 3;
  private maxLife: number = 3;
  private stageId: string | null = null;
  private hitCount: number = 0;
  private missCount: number = 0;

  private stateMachine: GameStateMachine;

  private constructor() {
    this.stateMachine = new GameStateMachine();
  }

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  // --- 상태 머신 대리자 메서드 ---
  public getCurrentState(): GameState {
    return this.stateMachine.getCurrentState();
  }

  public transitionTo(targetState: GameState): boolean {
    const success = this.stateMachine.transitionTo(targetState);
    if (success && targetState === 'MainMenu') {
      this.stageId = null;
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.hitCount = 0;
      this.missCount = 0;
    }
    return success;
  }

  // --- 세션 게터 ---
  public getScore(): number { return this.score; }
  public getCombo(): number { return this.combo; }
  public getMaxCombo(): number { return this.maxCombo; }
  public getLife(): number { return this.life; }
  public getMaxLife(): number { return this.maxLife; }
  public getStageId(): string | null { return this.stageId; }
  public getHitCount(): number { return this.hitCount; }
  public getMissCount(): number { return this.missCount; }
  public incrementHit(): void { this.hitCount++; }
  public incrementMiss(): void { this.missCount++; }

  // --- 세션 제어 및 3단계 흐름 연동 ---
  /**
   * 지정된 스테이지 세션을 시작합니다.
   * 반드시 MainMenu -> Loading -> Playing 순차 전이 흐름을 준수합니다.
   */
  public startStage(stageId: string): void {
    // 1. 상태 전이: MainMenu -> Loading
    const transToLoading = this.transitionTo('Loading');
    if (!transToLoading) {
      throw new Error(`상태 전이 실패: Loading 단계에 진입할 수 없습니다. (현재 상태: ${this.getCurrentState()})`);
    }

    try {
      // 2. StageManager 데이터 확인
      StageManager.getInstance().getStageConfig(stageId);
      this.stageId = stageId;

      // 3. 세션 지표 초기화 (임시로 라이프 등 지정)
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.life = 3;
      this.maxLife = 3;
      this.hitCount = 0;
      this.missCount = 0;

      // 4. 상태 전이: Loading -> Playing
      const transToPlaying = this.transitionTo('Playing');
      if (!transToPlaying) {
        throw new Error("상태 전이 실패: Playing 게임 화면으로 진입할 수 없습니다.");
      }

      // 5. 이벤트 및 세션 시작 신호 발행
      EventBus.getInstance().emit('STAGE_STARTED', { stageId });
      EventBus.getInstance().emit('SCORE_CHANGED', { score: this.score, delta: 0 });
      EventBus.getInstance().emit('COMBO_CHANGED', { combo: this.combo });
      EventBus.getInstance().emit('LIFE_CHANGED', { life: this.life, maxLife: this.maxLife });

    } catch (err) {
      // 오류 발생 시 다시 MainMenu 상태 복구
      this.transitionTo('MainMenu');
      throw err;
    }
  }

  /**
   * 스테이지 세션을 종료하고 결과 화면으로 전이합니다.
   */
  public finishStage(result: 'clear' | 'fail'): void {
    if (this.getCurrentState() !== 'Playing') {
      console.warn("Playing 상태가 아닐 때는 스테이지를 종료할 수 없습니다.");
      return;
    }

    const currentStageId = this.stageId || 'unknown';
    
    // Playing -> Result 전이
    if (this.transitionTo('Result')) {
      EventBus.getInstance().emit('STAGE_FINISHED', {
        stageId: currentStageId,
        result,
        score: this.score,
        maxCombo: this.maxCombo,
        hitCount: this.hitCount,
        missCount: this.missCount
      });
    }
  }

  // --- 수동 테스트용 더미 메서드 (슬링샷/물리 대체) ---
  public addScore(amount: number): void {
    this.score += amount;
    EventBus.getInstance().emit('SCORE_CHANGED', { score: this.score, delta: amount });

    if (this.stageId && this.getCurrentState() === 'Playing') {
      try {
        const stageConfig = StageManager.getInstance().getStageConfig(this.stageId);
        if (this.score >= stageConfig.targetScore) {
          this.finishStage('clear');
        }
      } catch (err) {
        console.error("목표 점수 도달 체크 에러:", err);
      }
    }
  }

  public addCombo(amount: number): void {
    this.combo += amount;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    EventBus.getInstance().emit('COMBO_CHANGED', { combo: this.combo });
  }

  public resetCombo(): void {
    this.combo = 0;
    EventBus.getInstance().emit('COMBO_CHANGED', { combo: this.combo });
  }

  public loseLife(): void {
    if (this.life > 0) {
      this.life -= 1;
      EventBus.getInstance().emit('LIFE_CHANGED', { life: this.life, maxLife: this.maxLife });
      
      if (this.life <= 0) {
        this.finishStage('fail');
      }
    }
  }
}
