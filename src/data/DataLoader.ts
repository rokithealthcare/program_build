import poopsDefault from '../../assets/data/balance/poop_balance.json';
import conditionRatesDefault from '../../assets/data/balance/condition_rates.json';
import stagesDefault from '../../assets/data/balance/stage_balance.json';
import bossesDefault from '../../assets/data/balance/boss_balance.json';
import rewardsDefault from '../../assets/data/balance/reward_balance.json';

export class DataLoader {
  static async loadJson(path: string, fallbackData?: any): Promise<any> {
    try {
      const response = await fetch(path);
      if (response.ok) {
        return await response.json();
      }
    } catch (_) {}

    if (fallbackData) {
      return fallbackData;
    }
    throw new Error(`데이터 로드 실패: ${path}`);
  }

  static async loadAllBalanceFiles(): Promise<{
    poopsRaw: any;
    conditionRatesRaw: any;
    stagesRaw: any;
    bossesRaw: any;
    rewardsRaw: any;
  }> {
    const [poopsRaw, conditionRatesRaw, stagesRaw, bossesRaw, rewardsRaw] = await Promise.all([
      this.loadJson('data/balance/poop_balance.json', poopsDefault),
      this.loadJson('data/balance/condition_rates.json', conditionRatesDefault),
      this.loadJson('data/balance/stage_balance.json', stagesDefault),
      this.loadJson('data/balance/boss_balance.json', bossesDefault),
      this.loadJson('data/balance/reward_balance.json', rewardsDefault)
    ]);

    return {
      poopsRaw,
      conditionRatesRaw,
      stagesRaw,
      bossesRaw,
      rewardsRaw
    };
  }
}

