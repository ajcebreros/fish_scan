import { Fish, History, Compass, Home } from 'lucide-react';
import type { Screen } from '@/types';

interface BottomNavProps {
  current: Screen;
  onNavigate: (screen: Screen) => void;
}

const NAV_ITEMS: { screen: Screen; label: string; icon: typeof Home }[] = [
  { screen: 'home', label: 'Home', icon: Home },
  { screen: 'explorer', label: 'Explore', icon: Compass },
  { screen: 'history', label: 'History', icon: History },
];

export function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(({ screen, label, icon: Icon }) => {
          const active = current === screen;
          return (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 transition-all"
            >
              <Icon
                size={22}
                className={
                  active
                    ? 'text-teal-600'
                    : 'text-slate-400'
                }
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium ${
                  active ? 'text-teal-600' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function AppHeader({ title, onHome }: { title: string; onHome?: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-200/60">
      <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-sm">
            <Fish size={18} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-tight">
            FishLens<span className="text-teal-600"> AI</span>
          </span>
        </div>
        {onHome && (
          <button
            onClick={onHome}
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Home
          </button>
        )}
      </div>
    </header>
  );
}
