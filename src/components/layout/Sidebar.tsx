import React from 'react';
import { ActiveTab, Language, EmployeeUser } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  AlertOctagon, 
  CheckSquare, 
  BookOpen, 
  Building2, 
  ShieldAlert, 
  FileText, 
  Plus, 
  X,
  PhoneCall,
  HardHat,
  Sliders
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewInspection: () => void;
  openIssuesCount: number;
  myAssignedCount?: number;
  currentUser: EmployeeUser;
  language: Language;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewInspection,
  openIssuesCount,
  myAssignedCount = 0,
  currentUser,
  language,
  mobileOpen,
  onCloseMobile,
}) => {
  const t = TRANSLATIONS[language];

  // Configure navigation items based on current role permissions
  const allNavItems = [
    {
      id: 'DASHBOARD' as ActiveTab,
      labelUz: 'Раҳбарият Dashboard',
      labelRu: 'Панель руководства',
      icon: LayoutDashboard,
      badge: null,
      visible: true,
    },
    {
      id: 'INSPECTIONS' as ActiveTab,
      labelUz: 'Текширувлар (Актлар)',
      labelRu: 'Проверки (Акты)',
      icon: ClipboardCheck,
      badge: null,
      visible: currentUser.role !== 'RESPONSIBLE_EMPLOYEE',
    },
    {
      id: 'REGISTRY' as ActiveTab,
      labelUz: 'Камчиликлар реестри',
      labelRu: 'Реестр замечаний',
      icon: AlertOctagon,
      badge: openIssuesCount > 0 ? openIssuesCount : null,
      badgeColor: 'bg-[#ef4444]/20 text-[#f87171] border border-[#ef4444]/30',
      visible: true,
    },
    {
      id: 'MY_TASKS' as ActiveTab,
      labelUz: 'Менинг вазифаларим',
      labelRu: 'Мои задачи',
      icon: CheckSquare,
      badge: myAssignedCount > 0 ? myAssignedCount : null,
      badgeColor: 'bg-[#334155] text-white border border-[#64748b]/50',
      visible: currentUser.role === 'RESPONSIBLE_EMPLOYEE' || currentUser.role === 'WORKSHOP_HEAD' || currentUser.role === 'ADMIN',
    },
    {
      id: 'CATALOG' as ActiveTab,
      labelUz: 'Камчиликлар каталоги (115+)',
      labelRu: 'Каталог нарушений (115+)',
      icon: BookOpen,
      badge: '115',
      badgeColor: 'bg-[#0f3b42] text-[#E9EDF2]/80 border border-[#1b535c]',
      visible: true,
    },
    {
      id: 'WORKSHOPS_EMPLOYEES' as ActiveTab,
      labelUz: 'Цехлар ва ходимлар',
      labelRu: 'Цеха и персонал',
      icon: Building2,
      badge: null,
      visible: currentUser.role === 'ADMIN',
    },
    {
      id: 'AUDIT_LOGS' as ActiveTab,
      labelUz: 'Тизим аудит журнали',
      labelRu: 'Журнал аудита',
      icon: ShieldAlert,
      badge: null,
      visible: currentUser.role === 'ADMIN' || currentUser.role === 'EXECUTIVE' || currentUser.role === 'INSPECTOR',
    },
    {
      id: 'REPORTS' as ActiveTab,
      labelUz: 'Ҳисоботлар ва PDF',
      labelRu: 'Отчеты и PDF',
      icon: FileText,
      badge: null,
      visible: true,
    },
  ];

  const visibleNavItems = allNavItems.filter((i) => i.visible);

  const handleSelectTab = (tab: ActiveTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0a272c] text-white select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1b535c] bg-[#071f23]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Logo_UMK_5145ab7c.png"
              alt="UZMETKOMBINAT"
              className="h-10 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-[#cbd5e1] font-mono uppercase">
                  ATD FireSafety
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#334155]/60 text-white border border-[#64748b]/50 font-mono">
                  24/7
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[#E9EDF2]/80 mt-0.5">
                {language === 'UZ' ? 'Ёнғин назорати тизими' : 'Контроль безопасности'}
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-[#E9EDF2]/70 hover:text-white rounded-lg hover:bg-[#154c55] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enterprise Plant Ribbon */}
        <div className="mt-3 pt-2.5 border-t border-[#1b535c]/60 flex items-center justify-between text-[10px] text-[#E9EDF2]/70 font-mono">
          <span className="font-bold text-white tracking-wide">«ЎЗМЕТКОМБИНАТ» АЖ</span>
          <span className="text-[#E9EDF2]/70 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block"></span>
            SQLite ON
          </span>
        </div>
      </div>

      {/* Primary Action Button (Depends on Role) */}
      {(currentUser.role === 'INSPECTOR' || currentUser.role === 'ADMIN') && (
        <div className="px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={() => {
              onOpenNewInspection();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#475569] hover:bg-[#334155] text-white border border-[#64748b] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{language === 'UZ' ? 'Янги текширув (FS)' : 'Новая проверка'}</span>
          </button>
        </div>
      )}

      {currentUser.role === 'RESPONSIBLE_EMPLOYEE' && (
        <div className="px-4 pt-4 pb-2">
          <button
            type="button"
            onClick={() => handleSelectTab('MY_TASKS')}
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#475569] hover:bg-[#334155] text-white border border-[#64748b] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'UZ' ? 'Менинг вазифаларим' : 'Мои задачи'} ({myAssignedCount})</span>
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 py-1.5 text-[10px] font-black text-[#E9EDF2]/50 uppercase tracking-widest font-mono">
          {language === 'UZ' ? 'Асосий бўлимлар' : 'Основные модули'}
        </div>

        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const label = language === 'UZ' ? item.labelUz : item.labelRu;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                isActive
                  ? 'bg-[#475569] text-white shadow-md border border-[#64748b] font-black'
                  : 'text-[#E9EDF2]/80 hover:text-white hover:bg-[#0f3b42] border border-transparent hover:border-[#1b535c]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#1e293b]/70 text-white'
                      : 'bg-[#071f23]/70 text-[#94a3b8] group-hover:text-white group-hover:bg-[#154c55]'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span className="tracking-wide truncate">{label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                    isActive
                      ? 'bg-[#1e293b] text-white border border-white/20'
                      : item.badgeColor || 'bg-[#154c55] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Dispatch / Quick Info Card */}
      <div className="p-3.5 border-t border-[#1b535c] bg-[#071f23]/90 mt-auto">
        <div className="p-2.5 rounded-xl bg-[#0b2e34] border border-[#1b535c] space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#cbd5e1]">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{language === 'UZ' ? 'Тезкор диспетчер' : 'Оперативный диспетчер'}</span>
          </div>
          <div className="text-xs font-mono font-black text-white flex items-center justify-between">
            <span>101 / 214-01-01</span>
            <span className="text-[10px] text-[#10b981] font-sans font-bold">24 соат</span>
          </div>
          <div className="text-[10px] text-[#E9EDF2]/60 pt-1 border-t border-[#1b535c]/50 flex items-center justify-between font-mono">
            <span>ГОСТ 12.4.009</span>
            <span>ШНК 2.01.02</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-[#1b535c] sticky top-0 h-screen z-30 shadow-industrial">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
