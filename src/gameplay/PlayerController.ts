import Phaser from 'phaser';
import { EventBus } from '../core/EventBus';
import { GameManager } from '../managers/GameManager';

export class PlayerController {
  private scene: Phaser.Scene;
  private isDragging: boolean = false;
  
  private startX: number = 0;
  private startY: number = 0;
  private currentX: number = 0;
  private currentY: number = 0;

  private readonly maxDragDistance = 200;
  private readonly minPowerThreshold = 20;

  private onShootCallback: (angle: number, power: number) => void;
  private onAimUpdateCallback: (angle: number, power: number) => void;
  private onAimClearCallback: () => void;

  constructor(
    scene: Phaser.Scene,
    onShoot: (angle: number, power: number) => void,
    onAimUpdate: (angle: number, power: number) => void,
    onAimClear: () => void
  ) {
    this.scene = scene;
    this.onShootCallback = onShoot;
    this.onAimUpdateCallback = onAimUpdate;
    this.onAimClearCallback = onAimClear;

    this.setupInput();
  }

  private setupInput() {
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (GameManager.getInstance().getCurrentState() !== 'Playing') {
      return;
    }

    // 하단 영역 Y=1200 이하 드래그 영역 필터링
    if (pointer.y < 1200) {
      return;
    }

    this.isDragging = true;
    this.startX = pointer.x;
    this.startY = pointer.y;
    this.currentX = pointer.x;
    this.currentY = pointer.y;

    EventBus.getInstance().emit('PLAYER_AIM_STARTED', {
      startX: this.startX,
      startY: this.startY
    });
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isDragging) return;

    this.currentX = pointer.x;
    this.currentY = pointer.y;

    const { angle, power, distance } = this.calculateAimData();
    this.onAimUpdateCallback(angle, power);

    EventBus.getInstance().emit('PLAYER_AIM_UPDATED', {
      angle,
      power,
      distance
    });
  }

  private onPointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const { angle, power, distance } = this.calculateAimData();
    this.onAimClearCallback();

    if (distance < this.minPowerThreshold) {
      if (import.meta.env.DEV) {
        console.log(`[Slingshot] 드래그 거리 부족으로 조준 취소 (${distance.toFixed(1)}px < ${this.minPowerThreshold}px)`);
      }
      return;
    }

    this.onShootCallback(angle, power);

    EventBus.getInstance().emit('PLAYER_SHOT_RELEASED', {
      angle,
      power
    });
  }

  public calculateAimData() {
    const dx = this.currentX - this.startX;
    const dy = this.currentY - this.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const angle = Math.atan2(-dy, -dx);
    const power = Math.min(distance / this.maxDragDistance, 1.0);

    return {
      angle,
      power,
      distance
    };
  }

  public getIsDragging(): boolean {
    return this.isDragging;
  }

  public destroy() {
    this.scene.input.off('pointerdown', this.onPointerDown, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
  }
}
