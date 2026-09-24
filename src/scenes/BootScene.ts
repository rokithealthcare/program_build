import Phaser from 'phaser';
import { ConfigManager } from '../core/ConfigManager';

export class BootScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.cameras.main.setBackgroundColor('#121212');
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    this.loadingText = this.add.text(width / 2, height / 2, '밸런스 데이터 로드 및 검증 중...', {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: '#ffffff'
    });
    this.loadingText.setOrigin(0.5);
  }

  create() {
    ConfigManager.getInstance().loadAllConfig()
      .then(() => {
        this.scene.start('MainMenuScene');
      })
      .catch((error: Error) => {
        console.error("데이터 검증 에러 발생:", error);
        
        this.cameras.main.setBackgroundColor('#7f1d1d');
        this.loadingText.destroy();

        const width = this.cameras.main.width;
        
        this.add.text(width / 2, 200, 'DATA VALIDATION FAILURE', {
          fontFamily: 'Arial',
          fontSize: '64px',
          fontStyle: 'bold',
          color: '#fca5a5'
        }).setOrigin(0.5);

        this.add.text(width / 2, 320, '밸런스 JSON 데이터 검증에 실패하여 앱 구동이 차단되었습니다.', {
          fontFamily: 'Arial',
          fontSize: '32px',
          color: '#ffffff'
        }).setOrigin(0.5);

        const errorDetailBg = this.add.rectangle(width / 2, 960, width - 100, 1000, 0x1f2937, 0.95);
        errorDetailBg.setStrokeStyle(4, 0xef4444);

        const errorMsg = error instanceof Error ? error.message : String(error);
        
        let formattedErrorMsg = errorMsg;
        try {
          if (error && 'issues' in (error as any)) {
            const issues = (error as any).issues;
            formattedErrorMsg = issues.map((issue: any) => {
              return `[${issue.code}] Path: ${issue.path.join('.')} \n-> Message: ${issue.message}`;
            }).join('\n\n');
          }
        } catch (_) {}

        this.add.text(80, 490, `에러 상세 로그:`, {
          fontFamily: 'Arial',
          fontSize: '36px',
          fontStyle: 'bold',
          color: '#fca5a5'
        });

        this.add.text(80, 560, formattedErrorMsg, {
          fontFamily: 'Courier New',
          fontSize: '28px',
          color: '#f3f4f6',
          align: 'left',
          wordWrap: { width: width - 160 }
        });
      });
  }
}
