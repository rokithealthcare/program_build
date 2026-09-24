import type { PoopDefinition, StageDefinition, BossDefinition, RewardDefinition } from '../types/balance';

export class RuntimeConfig {
  readonly poopBalance: Readonly<Record<string, PoopDefinition>>;
  readonly conditionRates: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly stageBalance: Readonly<Record<string, StageDefinition>>;
  readonly bossBalance: Readonly<Record<string, BossDefinition>>;
  readonly rewardBalance: Readonly<Record<string, RewardDefinition>>;

  constructor(data: {
    poops: Record<string, PoopDefinition>;
    conditionRates: Record<string, Record<string, number>>;
    stages: Record<string, StageDefinition>;
    bosses: Record<string, BossDefinition>;
    rewards: Record<string, RewardDefinition>;
  }) {
    this.poopBalance = Object.freeze(data.poops);
    
    const frozenRates: Record<string, Readonly<Record<string, number>>> = {};
    for (const [key, val] of Object.entries(data.conditionRates)) {
      frozenRates[key] = Object.freeze(val);
    }
    this.conditionRates = Object.freeze(frozenRates);
    
    this.stageBalance = Object.freeze(data.stages);
    this.bossBalance = Object.freeze(data.bosses);
    this.rewardBalance = Object.freeze(data.rewards);
  }
}
