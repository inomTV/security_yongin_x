import React from 'react';
import { ActiveTab, Language } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { 
  Menu, 
  Sun, 
  Moon, 
  RotateCcw, 
  Languages, 
  Bell,
  ChevronRight
} from 'lucide-react';

interface TopBarProps {
  activeTab: ActiveTab;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetData: () => void;
  onOpenMobileSidebar: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  language,
  onLanguageChange,
  isDarkMode,
  onToggleDarkMode,
  onResetData,
  onOpenMobileSidebar,
  unreadNotificationsCount = 0,
  onOpenNotifications,
}) => {
  const t = TRANSLATIONS[language];

  const getTabLabel = (tab: ActiveTab) => {
    switch (tab) {
      case 'DASHBOARD':
        return language === 'UZ' ? 'Раҳбарият Dashboard' : 'Панель руководства';
      case 'INSPECTIONS':
        return language === 'UZ' ? 'Текширувлар (Далолатномалар)' : 'Проверки (Акты)';
      case 'REGISTRY':
        return language === 'UZ' ? 'Камчиликлар реестри' : 'Реестр замечаний';
      case 'MY_TASKS':
        return language === 'UZ' ? 'Менинг вазифаларим (Ижро)' : 'Мои задачи (Исполнение)';
      case 'CATALOG':
        return language === 'UZ' ? 'Камчиликлар каталоги (100+)' : 'Каталог нарушений (100+)';
      case 'WORKSHOPS_EMPLOYEES':
        return language === 'UZ' ? 'Цехлар ва ходимлар бошқаруви' : 'Цеха и персонал';
      case 'AUDIT_LOGS':
        return language === 'UZ' ? 'Тизим аудит журнали' : 'Системный журнал аудита';
      case 'REPORTS':
        return language === 'UZ' ? 'Ҳисоботлар ва PDF Экспорт' : 'Отчеты и экспорт';
      case 'INSPECTOR':
        return t.navInspector;
      case 'SUPERVISOR':
        return t.navSupervisor;
      case 'SETTINGS':
        return t.navSettings;
      default:
        return '';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[#0a272c]/95 backdrop-blur-md border-b border-[#1b535c] shadow-industrial select-none">
      {/* Clean hairline accent */}
      <div className="h-0.5 w-full bg-[#1b535c]" />

      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left side: Mobile menu toggle & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-[#0f3b42] text-white hover:bg-[#154c55] border border-[#1b535c] transition-colors"
            title="Меню"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="hidden sm:inline font-bold text-[#E9EDF2]/60 uppercase tracking-wider font-mono">
              «ЎЗМЕТКОМБИНАТ» АЖ
            </span>
            <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-[#1b535c]" />
            <span className="font-black text-white text-sm sm:text-base tracking-wide">
              {getTabLabel(activeTab)}
            </span>
          </div>
        </div>

        {/* Right side: Notifications, Language Switcher (Top Right!), Reset, Dark Mode */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Bell */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-[#0f3b42] hover:bg-[#154c55] text-[#E9EDF2] border border-[#1b535c] transition-all cursor-pointer"
              title={language === 'UZ' ? 'Хабарномалар' : 'Уведомления'}
            >
              <Bell className="w-4 h-4 text-[#cbd5e1]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-black text-white font-mono">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Quick reset data button */}
          <button
            type="button"
            onClick={onResetData}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0f3b42] hover:bg-[#154c55] text-[#E9EDF2] hover:text-white border border-[#1b535c] text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title={t.refreshData}
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#cbd5e1]" />
            <span className="hidden xl:inline">{t.refreshData}</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 text-[#E9EDF2]/75 hover:text-white rounded-xl bg-[#0f3b42] hover:bg-[#154c55] border border-[#1b535c] transition-colors cursor-pointer"
            title={isDarkMode ? 'Ёруғ режим' : 'Тунги режим'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#e2e8f0]" /> : <Moon className="w-4 h-4 text-[#E9EDF2]" />}
          </button>

          {/* LANGUAGE SWITCHER BUTTON - Prominently placed at TOP RIGHT */}
          <div className="flex items-center p-1 rounded-xl bg-[#071f23] border border-[#1b535c] shadow-inner">
            <div className="px-1.5 text-[#cbd5e1] hidden sm:flex items-center">
              <Languages className="w-4 h-4" />
            </div>

            <button
              type="button"
              onClick={() => onLanguageChange('UZ')}
              className={`px-2.5 py-1 text-xs font-mono font-black rounded-lg transition-all cursor-pointer ${
                language === 'UZ'
                  ? 'bg-[#475569] text-white shadow-sm border border-[#64748b]'
                  : 'text-[#E9EDF2]/70 hover:text-white hover:bg-[#0f3b42]'
              }`}
              title="Ўзбек тилида кўриш"
            >
              ЎЗБ
            </button>

            <button
              type="button"
              onClick={() => onLanguageChange('RU')}
              className={`px-2.5 py-1 text-xs font-mono font-black rounded-lg transition-all cursor-pointer ${
                language === 'RU'
                  ? 'bg-[#475569] text-white shadow-sm border border-[#64748b]'
                  : 'text-[#E9EDF2]/70 hover:text-white hover:bg-[#0f3b42]'
              }`}
              title="На русском языке"
            >
              РУС
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
