import Phaser from 'phaser';
import { PlayerProjectile } from './PlayerProjectile';
import { PoopProjectile } from './PoopProjectile';
import { GameManager } from '../managers/GameManager';
import { ConfigManager } from '../core/ConfigManager';
import { EventBus } from '../core/EventBus';

export class HitResolver {
  /**
   * 충돌한 두 투사체 간 중심 오차 거리 및 스윗스팟 계산을 통한 타격 판정 실행
   */
  public static resolveHit(
    proj: PlayerProjectile,
    poop: PoopProjectile
  ): { judgement: 'perfect' | 'good' | 'graze' | 'miss'; scoreGained: number } {
    const gm = GameManager.getInstance();
    const config = ConfigManager.getInstance().getConfig();

    const dist = Phaser.Math.Distance.Between(proj.x, proj.y, poop.x, poop.y);
    const projRadius = 20;
    const poopDef = config.poopBalance[poop.poopId];
    const poopRadius = poopDef ? poopDef.radius : 25;
    const combinedRadius = projRadius + poopRadius;

    const ratio = dist / combinedRadius;

    let judgement: 'perfect' | 'good' | 'graze' | 'miss' = 'good';
    let multiplier = 1.0;

    if (ratio <= 0.35) {
      judgement = 'perfect';
      multiplier = 1.5;
    } else if (ratio <= 0.75) {
      judgement = 'good';
      multiplier = 1.0;
    } else {
      judgement = 'graze';
      multiplier = 0.5;
    }

    const baseScore = poopDef ? poopDef.score : 100;
    const currentCombo = gm.getCombo();

    const scoreGained = Math.round(baseScore * multiplier * (1 + currentCombo * 0.05));
    gm.incrementHit();

    if (judgement === 'perfect' || judgement === 'good') {
      gm.addCombo(1);
      gm.addScore(scoreGained);
    } else if (judgement === 'graze') {
      gm.addScore(scoreGained);
    }

    EventBus.getInstance().emit('POOP_HIT', {
      poopId: poop.poopId,
      judgement,
      score: scoreGained
    });

    return {
      judgement,
      scoreGained
    };
  }
}

