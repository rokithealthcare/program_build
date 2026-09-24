import type { GameState } from './game';

export interface GameEventPayloads {
  APP_BOOTED: undefined;
  CONFIG_LOADED: undefined;
  SCENE_CHANGED: { currentScene: string; previousScene: string };
  GAME_STATE_CHANGED: { currentState: GameState; previousState: GameState };
  STAGE_STARTED: { stageId: string };
  STAGE_PAUSED: undefined;
  STAGE_RESUMED: undefined;
  STAGE_FINISHED: { stageId: string; result: 'clear' | 'fail'; score: number; maxCombo: number; hitCount?: number; missCount?: number };
  SCORE_CHANGED: { score: number; delta: number };
  COMBO_CHANGED: { combo: number };
  LIFE_CHANGED: { life: number; maxLife: number };
  CONDITION_CHANGED: { conditionId: string; faceId: string };
  CHILD_FACE_CHANGE: { faceType: 'normal' | 'straining' | 'happy' | 'shocked' };
  POOP_SPAWNED: { poopId: string; instanceId: string };
  POOP_HIT: { poopId: string; judgement: 'perfect' | 'good' | 'graze' | 'miss'; score: number };
  POOP_MISSED: { poopId: string };
  DEBUG_TOGGLED: { isVisible: boolean };
  PLAYER_AIM_STARTED: { startX: number; startY: number };
  PLAYER_AIM_UPDATED: { angle: number; power: number; distance: number };
  PLAYER_SHOT_RELEASED: { angle: number; power: number };
  PLAYER_PROJECTILE_SPAWNED: { instanceId: string; x: number; y: number; vx: number; vy: number };
  PLAYER_PROJECTILE_DESPAWNED: { instanceId: string };
  STAGE_TIMER_CHANGED: { remainingTime: number };
  STAGE_TARGET_SCORE_LOADED: { targetScore: number };
}
