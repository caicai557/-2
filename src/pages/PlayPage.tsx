import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../state/gameStore';

export default function PlayPage() {
  const navigate = useNavigate();
  const hero = useGameStore((state) => state.hero);
  const stages = useGameStore((state) => state.stages);

  const power = useMemo(
    () => Object.values(hero.attributes).reduce((sum, value) => sum + value, 0),
    [hero.attributes],
  );

  return (
    <section className="space-y-6 min-h-screen p-4 -m-4 bg-slate-900 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/assets/battle-bg-dojo.png')" }}
      aria-labelledby="play-title">
      <header className="space-y-2 relative z-10 p-4 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10">
        <h2 id="play-title" className="font-display text-2xl text-amber-400 drop-shadow-md">
          养成与乐斗
        </h2>
        <p className="text-sm text-slate-200">管理你的四维属性、被动神技，并选择关卡进行异步战斗。</p>
      </header>

      <article className="relative grid gap-4 p-6">
        {/* Wooden Frame Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            borderImage: "url('/assets/ui-frame-wood.png') 30 fill / 30px stretch",
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
          }}
        />

        <header className="relative z-10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-amber-100 drop-shadow">{hero.name}</h3>
          <span className="text-sm font-bold text-amber-400">等级 Lv.{hero.level}</span>
        </header>
        <dl className="relative z-10 grid gap-2 sm:grid-cols-2">
          {Object.entries(hero.attributes).map(([key, value]) => (
            <div key={key} className="flex items-baseline justify-between rounded border border-amber-900/50 bg-black/40 px-3 py-2 shadow-inner">
              <dt className="text-xs uppercase tracking-wide text-amber-200/70">{key}</dt>
              <dd className="text-sm font-bold text-amber-100">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="relative z-10 rounded border border-sky-500/30 bg-sky-900/40 px-3 py-2 text-sm text-sky-200 font-medium shadow-sm">
          综合战力：{power}
        </div>
        <div className="relative z-10 rounded border border-yellow-500/30 bg-yellow-900/40 px-3 py-2 text-sm text-yellow-200 font-medium shadow-sm">
          银两储备：{hero.silver}
        </div>
      </article>

      <section className="space-y-3 relative z-10">
        <h3 className="text-sm font-bold text-white drop-shadow-md px-2">可挑战关卡</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {stages.map((stage) => {
            const rewardsExp = stage.rewardRule.baseExp + stage.rewardRule.expPerLevel * Math.max(1, hero.level);
            const rewardsSilver = stage.rewardRule.baseSilver + stage.rewardRule.silverPerLevel * Math.max(1, hero.level);

            return (
              <li key={stage.id} className="relative space-y-2 p-5 transition-transform hover:scale-[1.02]">
                {/* Wooden Frame Background for Cards */}
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    borderImage: "url('/assets/ui-frame-wood.png') 30 fill / 30px stretch",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                  }}
                />

                <header className="relative z-10 flex items-center justify-between">
                  <h4 className="text-base font-bold text-amber-100">{stage.name}</h4>
                  <span className="text-xs font-bold text-red-300 bg-black/40 px-2 py-0.5 rounded">Lv.{stage.enemy.level}</span>
                </header>
                <p className="relative z-10 text-xs text-amber-200/80">敌方：{stage.enemy.name}</p>
                <p className="relative z-10 text-xs text-amber-200/80">奖励：经验 {rewardsExp} / 银两 {rewardsSilver}</p>
                <button
                  type="button"
                  className="relative z-10 w-full rounded bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:from-emerald-500 hover:to-emerald-400 active:scale-95 border border-emerald-400/50"
                  onClick={() => navigate(`/battle/${stage.id}`)}
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
