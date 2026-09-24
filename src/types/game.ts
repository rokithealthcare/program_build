export type GameState = 'Boot' | 'MainMenu' | 'Loading' | 'Playing' | 'Paused' | 'Result';

export interface StageResult {
  stageId: string;
  result: 'clear' | 'fail';
  score: number;
  maxCombo: number;
}
