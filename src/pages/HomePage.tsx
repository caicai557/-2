import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGameStore } from '../state/gameStore';

export default function HomePage() {
  const initialize = useGameStore((state) => state.initialize);
  const hero = useGameStore((state) => state.hero);
  const [nickname, setNickname] = useState(hero.name);
  const navigate = useNavigate();

  const handleStart = () => {
    initialize(nickname.trim() || '新晋少侠');
    navigate('/play');
  };

  return (
    <section className="space-y-6" aria-labelledby="home-title">
      <header className="space-y-2">
        <h2 id="home-title" className="font-display text-2xl">
          欢迎踏入灵境企鹅武林
        </h2>
        <p className="text-sm text-slate-300">
          3 分钟上手的武侠放置体验：属性养成 → 异步战斗 → 获得奖励 → 解锁神技。
        </p>
      </header>
      <div className="grid gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
        <label className="text-sm" htmlFor="nickname">
          江湖名号
        </label>
        <input
          id="nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          className="rounded border border-white/20 bg-black/40 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
          placeholder="输入你的外号"
        />
        <button
          type="button"
          className="rounded bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          onClick={handleStart}
        >
          开始修行
        </button>
      </div>
      <section className="space-y-2">
        <h3 className="font-semibold text-sm text-slate-200">核心循环</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>养成四维与被动神技，打造企鹅门派招式</li>
          <li>异步乐斗自动出击，离线闭关也能累积修为</li>
          <li>回放战斗，向本地好友排行冲刺</li>
        </ul>
      </section>
    </section>
  );
}
