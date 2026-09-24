import { z } from 'zod';

// 1. Poop Schema
export const poopDefinitionSchema = z.object({
  speed: z.number().nonnegative("속도는 0 이상이어야 합니다."),
  radius: z.number().gt(0, "반경은 0보다 커야 합니다."),
  score: z.number().nonnegative("점수는 0 이상이어야 합니다."),
  difficulty: z.number().int().gt(0, "난이도는 1 이상이어야 합니다."),
  assetId: z.string().min(1, "assetId는 필수입니다."),
  hitboxId: z.string().min(1, "hitboxId는 필수입니다.")
});

export const poopBalanceSchema = z.object({
  schemaVersion: z.number().int().gt(0, "schemaVersion은 필수이며 양수여야 합니다."),
  poops: z.record(z.string(), poopDefinitionSchema)
});

// 2. Condition Rates Schema (확률 합 100 검증 포함)
export const conditionRatesSchema = z.object({
  schemaVersion: z.number().int().gt(0, "schemaVersion은 필수이며 양수여야 합니다."),
  conditionRates: z.record(
    z.string(),
    z.record(z.string(), z.number().nonnegative("확률은 0 이상이어야 합니다."))
  )
}).superRefine((data, ctx) => {
  for (const [conditionName, rates] of Object.entries(data.conditionRates)) {
    const sum = Object.values(rates).reduce((acc, val) => acc + val, 0);
    if (Math.abs(sum - 100) > 0.0001) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['conditionRates', conditionName],
        message: `컨디션 '${conditionName}'의 똥 스폰 확률 합계는 정확히 100이어야 합니다. (현재 합계: ${sum})`
      });
    }
  }
});

// 3. Stage Schema
export const stageDefinitionSchema = z.object({
  name: z.string().min(1, "스테이지 이름은 필수입니다."),
  timeLimitSec: z.number().gt(0, "제한 시간은 0보다 커야 합니다."),
  targetScore: z.number().gt(0, "목표 점수는 0보다 커야 합니다."),
  spawnIntervalMs: z.number().gt(0, "스폰 주기는 0보다 커야 합니다."),
  conditionPool: z.array(z.string()).min(1, "최소 한 개 이상의 컨디션 풀이 필요합니다."),
  bossId: z.string().nullable(),
  rewardTableId: z.string().min(1, "보상 테이블 ID는 필수입니다.")
});

export const stageBalanceSchema = z.object({
  schemaVersion: z.number().int().gt(0, "schemaVersion은 필수이며 양수여야 합니다."),
  stages: z.record(z.string(), stageDefinitionSchema)
});

// 4. Boss Schema
export const bossPatternSchema = z.object({
  patternId: z.string().min(1),
  cooldownSec: z.number().gt(0),
  weight: z.number().nonnegative()
});

export const bossDefinitionSchema = z.object({
  hp: z.number().gt(0, "체력은 0보다 커야 합니다."),
  patternSelect: z.enum(['sequential', 'weighted_cooldown']),
  patterns: z.array(bossPatternSchema)
});

export const bossBalanceSchema = z.object({
  schemaVersion: z.number().int().gt(0, "schemaVersion은 필수이며 양수여야 합니다."),
  bosses: z.record(z.string(), bossDefinitionSchema)
});

// 5. Reward Schema
export const rewardDefinitionSchema = z.object({
  baseCoin: z.number().nonnegative(),
  baseExp: z.number().nonnegative(),
  firstClearBonusCoin: z.number().nonnegative()
});

export const rewardBalanceSchema = z.object({
  schemaVersion: z.number().int().gt(0, "schemaVersion은 필수이며 양수여야 합니다."),
  rewards: z.record(z.string(), rewardDefinitionSchema)
});

// 상호 참조 검증기 클래스
export class SchemaValidator {
  /**
   * 모든 데이터를 개별 스키마로 파싱하여 1차 검증
   */
  static parsePoops(raw: any) {
    return poopBalanceSchema.parse(raw);
  }

  static parseConditionRates(raw: any) {
    return conditionRatesSchema.parse(raw);
  }

  static parseStages(raw: any) {
    return stageBalanceSchema.parse(raw);
  }

  static parseBosses(raw: any) {
    return bossBalanceSchema.parse(raw);
  }

  static parseRewards(raw: any) {
    return rewardBalanceSchema.parse(raw);
  }

  /**
   * 로딩 완료된 전체 데이터 셋 간의 상호 참조 정합성 검증 (Cross-Reference Validation)
   */
  static validateCrossReferences(data: {
    poops: Record<string, any>;
    conditionRates: Record<string, Record<string, number>>;
    stages: Record<string, any>;
    bosses: Record<string, any>;
    rewards: Record<string, any>;
  }) {
    const poopKeys = Object.keys(data.poops);
    const bossKeys = Object.keys(data.bosses);
    const rewardKeys = Object.keys(data.rewards);

    // 1. conditionRates 내 똥 ID 참조 유효성 검사
    for (const [condName, rates] of Object.entries(data.conditionRates)) {
      for (const poopId of Object.keys(rates)) {
        if (!poopKeys.includes(poopId)) {
          throw new Error(`상호 참조 에러: 컨디션 '${condName}'의 확률 테이블에 정의되지 않은 똥 ID '${poopId}'가 존재합니다.`);
        }
      }
    }

    // 2. stages 내 bossId 및 rewardTableId 참조 유효성 검사
    for (const [stageId, stageDef] of Object.entries(data.stages)) {
      // 보스 ID 유효성
      if (stageDef.bossId !== null && !bossKeys.includes(stageDef.bossId)) {
        throw new Error(`상호 참조 에러: 스테이지 '${stageId}'에 정의된 bossId '${stageDef.bossId}'는 boss_balance.json에 존재하지 않습니다.`);
      }

      // 보상 테이블 ID 유효성
      if (!rewardKeys.includes(stageDef.rewardTableId)) {
        throw new Error(`상호 참조 에러: 스테이지 '${stageId}'에 정의된 rewardTableId '${stageDef.rewardTableId}'는 reward_balance.json에 존재하지 않습니다.`);
      }
    }

    return true;
  }
}
