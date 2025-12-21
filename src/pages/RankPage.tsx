// TODO: Replace mock data with real backend API integration
// Future: Connect to server leaderboard and friend sparring system
// See PRD v1.2 for backend integration plan (Node/Express + SQLite)
interface RankEntry {
  nickname: string;
  level: number;
  power: number;
}

const MOCK_RANKS: RankEntry[] = [
  { nickname: '少侠001', level: 18, power: 6400 },
  { nickname: '企鹅盟主', level: 16, power: 5900 },
  { nickname: '灵境行者', level: 15, power: 5400 },
  { nickname: '你', level: 14, power: 5100 },
];

export default function RankPage() {
  return (
    <section className="space-y-4" aria-labelledby="rank-title">
      <h2 id="rank-title" className="font-display text-2xl">
        本地排行榜
      </h2>
      <p className="text-sm text-slate-300">
        首版使用本地假数据模拟。上线后可对接服务端排行榜与好友切磋。
      </p>
      <ol className="space-y-2">
        {MOCK_RANKS.map((entry, index) => (
          <li
            key={entry.nickname}
            className="flex items-center justify-between rounded border border-white/10 bg-black/30 px-4 py-3 text-sm"
          >
            <div>
              <span className="mr-2 text-xs text-slate-400">#{index + 1}</span>
              <span className="font-semibold text-slate-100">{entry.nickname}</span>
            </div>
            <div className="text-xs text-slate-400">Lv.{entry.level} · 战力 {entry.power}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
