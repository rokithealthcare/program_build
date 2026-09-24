import Phaser from 'phaser';
import { ConfigManager } from '../core/ConfigManager';
import { GameManager } from '../managers/GameManager';
import { ConditionManager } from '../managers/ConditionManager';
import { PoopManager } from '../managers/PoopManager';
import { EventBus } from '../core/EventBus';
import type { GameEventPayloads } from '../types/events';

export class DebugOverlay {
  private game: Phaser.Game;
  private containerEl: HTMLDivElement | null = null;
  private eventLogQueue: string[] = [];
  
  private currentAimAngle: number = 0;
  private currentAimPower: number = 0;
  private currentAimDistance: number = 0;
  private isAiming: boolean = false;

  constructor(game: Phaser.Game) {
    this.game = game;
    
    if (!import.meta.env.DEV) {
      return;
    }

    this.createDomElements();
    this.bindEvents();
    this.game.events.on(Phaser.Core.Events.POST_STEP, this.update, this);
  }

  private createDomElements() {
    this.containerEl = document.createElement('div');
    this.containerEl.id = 'debug-overlay';
    
    Object.assign(this.containerEl.style, {
      position: 'absolute',
      left: '10px',
      top: '10px',
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: '12px',
      lineHeight: '1.4',
      borderRadius: '5px',
      pointerEvents: 'none',
      zIndex: '9999',
      border: '1px solid #00ff00',
      minWidth: '240px'
    });

    document.body.appendChild(this.containerEl);
  }

  private bindEvents() {
    const bus = EventBus.getInstance();
    const logEvent = (name: string) => {
      this.eventLogQueue.unshift(`${new Date().toLocaleTimeString()} [${name}]`);
      if (this.eventLogQueue.length > 5) {
        this.eventLogQueue.pop();
      }
    };

    const eventsToWatch: (keyof GameEventPayloads)[] = [
      'APP_BOOTED', 'CONFIG_LOADED', 'SCENE_CHANGED', 'GAME_STATE_CHANGED',
      'STAGE_STARTED', 'STAGE_PAUSED', 'STAGE_RESUMED', 'STAGE_FINISHED',
      'SCORE_CHANGED', 'COMBO_CHANGED', 'LIFE_CHANGED', 'CONDITION_CHANGED',
      'POOP_SPAWNED', 'POOP_HIT', 'POOP_MISSED', 'DEBUG_TOGGLED',
      'PLAYER_AIM_STARTED', 'PLAYER_SHOT_RELEASED'
    ];

    for (const e of eventsToWatch) {
      bus.on(e as any, () => logEvent(e));
    }

    bus.on('PLAYER_AIM_STARTED', () => {
      this.isAiming = true;
    });

    bus.on('PLAYER_AIM_UPDATED', (payload) => {
      this.currentAimAngle = payload.angle;
      this.currentAimPower = payload.power;
      this.currentAimDistance = payload.distance;
    });

    bus.on('PLAYER_SHOT_RELEASED', () => {
      this.isAiming = false;
      this.currentAimAngle = 0;
      this.currentAimPower = 0;
      this.currentAimDistance = 0;
    });
  }

  private update() {
    if (!this.containerEl) return;

    const fps = Math.round(this.game.loop.actualFps);
    const activeScenes = this.game.scene.getScenes(true);
    const activeSceneNames = activeScenes.map(s => s.sys.settings.key).join(', ') || 'None';

    const gm = GameManager.getInstance();
    const gameState = gm.getCurrentState();
    const activeStage = gm.getStageId() || 'None';

    const configLoaded = ConfigManager.getInstance().getIsLoaded();
    let dataSummary = 'Not Loaded';
    if (configLoaded) {
      const config = ConfigManager.getInstance().getConfig();
      const pCount = Object.keys(config.poopBalance).length;
      const sCount = Object.keys(config.stageBalance).length;
      dataSummary = `P:${pCount} S:${sCount} OK`;
    }

    const width = this.game.scale.width;
    const height = this.game.scale.height;
    let pointerInfo = 'X:0 Y:0';
    if (activeScenes.length > 0) {
      const scene = activeScenes[0];
      const pointer = scene.input.activePointer;
      if (pointer) {
        pointerInfo = `X:${Math.round(pointer.worldX)} Y:${Math.round(pointer.worldY)}`;
      }
    }

    const listenerCount = EventBus.getInstance().getListenerCount();
    const eventLogsHtml = this.eventLogQueue.length > 0
      ? this.eventLogQueue.map(log => `<div style="font-size:11px;color:#a3e635;">${log}</div>`).join('')
      : '<div style="font-size:11px;color:#888;">No events yet</div>';

    const degAngle = (this.currentAimAngle * 180) / Math.PI;
    const slingshotInfoHtml = this.isAiming
      ? `<div style="color:#60a5fa;">Angle: ${degAngle.toFixed(1)}° (${this.currentAimAngle.toFixed(2)} rad)</div>
         <div style="color:#60a5fa;">Power: ${this.currentAimPower.toFixed(2)} (Dist: ${this.currentAimDistance.toFixed(1)}px)</div>`
      : `<div style="color:#888;">Aim: Idle</div>`;

    const condMgr = ConditionManager.getInstance();
    const poopMgr = PoopManager.getInstance();
    const conditionId = condMgr.getCondition();
    const activePoops = poopMgr.getActivePoopsCount();
    const lastSpawned = poopMgr.getLastSpawnedPoopId();
    const interval = poopMgr.getSpawnIntervalMs();
    const missed = poopMgr.getMissedCount();

    this.containerEl.innerHTML = `
      <div><strong>[DEBUG OVERLAY]</strong></div>
      <hr style="border: 0.5px solid #00ff00; margin: 5px 0;" />
      <div>FPS: ${fps}</div>
      <div>Scene: ${activeSceneNames}</div>
      <div>State: <span style="color:#fde047;font-weight:bold;">${gameState}</span></div>
      <div>Stage: ${activeStage}</div>
      <div>Data: ${dataSummary}</div>
      <div>Canvas: ${width}x${height}</div>
      <div>Pointer: ${pointerInfo}</div>
      <div>Listeners: ${listenerCount} active</div>
      <hr style="border: 0.5px solid #00ff00; margin: 5px 0;" />
      <div><strong>[Condition & Poop Spawner]</strong></div>
      <div>Condition: <span style="color:#f472b6;font-weight:bold;">${conditionId}</span></div>
      <div>Active Poops: ${activePoops}</div>
      <div>Last Spawned: ${lastSpawned}</div>
      <div>Spawn Interval: ${interval}ms</div>
      <div>Missed Poops: <span style="color:#f87171;">${missed}</span></div>
      <hr style="border: 0.5px solid #00ff00; margin: 5px 0;" />
      <div><strong>[Slingshot Real-Time]</strong></div>
      ${slingshotInfoHtml}
      <hr style="border: 0.5px solid #00ff00; margin: 5px 0;" />
      <div><strong>[Recent Event Logs]</strong></div>
      ${eventLogsHtml}
    `;
  }

  public destroy() {
    if (this.containerEl && this.containerEl.parentNode) {
      this.containerEl.parentNode.removeChild(this.containerEl);
    }
    this.game.events.off(Phaser.Core.Events.POST_STEP, this.update, this);
  }
}
