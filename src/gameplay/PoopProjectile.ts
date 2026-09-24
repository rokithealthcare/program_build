import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import type { PoopDefinition } from '../types/balance';

export class PoopProjectile extends Phaser.Physics.Arcade.Sprite {
  public poopId: string = '';
  public instanceId: string = '';
  private isSpawned: boolean = false;
  private speed: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'poop_normal');
  }

  public spawn(x: number, y: number, poopId: string, poopDef: PoopDefinition) {
    this.poopId = poopId;
    this.instanceId = `poop_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.speed = poopDef.speed;

    const textureKey = `poop_${poopId}`;
    if (this.scene.textures.exists(textureKey)) {
      this.setTexture(textureKey);
    } else {
      this.setTexture('poop_normal');
    }

    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.isSpawned = true;

    if (this.body) {
      this.body.enable = true;
      this.setVelocityY(this.speed);
      
      const radius = poopDef.radius;
      this.setCircle(radius);
    }

    EventBus.getInstance().emit('POOP_SPAWNED', {
      poopId,
      instanceId: this.instanceId
    });
  }

  public update() {
    if (!this.isSpawned) return;

    const bounds = this.scene.cameras.main;
    if (this.y > bounds.height + 50) {
      this.miss();
    }
  }

  public miss() {
    if (!this.active) return;

    EventBus.getInstance().emit('POOP_MISSED', {
      poopId: this.poopId
    });

    this.despawn();
  }

  public despawn() {
    if (!this.active) return;

    this.isSpawned = false;
    this.setVelocity(0, 0);
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.enable = false;
    }
  }
}
