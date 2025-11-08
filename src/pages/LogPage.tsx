import { useGameStore } from '../state/gameStore';

export default function LogPage() {
  const battles = useGameStore((state) => state.battles);

  if (battles.length === 0) {
    return <p className="text-sm text-slate-400">暂时没有战斗记录，先去乐斗一场吧。</p>;
  }

  return (
    <section className="space-y-4" aria-labelledby="log-title">
      <h2 id="log-title" className="font-display text-2xl">
        战斗日志
      </h2>
      <ul className="space-y-3">
        {battles.map((record, index) => {
          const outcomeLabel = record.outcome === 'hero' ? '胜利' : '败北';
          const outcomeClass = record.outcome === 'hero' ? 'text-emerald-300' : 'text-rose-300';
          const lastLog = record.turns[record.turns.length - 1];

          return (
            <li
              key={`${record.seed}-${index}`}
              className="rounded border border-white/10 bg-black/30 p-4 text-sm"
            >
              <header className="flex flex-wrap items-center justify-between gap-2">
                <span className={outcomeClass}>{outcomeLabel}</span>
                <time className="text-xs text-slate-400">{new Date(record.timestamp).toLocaleString()}</time>
              </header>
              <p className="text-xs text-slate-300">
                我方剩余血量：{record.hero.remainingHp} / {record.hero.maxHp} · 敌方剩余血量：{record.enemy.remainingHp}
              </p>
              <p className="text-xs text-slate-300">回合数：{record.turns.length}</p>
              {lastLog ? <p className="mt-2 text-xs text-slate-400">最后一击：{lastLog.description}</p> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
