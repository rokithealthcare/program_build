import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';

export class PlayerProjectile extends Phaser.Physics.Arcade.Sprite {
  public instanceId: string = '';
  private isFired: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const key = scene.textures.exists('projectile_ball')
      ? 'projectile_ball'
      : scene.textures.exists('fallback_projectile_ball')
      ? 'fallback_projectile_ball'
      : '__WHITE';
    super(scene, x, y, key);
  }

  public fire(x: number, y: number, angle: number, power: number) {
    this.instanceId = `proj_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const key = this.scene.textures.exists('projectile_ball')
      ? 'projectile_ball'
      : this.scene.textures.exists('fallback_projectile_ball')
      ? 'fallback_projectile_ball'
      : '__WHITE';
    this.setTexture(key);

    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.isFired = true;

    // 최대 발사 속도 2200 px/s 기준 파워 비례 연산
    const speed = power * 2200;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    if (this.body) {
      this.body.enable = true;
      this.setVelocity(vx, vy);
      this.setCircle(18);
    }

    EventBus.getInstance().emit('PLAYER_PROJECTILE_SPAWNED', {
      instanceId: this.instanceId,
      x,
      y,
      vx,
      vy
    });
  }

  public update() {
    if (!this.isFired) return;

    this.rotation += 0.25;

    const bounds = this.scene.cameras.main;
    if (
      this.y < -50 || 
      this.x < -50 || 
      this.x > bounds.width + 50 || 
      this.y > bounds.height + 50
    ) {
      this.despawn();
    }
  }

  public despawn() {
    if (!this.active) return;
    
    this.isFired = false;
    this.setVelocity(0, 0);
    this.setActive(false);
    this.setVisible(false);
    if (this.body) {
      this.body.enable = false;
    }

    EventBus.getInstance().emit('PLAYER_PROJECTILE_DESPAWNED', {
      instanceId: this.instanceId
    });
  }
}
