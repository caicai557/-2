import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { simulateBattle } from '../domain/battle';
import { applyLevelGain, createNewHero, experienceRequiredForLevel, grantOfflineRewards } from '../domain/progression';
import type { BattleRecord, Hero, Stage } from '../domain/models';
import { createStateStorage } from '../lib/persist';

export interface GameState {
  hero: HeroState;
  battles: BattleRecord[];
  stages: Stage[];
  initialize: (nickname?: string) => void;
  runBattle: (stageId: number) => BattleRecord;
  grantOffline: () => { expGain: number; silverGain: number; accumulatedHours: number };
}

interface HeroState extends Hero {
  lastLoginAt: number;
  offlineExp: number;
  silver: number;
}

const DEFAULT_STAGES: Stage[] = [
  {
    id: 1,
    name: '企鹅村郊外',
    enemy: {
      id: 'stage-1-enemy',
      name: '流浪企鹅',
      level: 1,
      attributes: { power: 60, skill: 40, vitality: 70, agility: 45 },
      skills: [
        {
          id: 'peck',
          name: '乱羽啄',
          level: 1,
          scaling: { base: 10, ratios: { power: 0.7, agility: 0.3 } },
          cooldown: 1,
          tags: ['attack'],
        },
      ],
    },
    rewardRule: { baseExp: 60, expPerLevel: 10, baseSilver: 45, silverPerLevel: 8 },
  },
  {
    id: 2,
    name: '腾讯雪原',
    enemy: {
      id: 'stage-2-enemy',
      name: '雪域武僧',
      level: 5,
      attributes: { power: 95, skill: 80, vitality: 120, agility: 70 },
      skills: [
        {
          id: 'staff-spin',
          name: '寒铁棍势',
          level: 3,
          scaling: { base: 16, ratios: { power: 1.0, vitality: 0.2 } },
          cooldown: 2,
          tags: ['attack', 'control'],
        },
      ],
    },
    rewardRule: { baseExp: 110, expPerLevel: 14, baseSilver: 80, silverPerLevel: 12 },
  },
  {
    id: 3,
    name: '灵境幻塔',
    enemy: {
      id: 'stage-3-enemy',
      name: '幻境剑魂',
      level: 10,
      attributes: { power: 150, skill: 140, vitality: 180, agility: 120 },
      skills: [
        {
          id: 'sword-flare',
          name: '光羽剑阵',
          level: 5,
          scaling: { base: 28, ratios: { power: 1.3, skill: 0.6 } },
          cooldown: 3,
          tags: ['attack', 'burst'],
        },
      ],
    },
    rewardRule: { baseExp: 180, expPerLevel: 20, baseSilver: 130, silverPerLevel: 18 },
  },
];

function createHeroState(name: string): HeroState {
  const base = createNewHero(name);
  return {
    ...base,
    lastLoginAt: Date.now(),
    offlineExp: 0,
    silver: 0,
  };
}

function asHero(hero: HeroState): Hero {
  const { lastLoginAt: _lastLoginAt, offlineExp: _offlineExp, silver: _silver, ...core } = hero;
  return core;
}

function instantiateEnemy(stage: Stage): Hero {
  return {
    id: stage.enemy.id,
    name: stage.enemy.name,
    level: stage.enemy.level,
    exp: 0,
    attributes: stage.enemy.attributes,
    skills: stage.enemy.skills,
  };
}

function settleExperience(heroState: HeroState, gainedExp: number): HeroState {
  let heroCore: Hero = {
    id: heroState.id,
    name: heroState.name,
    level: heroState.level,
    exp: heroState.exp + gainedExp,
    attributes: heroState.attributes,
    skills: heroState.skills,
  };

  while (true) {
    const requirement = experienceRequiredForLevel(heroCore.level);
    if (!requirement || heroCore.exp < requirement) {
      break;
    }
    heroCore.exp -= requirement;
    heroCore = { ...applyLevelGain(heroCore, 1), exp: heroCore.exp };
  }

  return {
    ...heroState,
    ...heroCore,
  };
}

function computeStageRewards(stage: Stage, heroLevel: number) {
  const exp = stage.rewardRule.baseExp + stage.rewardRule.expPerLevel * Math.max(1, heroLevel);
  const silver = stage.rewardRule.baseSilver + stage.rewardRule.silverPerLevel * Math.max(1, heroLevel);
  return { exp, silver };
}

const STORAGE_KEY = 'lingjing-idle:game-state';
const STORAGE_VERSION = 2;

type StoredState = Pick<GameState, 'hero' | 'battles'>;

export const useGameStore = create<GameState>()(
  persist<GameState, [], [], StoredState>(
    (set, get) => ({
      hero: createHeroState('新晋少侠'),
      battles: [],
      stages: DEFAULT_STAGES,
      initialize: (nickname = '新晋少侠') => {
        set({ hero: createHeroState(nickname), battles: [] });
      },
      runBattle: (stageId) => {
        const state = get();
        const stage = state.stages.find((s) => s.id === stageId);
        if (!stage) {
          throw new Error(`Stage ${stageId} not found`);
        }
        const seed = Date.now();
        const record = simulateBattle(asHero(state.hero), instantiateEnemy(stage), seed);
        const rewards = computeStageRewards(stage, state.hero.level);
        const heroAfterExperience =
          record.outcome === 'hero'
            ? settleExperience(state.hero, rewards.exp + state.hero.offlineExp)
            : { ...state.hero, offlineExp: state.hero.offlineExp };
        const heroWithSilver =
          record.outcome === 'hero'
            ? { ...heroAfterExperience, silver: heroAfterExperience.silver + rewards.silver, offlineExp: 0 }
            : heroAfterExperience;
        set({
          hero: {
            ...heroWithSilver,
            lastLoginAt: Date.now(),
          },
          battles: [record, ...state.battles].slice(0, 20),
        });
        return record;
      },
      grantOffline: () => {
        const state = get();
        const elapsed = Date.now() - state.hero.lastLoginAt;
        const result = grantOfflineRewards(asHero(state.hero), elapsed);
        set({
          hero: {
            ...state.hero,
            lastLoginAt: Date.now(),
            offlineExp: state.hero.offlineExp + result.expGain,
            silver: state.hero.silver + result.silverGain,
          },
        });
        return result;
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage<StoredState>(() => createStateStorage()),
      migrate: async (persistedState, version) => {
        if (!persistedState || (version ?? 0) >= STORAGE_VERSION) {
          return persistedState as StoredState;
        }
        return {
          hero: createHeroState('新晋少侠'),
          battles: [],
        } satisfies StoredState;
      },
      partialize: (state) => ({
        hero: state.hero,
        battles: state.battles,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hero.lastLoginAt = Date.now();
        }
      },
    },
  ),
);
