export interface PoopDefinition {
  speed: number;
  radius: number;
  score: number;
  difficulty: number;
  assetId: string;
  hitboxId: string;
}

export type ConditionRates = Record<string, number>;

export interface StageDefinition {
  name: string;
  timeLimitSec: number;
  targetScore: number;
  spawnIntervalMs: number;
  conditionPool: string[];
  bossId: string | null;
  rewardTableId: string;
}

export interface BossPattern {
  patternId: string;
  cooldownSec: number;
  weight: number;
}

export interface BossDefinition {
  hp: number;
  patternSelect: 'sequential' | 'weighted_cooldown';
  patterns: BossPattern[];
}

export interface RewardDefinition {
  baseCoin: number;
  baseExp: number;
  firstClearBonusCoin: number;
}
