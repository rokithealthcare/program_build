import type { PoopDefinition } from './balance';

export interface PoopRuntimeData {
  poopId: string;
  instanceId: string;
  config: PoopDefinition;
  x: number;
  y: number;
}
