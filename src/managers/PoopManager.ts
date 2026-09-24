import Phaser from 'phaser';
import { ConfigManager } from '../core/ConfigManager';
import { ConditionManager } from './ConditionManager';
import { GameManager } from './GameManager';
import { EventBus } from '../core/EventBus';
import { PoopProjectile } from '../gameplay/PoopProjectile';

export class PoopManager {
  private static instance: PoopManager;

  private scene: Phaser.Scene | null = null;
  private spawnTimer: Phaser.Time.TimerEvent | null = null;
  private faceTimer: Phaser.Time.TimerEvent | null = null;
  private shockedTimer: Phaser.Time.TimerEvent | null = null;
  private poopGroup: Phaser.Physics.Arcade.Group | null = null;
  private missedCount: number = 0;
  private lastSpawnedPoopId: string = 'None';
  private spawnIntervalMs: number = 1500;

  private constructor() {
    this.bindFsmEvents();
  }

  public static getInstance(): PoopManager {
    if (!PoopManager.instance) {
      PoopManager.instance = new PoopManager();
    }
    return PoopManager.instance;
  }

  private bindFsmEvents() {
    EventBus.getInstance().on('GAME_STATE_CHANGED', (payload) => {
      if (payload.currentState === 'Playing') {
        this.resumeSpawning();
      } else {
        this.pauseSpawning();
      }
    });

    EventBus.getInstance().on('POOP_MISSED', () => {
      this.missedCount++;
      
      // 7단계: 미스 시 당황 표정 전환 및 1.5초 후 복구
      EventBus.getInstance().emit('CHILD_FACE_CHANGE', { faceType: 'shocked' });
      if (this.shockedTimer) {
        this.shockedTimer.destroy();
        this.shockedTimer = null;
      }
      if (this.scene) {
        this.shockedTimer = this.scene.time.delayedCall(1500, () => {
          if (GameManager.getInstance().getCurrentState() === 'Playing') {
            EventBus.getInstance().emit('CHILD_FACE_CHANGE', { faceType: 'normal' });
          }
          this.shockedTimer = null;
        });
      }
    });
  }

  public initialize(scene: Phaser.Scene, poopGroup: Phaser.Physics.Arcade.Group, intervalMs: number) {
    this.scene = scene;
    this.poopGroup = poopGroup;
    this.spawnIntervalMs = intervalMs;
    this.missedCount = 0;
    this.lastSpawnedPoopId = 'None';

    this.startSpawning();
  }

  private startSpawning() {
    if (!this.scene) return;

    this.stopSpawning();

    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnIntervalMs,
      callback: this.spawnPoop,
      callbackScope: this,
      loop: true
    });
  }

  private spawnPoop() {
    if (!this.scene || !this.poopGroup) return;

    if (GameManager.getInstance().getCurrentState() !== 'Playing') {
      return;
    }

    const poopId = this.selectPoopId();
    this.lastSpawnedPoopId = poopId;

    const config = ConfigManager.getInstance().getConfig();
    const poopDef = config.poopBalance[poopId];
    if (!poopDef) return;

    const width = this.scene.cameras.main.width;
    const randomX = Phaser.Math.Between(50, width - 50);
    const spawnY = 280;

    let poop = this.poopGroup.getFirstDead(false) as PoopProjectile;
    if (!poop) {
      poop = new PoopProjectile(this.scene, randomX, spawnY);
      this.poopGroup.add(poop, true);
    }
    poop.spawn(randomX, spawnY, poopId, poopDef);

    // 7단계: 스폰된 똥 종류에 따라 표정 변경
    const faceType = poopId === 'gold' ? 'happy' : 'normal';
    EventBus.getInstance().emit('CHILD_FACE_CHANGE', { faceType });

    // 7단계: 다음 스폰 0.5초 전에 "힘주기" 표정으로 전환하는 지연 타이머 등록
    if (this.faceTimer) {
      this.faceTimer.destroy();
      this.faceTimer = null;
    }
    const delayTime = Math.max(this.spawnIntervalMs - 500, 0);
    this.faceTimer = this.scene.time.delayedCall(delayTime, () => {
      if (GameManager.getInstance().getCurrentState() === 'Playing') {
        EventBus.getInstance().emit('CHILD_FACE_CHANGE', { faceType: 'straining' });
      }
      this.faceTimer = null;
    });
  }

  private selectPoopId(): string {
    const config = ConfigManager.getInstance().getConfig();
    const condId = ConditionManager.getInstance().getCondition();
    const rates = config.conditionRates[condId];
    if (!rates) {
      return 'normal';
    }

    let totalWeight = 0;
    const items: { id: string; weight: number }[] = [];
    for (const [id, weight] of Object.entries(rates)) {
      totalWeight += weight;
      items.push({ id, weight });
    }

    let randomVal = Math.random() * totalWeight;
    for (const item of items) {
      if (randomVal < item.weight) {
        return item.id;
      }
      randomVal -= item.weight;
    }

    return 'normal';
  }

  public pauseSpawning() {
    if (this.spawnTimer) {
      this.spawnTimer.paused = true;
    }
  }

  public resumeSpawning() {
    if (this.spawnTimer) {
      this.spawnTimer.paused = false;
    }
  }

  public stopSpawning() {
    if (this.spawnTimer) {
      this.spawnTimer.destroy();
      this.spawnTimer = null;
    }
    if (this.faceTimer) {
      this.faceTimer.destroy();
      this.faceTimer = null;
    }
    if (this.shockedTimer) {
      this.shockedTimer.destroy();
      this.shockedTimer = null;
    }
  }

  public cleanup() {
    this.stopSpawning();
    this.poopGroup = null;
    this.scene = null;
  }

  public getMissedCount(): number {
    return this.missedCount;
  }

  public getLastSpawnedPoopId(): string {
    return this.lastSpawnedPoopId;
  }

  public getSpawnIntervalMs(): number {
    return this.spawnIntervalMs;
  }

  public getActivePoopsCount(): number {
    if (!this.poopGroup) return 0;
    return this.poopGroup.countActive(true);
  }
}
