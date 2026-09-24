import Phaser from 'phaser';

export class AimPreview {
  private graphics: Phaser.GameObjects.Graphics;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(20);
  }

  /**
   * 조준선 업데이트 및 점선 가이드 드로잉 (파워 기반 가변 길이 및 타겟 조준원)
   */
  public draw(startX: number, startY: number, angle: number, power: number) {
    this.graphics.clear();

    if (power <= 0.05) return;

    const maxLength = 1100;
    const length = power * maxLength;

    const dotCount = 20;
    const step = length / dotCount;

    for (let i = 1; i <= dotCount; i++) {
      const currentLen = i * step;
      const x = startX + Math.cos(angle) * currentLen;
      const y = startY + Math.sin(angle) * currentLen;

      const alpha = 1.0 - (i / dotCount) * 0.4;
      const radius = 9 - (i / dotCount) * 4;

      // Outer glow
      this.graphics.fillStyle(0xffa500, alpha * 0.4);
      this.graphics.fillCircle(x, y, radius + 4);

      // Inner dot
      this.graphics.fillStyle(0xffff00, alpha);
      this.graphics.fillCircle(x, y, Math.max(radius, 3));
    }

    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;

    // Target Reticle
    this.graphics.lineStyle(4, 0xff3366, 0.9);
    this.graphics.strokeCircle(endX, endY, 22);
    this.graphics.lineStyle(2, 0xffffff, 1.0);
    this.graphics.strokeCircle(endX, endY, 14);

    // Crosshair lines
    this.graphics.lineBetween(endX - 28, endY, endX - 14, endY);
    this.graphics.lineBetween(endX + 14, endY, endX + 28, endY);
    this.graphics.lineBetween(endX, endY - 28, endX, endY - 14);
    this.graphics.lineBetween(endX, endY + 14, endX, endY + 28);
  }

  public clear() {
    this.graphics.clear();
  }

  public destroy() {
    this.graphics.destroy();
  }
}

