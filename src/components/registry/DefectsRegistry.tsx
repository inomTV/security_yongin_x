import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Eye, 
  Camera, 
  ChevronRight,
  LayoutList,
  LayoutGrid,
  FileSpreadsheet,
  AlertCircle,
  Building2,
  Calendar,
  User,
  Plus,
  Clock
} from 'lucide-react';
import { DefectItem, DefectStatus, Severity, Workshop, EmployeeUser, Language } from '../../types';
import { STATUS_CONFIG, SEVERITY_CONFIG, formatDate } from '../../utils/helpers';

interface DefectsRegistryProps {
  defects: DefectItem[];
  workshops: Workshop[];
  currentUser: EmployeeUser;
  onSelectDefect: (defect: DefectItem) => void;
  onOpenNewInspection: () => void;
  language: Language;
}

export const DefectsRegistry: React.FC<DefectsRegistryProps> = ({
  defects,
  workshops,
  currentUser,
  onSelectDefect,
  onOpenNewInspection,
  language,
}) => {
  const [activeStatusTab, setActiveStatusTab] = useState<DefectStatus | 'ALL'>('ALL');
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');

  // Filtered defects calculation
  const filteredDefects = useMemo(() => {
    return defects.filter((item) => {
      // If user is responsible employee and in registry, optionally they can view all or filtered
      if (activeStatusTab !== 'ALL' && item.status !== activeStatusTab) {
        return false;
      }
      if (selectedWorkshop !== 'ALL' && item.workshopCode !== selectedWorkshop) {
        return false;
      }
      if (selectedSeverity !== 'ALL' && (item.priority || item.severity) !== selectedSeverity) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (item.catalogTitleSnapshot || item.title || '').toLowerCase().includes(query);
        const matchId = item.id.toLowerCase().includes(query);
        const matchInspId = (item.inspectionId || '').toLowerCase().includes(query);
        const matchZone = item.zone.toLowerCase().includes(query);
        const matchResp = item.responsiblePerson.toLowerCase().includes(query);
        const matchInsp = item.inspectorName.toLowerCase().includes(query);
        if (!matchTitle && !matchId && !matchInspId && !matchZone && !matchResp && !matchInsp) {
          return false;
        }
      }
      return true;
    });
  }, [defects, activeStatusTab, selectedWorkshop, selectedSeverity, searchQuery]);

  // Status counters
  const counts = useMemo(() => {
    return {
      ALL: defects.length,
      YANGI: defects.filter((d) => d.status === 'YANGI').length,
      BIRIKTIRILGAN: defects.filter((d) => d.status === 'BIRIKTIRILGAN').length,
      BAJARILMOQDA: defects.filter((d) => d.status === 'BAJARILMOQDA').length,
      TEKSHIRUVGA_YUBORILGAN: defects.filter((d) => d.status === 'TEKSHIRUVGA_YUBORILGAN').length,
      QAYTA_ISHLASHGA_QAYTARILGAN: defects.filter((d) => d.status === 'QAYTA_ISHLASHGA_QAYTARILGAN').length,
      YOPILGAN: defects.filter((d) => d.status === 'YOPILGAN').length,
      MUDDATI_OTGAN: defects.filter((d) => d.isOverdue || d.status === 'MUDDATI_OTGAN').length,
    };
  }, [defects]);

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'Камчилик №', 'Текширув №', 'Цех', 'Участка', 'Камчилик номи',
      'Хавф даражаси', 'Мақом', 'Аниқланган сана', 'Муддат', 'Масъул шахс', 'Инспектор'
    ];
    const rows = filteredDefects.map((d) => [
      d.id,
      d.inspectionId,
      d.workshopCode,
      d.zone,
      d.catalogTitleSnapshot || d.title,
      d.priority || d.severity,
      d.status,
      d.detectedDate,
      d.deadline,
      d.responsiblePerson,
      d.inspectorName,
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Kamchiliklar_Reestri_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 sm:p-8 shadow-industrial">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#082428] border border-[#1b535c] text-[#cbd5e1] shadow-inner shrink-0">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-black text-[#cbd5e1] uppercase tracking-wider mb-1">
                <span>{language === 'UZ' ? 'Электрон назорат реестри' : 'Электронный реестр'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {language === 'UZ' ? 'Камчиликларнинг марказлашган реестри' : 'Централизованный реестр замечаний'}
              </h2>
              <p className="text-xs sm:text-sm text-[#E9EDF2]/80 mt-1 max-w-2xl">
                {language === 'UZ'
                  ? '7 та мақом (статус), муддати ўтганлик белгиси, фотодалиллар ва ижрочилар мониторинги'
                  : 'Все замечания по 7 статусам, признак просрочки, фотоотчеты и ответственные'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-[#082428] hover:bg-[#154c55] text-[#E9EDF2] hover:text-white border border-[#1b535c] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{language === 'UZ' ? 'Excel экспорт' : 'Экспорт'}</span>
            </button>

            {(currentUser.role === 'INSPECTOR' || currentUser.role === 'ADMIN') && (
              <button
                type="button"
                onClick={onOpenNewInspection}
                className="px-4 py-2.5 rounded-xl bg-[#475569] hover:bg-[#334155] text-white border border-[#64748b] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{language === 'UZ' ? 'Янги текширув' : 'Новая проверка'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 7 Statuses Tab Navigation */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-3 shadow-industrial">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setActiveStatusTab('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeStatusTab === 'ALL'
                ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            Барчаси ({counts.ALL})
          </button>

          <button
            type="button"
            onClick={() => setActiveStatusTab('BIRIKTIRILGAN')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeStatusTab === 'BIRIKTIRILGAN'
                ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            Масъулга бириктирилган ({counts.BIRIKTIRILGAN})
          </button>

          <button
            type="button"
            onClick={() => setActiveStatusTab('BAJARILMOQDA')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeStatusTab === 'BAJARILMOQDA'
                ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            Бажарилмоқда ({counts.BAJARILMOQDA})
          </button>

          <button
            type="button"
            onClick={() => setActiveStatusTab('TEKSHIRUVGA_YUBORILGAN')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeStatusTab === 'TEKSHIRUVGA_YUBORILGAN'
                ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            Текширувда ({counts.TEKSHIRUVGA_YUBORILGAN})
          </button>

          <button
            type="button"
            onClick={() => setActiveStatusTab('QAYTA_ISHLASHGA_QAYTARILGAN')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeStatusTab === 'QAYTA_ISHLASHGA_QAYTARILGAN'
                ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            Қайтарилган ({counts.QAYTA_ISHLASHGA_QAYTARILGAN})
          </button>

          <button
            type="button"
            onClick={() => setActiveStatusTab('YOPILGAN')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeStatusTab === 'YOPILGAN'
                ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            Ёпилган ({counts.YOPILGAN})
          </button>

          <button
            type="button"
            onClick={() => setActiveStatusTab('MUDDATI_OTGAN')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeStatusTab === 'MUDDATI_OTGAN'
                ? 'bg-[#ef4444] text-white font-black shadow-md'
                : 'bg-[#082428] text-[#f87171] hover:text-white border border-[#ef4444]/40'
            }`}
          >
            Муддати ўтган ({counts.MUDDATI_OTGAN})
          </button>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-4 shadow-industrial flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E9EDF2]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'UZ' ? 'Камчилик, цех ёки ID бўйича қидириш...' : 'Поиск...'}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs focus:outline-none focus:border-[#64748b]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={selectedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-bold"
          >
            <option value="ALL">Барча цехлар</option>
            {workshops.map((w) => (
              <option key={w.code} value={w.code}>{w.code} — {w.name}</option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-bold"
          >
            <option value="ALL">Барча хавф</option>
            <option value="YUQORI">Юқори</option>
            <option value="ORTA">Ўртача</option>
            <option value="PAST">Паст</option>
          </select>

          <div className="flex items-center gap-1 p-1 bg-[#082428] rounded-xl border border-[#1b535c]">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg ${viewMode === 'TABLE' ? 'bg-[#475569] text-white' : 'text-[#E9EDF2]/60'}`}
              title="Жадвал кўриниши"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`p-1.5 rounded-lg ${viewMode === 'CARDS' ? 'bg-[#475569] text-white' : 'text-[#E9EDF2]/60'}`}
              title="Карточкалар кўриниши"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Registry Table View */}
      {viewMode === 'TABLE' && (
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl overflow-hidden shadow-industrial">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#082428] border-b border-[#1b535c] text-[#E9EDF2]/80 uppercase font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">ID</th>
                  <th className="py-3.5 px-3 font-bold">Цех / Зона</th>
                  <th className="py-3.5 px-3 font-bold">Камчилик мазмуни</th>
                  <th className="py-3.5 px-3 font-bold text-center">Хавф</th>
                  <th className="py-3.5 px-3 font-bold text-center">Мақом</th>
                  <th className="py-3.5 px-3 font-bold">Муддат</th>
                  <th className="py-3.5 px-3 font-bold">Масъул шахс</th>
                  <th className="py-3.5 px-4 font-bold text-right">Амаллар</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b535c]/60 text-white">
                {filteredDefects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#E9EDF2]/60">
                      <AlertCircle className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2 opacity-60" />
                      <p className="text-sm font-bold text-white">Камчиликлар топилмади</p>
                    </td>
                  </tr>
                ) : (
                  filteredDefects.map((defect) => {
                    const statusInfo = STATUS_CONFIG[defect.status] || STATUS_CONFIG.YANGI;
                    const isOverdue = defect.isOverdue || defect.status === 'MUDDATI_OTGAN';

                    return (
                      <tr 
                        key={defect.id} 
                        onClick={() => onSelectDefect(defect)}
                        className={`hover:bg-[#12454d] transition-colors cursor-pointer ${
                          isOverdue ? 'bg-[#ef4444]/10' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-black text-xs text-[#cbd5e1] whitespace-nowrap">
                          {defect.id}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-xs text-[#E9EDF2] font-mono">
                            {defect.workshopCode}
                          </div>
                          <div className="text-[11px] text-[#E9EDF2]/75 truncate max-w-xs" title={defect.zone}>
                            {defect.zone}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 max-w-md">
                          <div className="font-bold text-xs text-white leading-snug">
                            {defect.catalogTitleSnapshot || defect.title}
                          </div>
                          <div className="text-[11px] text-[#E9EDF2]/60 truncate mt-0.5">
                            {defect.categoryNameSnapshot || defect.categoryName}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            (defect.priority || defect.severity) === 'YUQORI'
                              ? 'bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30'
                              : 'bg-[#15464f] text-[#E9EDF2] border-[#225761]'
                          }`}>
                            {defect.priority || defect.severity}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}>
                            {statusInfo.label}
                          </span>
                          {isOverdue && (
                            <div className="text-[9px] font-mono font-black text-[#ef4444] mt-0.5">
                              МУДДАТИ ЎТГАН
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 font-mono text-xs whitespace-nowrap">
                          <span className={isOverdue ? 'text-[#ef4444] font-black' : 'text-white'}>
                            {defect.deadline}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-xs text-[#E9EDF2]/90 whitespace-nowrap">
                          {defect.responsiblePerson}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDefect(defect);
                            }}
                            className="p-1.5 rounded-lg bg-[#082428] text-[#E9EDF2] hover:text-white border border-[#1b535c] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'CARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDefects.map((defect) => {
            const statusInfo = STATUS_CONFIG[defect.status] || STATUS_CONFIG.YANGI;
            const isOverdue = defect.isOverdue || defect.status === 'MUDDATI_OTGAN';

            return (
              <div
                key={defect.id}
                onClick={() => onSelectDefect(defect)}
                className={`p-5 rounded-3xl bg-[#0f3b42] border transition-all space-y-3 cursor-pointer shadow-industrial ${
                  isOverdue ? 'border-[#ef4444]/80' : 'border-[#1b535c] hover:border-[#64748b]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-white bg-[#334155]/60 px-2 py-0.5 rounded border border-[#64748b]/50">
                      {defect.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#E9EDF2] font-mono bg-[#082428] px-1.5 py-0.5 rounded border border-[#1b535c]">
                    [{defect.workshopCode}]
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-white leading-snug">
                  {defect.catalogTitleSnapshot || defect.title}
                </h4>

                <p className="text-xs text-[#E9EDF2]/75 truncate">
                  {defect.zone}
                </p>

                {defect.photoBefore && (
                  <img
                    src={defect.photoBefore}
                    alt="Defect"
                    className="w-full h-28 object-cover rounded-xl border border-[#1b535c]"
                  />
                )}

                <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#1b535c]/50 text-[#E9EDF2]/70">
                  <span>Муддат: <strong className={isOverdue ? 'text-[#ef4444]' : 'text-white'}>{defect.deadline}</strong></span>
                  <span className="text-white truncate max-w-[120px]">{defect.responsiblePerson}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
