import { useGameStore } from '../state/gameStore';

export default function DevToolsPage() {
  const hero = useGameStore((state) => state.hero);
  const battles = useGameStore((state) => state.battles);

  return (
    <section className="space-y-4" aria-labelledby="dev-title">
      <h2 id="dev-title" className="font-display text-2xl">
        调试工具
      </h2>
      <p className="text-sm text-slate-300">
        开发期快速查看当前持久化数据。未来可以扩展 GM 指令、导出存档等能力。
      </p>
      <div className="space-y-2 rounded border border-white/10 bg-black/30 p-4">
        <h3 className="text-sm font-semibold text-slate-200">侠客数据</h3>
        <pre className="overflow-auto rounded bg-black/60 p-3 text-xs text-slate-300">
{JSON.stringify(hero, null, 2)}
        </pre>
      </div>
      <div className="space-y-2 rounded border border-white/10 bg-black/30 p-4">
        <h3 className="text-sm font-semibold text-slate-200">战斗记录</h3>
        <pre className="overflow-auto rounded bg-black/60 p-3 text-xs text-slate-300">
{JSON.stringify(battles, null, 2)}
        </pre>
      </div>
    </section>
  );
}
