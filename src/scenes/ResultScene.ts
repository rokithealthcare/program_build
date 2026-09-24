import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import { AudioManager } from '../managers/AudioManager';

export class ResultScene extends Phaser.Scene {
  private resultData = {
    score: 0,
    combo: 0,
    result: 'clear' as 'clear' | 'fail',
    hitCount: 0,
    missCount: 0
  };

  private displayScore: number = 0;

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: { score: number; maxCombo: number; result: 'clear' | 'fail'; hitCount?: number; missCount?: number }) {
    const gm = GameManager.getInstance();
    this.resultData = {
      score: data ? data.score : gm.getScore(),
      combo: data ? data.maxCombo : gm.getMaxCombo(),
      result: data ? data.result : 'clear',
      hitCount: data && data.hitCount !== undefined ? data.hitCount : gm.getHitCount(),
      missCount: data && data.missCount !== undefined ? data.missCount : gm.getMissCount()
    };
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Gradient Background
    const bgGraphics = this.add.graphics();
    if (this.resultData.result === 'clear') {
      bgGraphics.fillGradientStyle(0x1e293b, 0x1e293b, 0x0f172a, 0x1e1b4b, 1.0);
    } else {
      bgGraphics.fillGradientStyle(0x450a0a, 0x450a0a, 0x18181b, 0x27272a, 1.0);
    }
    bgGraphics.fillRect(0, 0, width, height);

    // Victory Confetti on Clear
    if (this.resultData.result === 'clear') {
      const colors = [0xf1c40f, 0x2ecc71, 0x3498db, 0xe74c3c, 0x9b59b6];
      for (let i = 0; i < 40; i++) {
        const cx = Phaser.Math.Between(50, width - 50);
        const cy = Phaser.Math.Between(-100, height / 2);
        const color = Phaser.Utils.Array.GetRandom(colors);
        const rect = this.add.rectangle(cx, cy, Phaser.Math.Between(8, 16), Phaser.Math.Between(8, 16), color);

        this.tweens.add({
          targets: rect,
          y: cy + Phaser.Math.Between(600, 1200),
          rotation: Math.PI * 4,
          alpha: 0,
          duration: Phaser.Math.Between(2000, 4000),
          delay: Phaser.Math.Between(0, 1000),
          ease: 'Quad.easeOut'
        });
      }
    }

    const isClear = this.resultData.result === 'clear';
    const resultTitle = isClear ? 'STAGE CLEAR!' : 'STAGE FAILED';
    const titleColor = isClear ? '#f59e0b' : '#ef4444';

    // Main Title
    const titleText = this.add.text(width / 2, height * 0.16, resultTitle, {
      fontFamily: 'Arial',
      fontSize: '76px',
      fontStyle: 'bold',
      color: titleColor
    }).setOrigin(0.5).setStroke('#000000', 8);

    titleText.setScale(0.3);
    this.tweens.add({
      targets: titleText,
      scale: 1.0,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Star Rating Display (Clear mode)
    if (isClear) {
      const targetScore = 2500;
      let stars = 1;
      if (this.resultData.score >= targetScore * 1.5) stars = 3;
      else if (this.resultData.score >= targetScore) stars = 2;

      const starContainer = this.add.container(width / 2, height * 0.25);
      [-120, 0, 120].forEach((offset, idx) => {
        const starColor = idx < stars ? '#f59e0b' : '#475569';
        const star = this.add.text(offset, 0, '★', {
          fontFamily: 'Arial',
          fontSize: idx === 1 ? '96px' : '76px',
          color: starColor
        }).setOrigin(0.5).setStroke('#000000', 6);

        starContainer.add(star);

        if (idx < stars) {
          star.setScale(0);
          this.tweens.add({
            targets: star,
            scale: 1.0,
            duration: 400,
            delay: 300 + idx * 200,
            ease: 'Back.easeOut'
          });
        }
      });
    }

    // Panel
    const panel = this.add.rectangle(width / 2, height * 0.52, width - 140, 480, 0x0f172a, 0.85);
    panel.setStrokeStyle(4, 0x38bdf8, 0.5);

    const labelStyle = {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#94a3b8'
    };

    // Rows
    const currentY = height * 0.38;
    const scoreValText = this.add.text(width / 2 + 260, currentY, '0점', {
      fontFamily: 'Arial',
      fontSize: '44px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    this.add.text(width / 2 - 260, currentY, '최종 점수', labelStyle).setOrigin(0, 0);

    // Score count-up tween
    this.tweens.add({
      targets: this,
      displayScore: this.resultData.score,
      duration: 1000,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        scoreValText.setText(`${Math.round(this.displayScore)}점`);
      }
    });

    const infoRows = [
      { label: '최대 콤보', val: `${this.resultData.combo} Combo`, valColor: '#38bdf8' },
      { label: '명중 횟수', val: `${this.resultData.hitCount}회`, valColor: '#34d399' },
      { label: 'Miss 횟수', val: `${this.resultData.missCount}회`, valColor: '#f87171' }
    ];

    infoRows.forEach((row, i) => {
      const rowY = currentY + 100 + i * 90;
      this.add.text(width / 2 - 260, rowY, row.label, labelStyle).setOrigin(0, 0);
      this.add.text(width / 2 + 260, rowY, row.val, {
        fontFamily: 'Arial',
        fontSize: '40px',
        color: row.valColor,
        fontStyle: 'bold'
      }).setOrigin(1, 0);
    });

    // Retry Button
    const btnWidth = 460;
    const btnHeight = 96;
    const retryBtnY = height * 0.76;

    const retryBtnBg = this.add.rectangle(width / 2, retryBtnY, btnWidth, btnHeight, 0xf59e0b, 1.0);
    retryBtnBg.setStrokeStyle(4, 0xffffff, 0.9);
    retryBtnBg.setInteractive({ useHandCursor: true });

    this.add.text(width / 2, retryBtnY, '다시 하기', {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    retryBtnBg.on('pointerover', () => retryBtnBg.setFillStyle(0xd97706));
    retryBtnBg.on('pointerout', () => retryBtnBg.setFillStyle(0xf59e0b));
    retryBtnBg.on('pointerdown', () => {
      AudioManager.getInstance().playSfx('shoot');
      try {
        GameManager.getInstance().startStage('stage_001');
        this.scene.start('GameScene');
      } catch (err) {
        console.error("다시하기 기동 실패:", err);
      }
    });

    // Menu Button
    const menuBtnY = height * 0.88;
    const menuBtnBg = this.add.rectangle(width / 2, menuBtnY, btnWidth, btnHeight, 0x334155, 1.0);
    menuBtnBg.setStrokeStyle(4, 0x94a3b8, 0.7);
    menuBtnBg.setInteractive({ useHandCursor: true });

    this.add.text(width / 2, menuBtnY, '메인 메뉴로', {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    menuBtnBg.on('pointerover', () => menuBtnBg.setFillStyle(0x1e293b));
    menuBtnBg.on('pointerout', () => menuBtnBg.setFillStyle(0x334155));
    menuBtnBg.on('pointerdown', () => {
      AudioManager.getInstance().playSfx('hit');
      GameManager.getInstance().transitionTo('MainMenu');
      this.scene.start('MainMenuScene');
    });
  }
}

