import React from 'react';
import { ActiveTab } from '../../types';
import { Plus, Sun, Moon, Flame, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewDefect: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  openIssuesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenNewDefect,
  isDarkMode,
  onToggleDarkMode,
  openIssuesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#09262b]/95 backdrop-blur-md border-b border-[#1b535c] shadow-industrial">
      {/* Top industrial safety signal hairline */}
      <div className="h-0.5 w-full bg-[#1b535c]" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-6 h-20">
          {/* Zone 1: Brand with UMK Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('DASHBOARD')}
              className="group text-left flex items-center gap-3.5 transition-all"
            >
              <img
                src="/assets/aistudio/Logo_UMK_5145ab7c.png"
                alt="UZMETKOMBINAT"
                className="h-11 w-auto object-contain drop-shadow-[0_2px_10px_rgba(255,121,0,0.35)] group-hover:scale-105 transition-transform shrink-0"
              />

              <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-wider text-[#cbd5e1] font-mono uppercase">
                    FireSafety Control
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#334155]/60 text-white border border-[#64748b]/50 font-mono">
                    DISPATCH 24/7
                  </span>
                </div>
                <span className="text-[11px] font-medium text-[#E9EDF2]/75 tracking-normal">
                  Ёнғин хавфсизлиги маркази
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links in Deep Teal #0f3b42 */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 bg-[#082428] rounded-xl border border-[#1b535c] shadow-inner">
            <button
              type="button"
              onClick={() => onTabChange('DASHBOARD')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 tracking-wide ${
                activeTab === 'DASHBOARD'
                  ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                  : 'text-[#E9EDF2]/80 hover:text-white hover:bg-[#0f3b42]'
              }`}
            >
              Раҳбарият Dashboard
            </button>

            <button
              type="button"
              onClick={() => onTabChange('INSPECTOR')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 tracking-wide ${
                activeTab === 'INSPECTOR'
                  ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                  : 'text-[#E9EDF2]/80 hover:text-white hover:bg-[#0f3b42]'
              }`}
            >
              Инспектор саҳифаси
            </button>

            <button
              type="button"
              onClick={() => onTabChange('REGISTRY')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 tracking-wide ${
                activeTab === 'REGISTRY'
                  ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                  : 'text-[#E9EDF2]/80 hover:text-white hover:bg-[#0f3b42]'
              }`}
            >
              Камчиликлар реестри
              {openIssuesCount > 0 && (
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-black ${
                  activeTab === 'REGISTRY' 
                    ? 'bg-[#1e293b] text-white border border-white/20' 
                    : 'bg-[#E52535] text-white'
                }`}>
                  {openIssuesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onTabChange('SUPERVISOR')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap shrink-0 tracking-wide ${
                activeTab === 'SUPERVISOR'
                  ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                  : 'text-[#E9EDF2]/80 hover:text-white hover:bg-[#0f3b42]'
              }`}
            >
              Цех масъули
            </button>
          </nav>

          {/* Zone 3: Primary action + Utilities */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2.5 text-[#E9EDF2]/70 hover:text-white rounded-xl bg-[#0f3b42] hover:bg-[#154c55] border border-[#1b535c] transition-colors shadow-sm"
              title={isDarkMode ? 'Ёруғ режимга ўтиш' : 'Тунги режимга ўтиш'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-[#e2e8f0]" /> : <Moon className="w-4 h-4 text-[#E9EDF2]" />}
            </button>

            <button
              type="button"
              onClick={onOpenNewDefect}
              className="px-5 py-2.5 text-xs font-black text-white bg-[#475569] hover:bg-[#334155] border border-[#64748b] rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Камчилик киритиш</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row (under 1024px) */}
        <div className="lg:hidden flex items-center justify-between gap-1.5 py-2.5 border-t border-[#1b535c] overflow-x-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => onTabChange('DASHBOARD')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'DASHBOARD' ? 'bg-[#475569] text-white border border-[#64748b]' : 'text-[#E9EDF2]/70'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onTabChange('INSPECTOR')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'INSPECTOR' ? 'bg-[#475569] text-white border border-[#64748b]' : 'text-[#E9EDF2]/70'
            }`}
          >
            Инспектор
          </button>
          <button
            type="button"
            onClick={() => onTabChange('REGISTRY')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'REGISTRY' ? 'bg-[#475569] text-white border border-[#64748b]' : 'text-[#E9EDF2]/70'
            }`}
          >
            Реестр ({openIssuesCount})
          </button>
          <button
            type="button"
            onClick={() => onTabChange('SUPERVISOR')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'SUPERVISOR' ? 'bg-[#475569] text-white border border-[#64748b]' : 'text-[#E9EDF2]/70'
            }`}
          >
            Цех масъули
          </button>
        </div>
      </div>
    </header>
  );
};
