import { EventBus } from '../core/EventBus';

export class ConditionManager {
  private static instance: ConditionManager;
  private currentConditionId: string = 'normal';

  private constructor() {}

  public static getInstance(): ConditionManager {
    if (!ConditionManager.instance) {
      ConditionManager.instance = new ConditionManager();
    }
    return ConditionManager.instance;
  }

  public getCondition(): string {
    return this.currentConditionId;
  }

  public setCondition(conditionId: string): void {
    if (this.currentConditionId === conditionId) return;

    this.currentConditionId = conditionId;

    let faceId = 'face_normal';
    if (conditionId === 'good') faceId = 'face_happy';
    if (conditionId === 'bad') faceId = 'face_sad';
    if (conditionId === 'urgent') faceId = 'face_panic';

    EventBus.getInstance().emit('CONDITION_CHANGED', {
      conditionId,
      faceId
    });
  }
}
