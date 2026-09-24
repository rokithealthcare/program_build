import { ConfigManager } from '../core/ConfigManager';
import type { StageDefinition } from '../types/balance';

export class StageManager {
  private static instance: StageManager;

  private constructor() {}

  public static getInstance(): StageManager {
    if (!StageManager.instance) {
      StageManager.instance = new StageManager();
    }
    return StageManager.instance;
  }

  /**
   * RuntimeConfig에서 특정 스테이지 설정을 가져옵니다.
   */
  public getStageConfig(stageId: string): StageDefinition {
    const config = ConfigManager.getInstance().getConfig();
    const stage = config.stageBalance[stageId];
    if (!stage) {
      throw new Error(`존재하지 않는 스테이지 ID 참조: ${stageId}`);
    }
    return stage;
  }
}
