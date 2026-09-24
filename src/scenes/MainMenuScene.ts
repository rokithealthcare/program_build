import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import { AudioManager } from '../managers/AudioManager';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const gm = GameManager.getInstance();
    if (gm.getCurrentState() !== 'MainMenu') {
      gm.transitionTo('MainMenu');
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Rich gradient background
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x312e81, 0x4338ca, 1.0);
    bgGraphics.fillRect(0, 0, width, height);

    // Floating particles/stars in background
    for (let i = 0; i < 30; i++) {
      const px = Phaser.Math.Between(0, width);
      const py = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(2, 6);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
      const star = this.add.circle(px, py, size, 0xfef08a, alpha);

      this.tweens.add({
        targets: star,
        alpha: { from: alpha, to: 0.1 },
        y: py - Phaser.Math.Between(20, 60),
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        loop: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Title Logo Banner
    const titleContainer = this.add.container(width / 2, height * 0.24);

    const titleGlow = this.add.text(0, 0, '똥 홈런 게임', {
      fontFamily: 'Arial',
      fontSize: '92px',
      fontStyle: 'bold',
      color: '#fbbf24'
    }).setOrigin(0.5).setAlpha(0.6);

    const titleText = this.add.text(0, 0, '똥 홈런 게임', {
      fontFamily: 'Arial',
      fontSize: '88px',
      fontStyle: 'bold',
      color: '#f59e0b',
      stroke: '#000000',
      strokeThickness: 10
    }).setOrigin(0.5);

    const subtitleText = this.add.text(0, 75, '⚾ 슬링샷 리듬 홈런 액션 💩', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#fef08a',
      fontStyle: 'bold'
    }).setOrigin(0.5).setStroke('#000000', 4);

    titleContainer.add([titleGlow, titleText, subtitleText]);

    // Title Floating Motion
    this.tweens.add({
      targets: titleContainer,
      y: height * 0.24 - 12,
      duration: 1500,
      yoyo: true,
      loop: -1,
      ease: 'Sine.easeInOut'
    });

    // Character Preview Image
    if (this.textures.exists('child_poop_start_001')) {
      const childPreview = this.add.sprite(width / 2, height * 0.50, 'child_poop_start_001')
        .setOrigin(0.5, 0.5)
        .setScale(0.28);

      this.tweens.add({
        targets: childPreview,
        scaleY: 0.29,
        duration: 900,
        yoyo: true,
        loop: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // How to Play Card
    const guideBg = this.add.rectangle(width / 2, height * 0.67, width - 160, 140, 0x1e293b, 0.85);
    guideBg.setStrokeStyle(3, 0x6366f1, 0.6);

    this.add.text(width / 2, height * 0.67 - 25, '🎮 게임 조작 방법', {
      fontFamily: 'Arial',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#a5b4fc'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.67 + 25, '하단 화면을 드래그하여 조준 후 릴리즈!\n날아오는 똥을 완벽한 타이밍에 타격하세요!', {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#e2e8f0',
      align: 'center'
    }).setOrigin(0.5);

    // Big Start Button
    const btnWidth = 520;
    const btnHeight = 110;
    const btnY = height * 0.83;

    const startBtnBg = this.add.rectangle(width / 2, btnY, btnWidth, btnHeight, 0x10b981, 1.0);
    startBtnBg.setStrokeStyle(6, 0xffffff, 0.9);
    startBtnBg.setInteractive({ useHandCursor: true });

    const startBtnText = this.add.text(width / 2, btnY, 'GAME START', {
      fontFamily: 'Arial',
      fontSize: '46px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5).setStroke('#065f46', 4);

    // Pulse Animation
    this.tweens.add({
      targets: [startBtnBg, startBtnText],
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 700,
      yoyo: true,
      loop: -1,
      ease: 'Sine.easeInOut'
    });

    const startGame = () => {
      AudioManager.getInstance().playSfx('shoot');
      try {
        GameManager.getInstance().startStage('stage_001');
        this.scene.start('GameScene');
      } catch (err) {
        console.error("스테이지 기동 실패:", err);
      }
    };

    startBtnBg.on('pointerover', () => startBtnBg.setFillStyle(0x059669));
    startBtnBg.on('pointerout', () => startBtnBg.setFillStyle(0x10b981));
    startBtnBg.on('pointerdown', startGame);

    // Screen tap shortcut fallback
    this.input.once('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < height * 0.75) {
        startGame();
      }
    });
  }
}

