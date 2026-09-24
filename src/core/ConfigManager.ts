import { DataLoader } from '../data/DataLoader';
import { SchemaValidator } from '../data/SchemaValidator';
import { RuntimeConfig } from '../data/RuntimeConfig';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: RuntimeConfig | null = null;
  private isLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 데이터를 비동기로 로드하고 검증 스키마를 통과시켜 캐싱합니다.
   */
  public async loadAllConfig(): Promise<void> {
    try {
      const rawData = await DataLoader.loadAllBalanceFiles();

      // 1. Zod를 활용한 개별 스키마 유효성 검증
      const poopsValidated = SchemaValidator.parsePoops(rawData.poopsRaw);
      const conditionRatesValidated = SchemaValidator.parseConditionRates(rawData.conditionRatesRaw);
      const stagesValidated = SchemaValidator.parseStages(rawData.stagesRaw);
      const bossesValidated = SchemaValidator.parseBosses(rawData.bossesRaw);
      const rewardsValidated = SchemaValidator.parseRewards(rawData.rewardsRaw);

      // 2. 크로스 레퍼런스(상호 참조) 유효성 검증
      SchemaValidator.validateCrossReferences({
        poops: poopsValidated.poops,
        conditionRates: conditionRatesValidated.conditionRates,
        stages: stagesValidated.stages,
        bosses: bossesValidated.bosses,
        rewards: rewardsValidated.rewards
      });

      // 3. RuntimeConfig 인스턴스화 및 동결 캐싱
      this.config = new RuntimeConfig({
        poops: poopsValidated.poops,
        conditionRates: conditionRatesValidated.conditionRates,
        stages: stagesValidated.stages,
        bosses: bossesValidated.bosses,
        rewards: rewardsValidated.rewards
      });

      this.isLoaded = true;
    } catch (error) {
      this.isLoaded = false;
      this.config = null;
      throw error;
    }
  }

  public getConfig(): RuntimeConfig {
    if (!this.isLoaded || !this.config) {
      throw new Error("RuntimeConfig가 로드되지 않았습니다. ConfigManager.loadAllConfig()를 먼저 실행해야 합니다.");
    }
    return this.config;
  }

  public getIsLoaded(): boolean {
    return this.isLoaded;
  }
}
