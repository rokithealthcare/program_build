export class DataLoader {
  static async loadJson(path: string): Promise<any> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`데이터 로드 실패: ${path} (상태 코드: ${response.status})`);
    }
    return await response.json();
  }

  static async loadAllBalanceFiles(): Promise<{
    poopsRaw: any;
    conditionRatesRaw: any;
    stagesRaw: any;
    bossesRaw: any;
    rewardsRaw: any;
  }> {
    const [poopsRaw, conditionRatesRaw, stagesRaw, bossesRaw, rewardsRaw] = await Promise.all([
      this.loadJson('data/balance/poop_balance.json'),
      this.loadJson('data/balance/condition_rates.json'),
      this.loadJson('data/balance/stage_balance.json'),
      this.loadJson('data/balance/boss_balance.json'),
      this.loadJson('data/balance/reward_balance.json')
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
