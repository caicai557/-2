import { NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';

import DevToolsPage from './pages/DevToolsPage';
import HomePage from './pages/HomePage';
import LogPage from './pages/LogPage';
import PlayPage from './pages/PlayPage';
import BattlePage from './pages/BattlePage';
import RankPage from './pages/RankPage';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'}`;

function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-xl sm:text-2xl">灵境续写：轻量武侠放置</h1>
            <p className="text-xs text-slate-400 sm:text-sm">腾讯企鹅江湖 · 放置修行 · 异步乐斗</p>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="主导航">
            <NavLink to="/" className={navLinkClass} end>
              首頁
            </NavLink>
            <NavLink to="/play" className={navLinkClass}>
              养成&战斗
            </NavLink>
            <NavLink to="/log" className={navLinkClass}>
              战斗日志
            </NavLink>
            <NavLink to="/rank" className={navLinkClass}>
              排行榜
            </NavLink>
            <NavLink to="/dev" className={navLinkClass}>
              调试
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        灵境续写：精神续作原型 · Vite + React + Tailwind + Zustand
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="play" element={<PlayPage />} />
          <Route path="battle/:stageId" element={<BattlePage />} />
          <Route path="log" element={<LogPage />} />
          <Route path="rank" element={<RankPage />} />
          <Route path="dev" element={<DevToolsPage />} />
        </Route>
      </Routes>
    </MotionConfig>
  );
}
