import type { BattleParticipant, BattleSimulationResult, Seed } from '../domain/battle';
import { simulateBattle } from '../domain/battle';

export type SeedProvider = () => Seed;

export interface BattleResolver {
  (hero: BattleParticipant, enemy: BattleParticipant, seed?: Seed): BattleSimulationResult;
}

export function createIncrementingSeedProvider(startAt: number = 1): SeedProvider {
  let current = startAt;
  return () => {
    const next = current;
    current += 1;
    return next;
  };
}

export function createBattleResolver(seedProvider: SeedProvider = createIncrementingSeedProvider()): BattleResolver {
  return (hero, enemy, seed) => {
    const resolvedSeed = seed ?? seedProvider();
    return simulateBattle(hero, enemy, resolvedSeed);
  };
}

export const resolveBattle = createBattleResolver();
