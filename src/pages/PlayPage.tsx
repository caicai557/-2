import { useMemo } from 'react';

import { useGameStore } from '../state/gameStore';

export default function PlayPage() {
  const hero = useGameStore((state) => state.hero);
  const stages = useGameStore((state) => state.stages);
  const runBattle = useGameStore((state) => state.runBattle);

  const power = useMemo(
    () => Object.values(hero.attributes).reduce((sum, value) => sum + value, 0),
    [hero.attributes],
  );

  return (
    <section className="space-y-6" aria-labelledby="play-title">
      <header className="space-y-2">
        <h2 id="play-title" className="font-display text-2xl">
          养成与乐斗
        </h2>
        <p className="text-sm text-slate-300">管理你的四维属性、被动神技，并选择关卡进行异步战斗。</p>
      </header>

      <article className="grid gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{hero.name}</h3>
          <span className="text-sm text-slate-300">等级 Lv.{hero.level}</span>
        </header>
        <dl className="grid gap-2 sm:grid-cols-2">
          {Object.entries(hero.attributes).map(([key, value]) => (
            <div key={key} className="flex items-baseline justify-between rounded border border-white/10 bg-black/30 px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-slate-400">{key}</dt>
              <dd className="text-sm font-semibold text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="rounded border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-200">
          综合战力：{power}
        </div>
        <div className="rounded border border-amber-400/40 bg-amber-300/10 px-3 py-2 text-sm text-amber-200">
          银两储备：{hero.silver}
        </div>
      </article>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">可挑战关卡</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {stages.map((stage) => {
            const rewardsExp = stage.rewardRule.baseExp + stage.rewardRule.expPerLevel * Math.max(1, hero.level);
            const rewardsSilver = stage.rewardRule.baseSilver + stage.rewardRule.silverPerLevel * Math.max(1, hero.level);

            return (
              <li key={stage.id} className="space-y-2 rounded-lg border border-white/10 bg-black/30 p-4">
                <header className="flex items-center justify-between">
                  <h4 className="text-base font-semibold">{stage.name}</h4>
                  <span className="text-xs text-slate-400">敌方等级 Lv.{stage.enemy.level}</span>
                </header>
                <p className="text-xs text-slate-400">敌方：{stage.enemy.name}</p>
                <p className="text-xs text-slate-400">奖励：经验 {rewardsExp} / 银两 {rewardsSilver}</p>
                <button
                  type="button"
                  className="w-full rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
                  onClick={() => runBattle(stage.id)}
                >
                  发起乐斗
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}
