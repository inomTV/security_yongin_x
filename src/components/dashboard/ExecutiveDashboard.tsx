import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  PieChart, 
  Repeat, 
  Printer, 
  Building2, 
  Flame, 
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  FileText
} from 'lucide-react';
import { DefectItem, Workshop } from '../../types';
import { WORKSHOPS, CATEGORY_LABELS } from '../../data/mockData';
import { STATUS_CONFIG, SEVERITY_CONFIG } from '../../utils/helpers';

interface ExecutiveDashboardProps {
  defects: DefectItem[];
  onFilterByWorkshop: (workshopCode: string) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  defects,
  onFilterByWorkshop,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');

  // KPI Calculations
  const totalCount = defects.length;
  const closedCount = defects.filter((d) => d.status === 'YOPILGAN').length;
  const inProgressCount = defects.filter((d) => d.status === 'BAJARILMOQDA' || d.status === 'BIRIKTIRILGAN' || d.status === 'YANGI' || d.status === 'IJRODA').length;
  const inReviewCount = defects.filter((d) => d.status === 'TEKSHIRUVGA_YUBORILGAN' || d.status === 'TEKSHIRUVDA').length;
  const overdueCount = defects.filter((d) => d.status === 'MUDDATI_OTGAN' || d.isOverdue).length;
  const highRiskCount = defects.filter((d) => d.priority === 'YUQORI' || d.severity === 'YUQORI').length;

  const resolutionRate = totalCount > 0 ? Math.round((closedCount / totalCount) * 100) : 100;
  const overdueRate = totalCount > 0 ? Math.round((overdueCount / totalCount) * 100) : 0;

  // Workshop-level statistics
  const workshopStats = useMemo(() => {
    return WORKSHOPS.map((workshop) => {
      const shopDefects = defects.filter((d) => d.workshopCode === workshop.code);
      const total = shopDefects.length;
      const closed = shopDefects.filter((d) => d.status === 'YOPILGAN').length;
      const overdue = shopDefects.filter((d) => d.status === 'MUDDATI_OTGAN' || d.isOverdue).length;
      const active = shopDefects.filter((d) => d.status === 'BAJARILMOQDA' || d.status === 'BIRIKTIRILGAN' || d.status === 'YANGI' || d.status === 'TEKSHIRUVGA_YUBORILGAN' || d.status === 'IJRODA' || d.status === 'TEKSHIRUVDA').length;
      const recurring = shopDefects.filter((d) => d.isRecurring).length;
      const rate = total > 0 ? Math.round((closed / total) * 100) : 100;

      // Risk score: Higher if overdue or high severity or recurring
      const highSeverity = shopDefects.filter((d) => d.priority === 'YUQORI' || d.severity === 'YUQORI').length;
      const riskScore = total === 0 ? 0 : Math.min(100, Math.round((overdue * 25 + highSeverity * 15 + recurring * 10) / Math.max(1, total) * 10));

      return {
        ...workshop,
        total,
        closed,
        overdue,
        active,
        recurring,
        rate,
        riskScore,
      };
    });
  }, [defects]);

  // Recurring defects analysis
  const recurringDefectsList = useMemo(() => {
    return defects.filter((d) => d.isRecurring).sort((a, b) => (b.recurringCount || 1) - (a.recurringCount || 1));
  }, [defects]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const counts: Record<string, { label: string; count: number; highRisk: number }> = {};
    Object.entries(CATEGORY_LABELS).forEach(([key, label]) => {
      counts[key] = { label, count: 0, highRisk: 0 };
    });

    defects.forEach((d) => {
      const catKey = d.catalogCategorySnapshot || d.category;
      if (catKey && counts[catKey]) {
        counts[catKey].count += 1;
        if (d.priority === 'YUQORI' || d.severity === 'YUQORI') counts[catKey].highRisk += 1;
      }
    });

    return Object.entries(counts).map(([key, data]) => ({
      key,
      ...data,
      percent: totalCount > 0 ? Math.round((data.count / totalCount) * 100) : 0,
    })).sort((a, b) => b.count - a.count);
  }, [defects, totalCount]);

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Executive Header Banner in Deep Teal #0f3b42 */}
      <div className="relative overflow-hidden bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-8 lg:p-9 shadow-industrial">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <img
              src="/assets/aistudio/Logo_UMK_5145ab7c.png"
              alt="UZMETKOMBINAT"
              className="h-14 w-auto object-contain shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
            />

            <div>
              <div className="flex items-center gap-2 text-xs font-black text-[#cbd5e1] uppercase tracking-widest mb-1.5 font-mono">
                <Flame className="w-4 h-4 text-[#cbd5e1]" />
                «ЎЗМЕТКОМБИНАТ» АЖ · Бошқарув ва Хавфсизлик маркази
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                Металлургия мажмуаси ёнғин хавфсизлиги мониторинги
              </h2>
              <p className="text-xs text-[#E9EDF2]/80 mt-1.5 max-w-2xl leading-relaxed">
                СПЦ, ККЦ, ЭСПЦ, ПСП, ТЭЦ, КХЦ ва РМЦ цехлари кесимида ёнғин хавфсизлиги, камчиликлар динамикаси ва ижро назорати
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 p-1.5 bg-[#082428] rounded-xl border border-[#1b535c] text-xs font-bold shadow-inner">
              <button
                type="button"
                onClick={() => setSelectedTimeframe('MONTH')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTimeframe === 'MONTH' ? 'bg-[#475569] text-white font-black shadow-sm border border-[#64748b]' : 'text-[#E9EDF2]/75 hover:text-white'
                }`}
              >
                Жорий ой
              </button>
              <button
                type="button"
                onClick={() => setSelectedTimeframe('QUARTER')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTimeframe === 'QUARTER' ? 'bg-[#475569] text-white font-black shadow-sm border border-[#64748b]' : 'text-[#E9EDF2]/75 hover:text-white'
                }`}
              >
                IV Чорак
              </button>
              <button
                type="button"
                onClick={() => setSelectedTimeframe('YEAR')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedTimeframe === 'YEAR' ? 'bg-[#475569] text-white font-black shadow-sm border border-[#64748b]' : 'text-[#E9EDF2]/75 hover:text-white'
                }`}
              >
                2026 Йил
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 text-xs font-bold text-[#E9EDF2] bg-[#0b2e34] hover:bg-[#154c55] rounded-xl border border-[#1b535c] transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Printer className="w-4 h-4 text-[#cbd5e1]" />
              Ҳисоботни чоп этиш
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip in Deep Teal #0f3b42 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Execution Rate */}
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-6 space-y-3.5 shadow-industrial">
          <div className="flex items-center justify-between text-xs text-[#E9EDF2]/70">
            <span className="font-semibold text-[11px] text-[#E9EDF2]/80 uppercase tracking-wider">Ижро этилиш кўрсаткичи</span>
            <div className="w-8 h-8 rounded-lg bg-[#082428] border border-[#1b535c] flex items-center justify-center text-[#34d399]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black font-mono tabular-nums text-white">
              {resolutionRate}%
            </span>
            <span className="text-[10px] text-[#34d399] font-mono px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/20">
              Мақсад: &gt;90%
            </span>
          </div>
          <div className="w-full bg-[#082428] h-2 rounded-full overflow-hidden border border-[#1b535c]">
            <div 
              className="bg-[#10b981] h-full rounded-full transition-all duration-500" 
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#E9EDF2]/60 font-mono pt-0.5">
            <span>Ёпилган: <strong className="text-white font-bold">{closedCount}</strong> та</span>
            <span>Жами: <strong className="text-white font-bold">{totalCount}</strong> та</span>
          </div>
        </div>

        {/* KPI 2: Overdue Defects */}
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-6 space-y-3.5 shadow-industrial">
          <div className="flex items-center justify-between text-xs text-[#E9EDF2]/70">
            <span className="font-semibold text-[11px] text-[#E9EDF2]/80 uppercase tracking-wider">Муддати ўтган камчиликлар</span>
            <div className={`w-8 h-8 rounded-lg bg-[#082428] border border-[#1b535c] flex items-center justify-center ${
              overdueCount > 0 ? 'text-[#f87171]' : 'text-[#E9EDF2]/50'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className={`text-3xl font-black font-mono tabular-nums ${
              overdueCount > 0 ? 'text-[#f87171]' : 'text-white'
            }`}>
              {overdueCount} та
            </span>
            {overdueCount > 0 && (
              <span className="text-[10px] text-[#f87171] font-mono px-2 py-0.5 rounded bg-[#ef4444]/10 border border-[#ef4444]/25">
                {overdueRate}% улуш
              </span>
            )}
          </div>
          <div className="text-xs text-[#E9EDF2]/75 leading-snug">
            {overdueCount > 0 ? (
              <span className="text-[#f87171] font-medium">
                Раҳбарият назоратидаги кечикишлар
              </span>
            ) : (
              <span className="text-[#34d399] font-medium">
                Барча муддатлар ўз вақтида
              </span>
            )}
          </div>
          <div className="pt-0.5 text-xs text-[#E9EDF2]/60 font-mono">
            Фаол ижрода: <strong className="text-white font-bold">{inProgressCount}</strong> та
          </div>
        </div>

        {/* KPI 3: High Risk Defects */}
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-6 space-y-3.5 shadow-industrial">
          <div className="flex items-center justify-between text-xs text-[#E9EDF2]/70">
            <span className="font-semibold text-[11px] text-[#E9EDF2]/80 uppercase tracking-wider">Юқори хавфли (Критик)</span>
            <div className="w-8 h-8 rounded-lg bg-[#082428] border border-[#1b535c] flex items-center justify-center text-[#cbd5e1]">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black font-mono tabular-nums text-white">
              {highRiskCount} та
            </span>
            <span className="text-[10px] text-[#E9EDF2]/70 font-mono px-2 py-0.5 rounded bg-[#0b2e34] border border-[#1b535c]">
              Тоифа A/B цехлар
            </span>
          </div>
          <div className="text-xs text-[#E9EDF2]/75 leading-snug">
            Кабель эстакадалари ва газ ускуналари
          </div>
          <div className="pt-0.5 text-xs text-[#E9EDF2]/60 font-mono">
            Текширувда турганлар: <strong className="text-white font-bold">{inReviewCount}</strong> та
          </div>
        </div>

        {/* KPI 4: Recurring Violations */}
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-6 space-y-3.5 shadow-industrial">
          <div className="flex items-center justify-between text-xs text-[#E9EDF2]/70">
            <span className="font-semibold text-[11px] text-[#E9EDF2]/80 uppercase tracking-wider">Такрорий камчиликлар</span>
            <div className="w-8 h-8 rounded-lg bg-[#082428] border border-[#1b535c] flex items-center justify-center text-[#E9EDF2]/70">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black font-mono tabular-nums text-white">
              {recurringDefectsList.length} та
            </span>
            <span className="text-[10px] text-[#E9EDF2]/70 font-mono px-2 py-0.5 rounded bg-[#0b2e34] border border-[#1b535c]">
              Такрорланиш: {Math.round((recurringDefectsList.length / Math.max(1, totalCount)) * 100)}%
            </span>
          </div>
          <div className="text-xs text-[#E9EDF2]/75 leading-snug">
            Ўт ўчириш йўлаклари ва баллонлар
          </div>
          <div className="pt-0.5 text-xs text-[#E9EDF2]/60 font-mono">
            Кўрик назоратида: <strong className="text-white font-bold">{recurringDefectsList.length}</strong> та
          </div>
        </div>
      </div>

      {/* Main Charts Grid: 1. Workshop Breakdown + 2. Recurring Violations Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Workshop Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-7 lg:p-8 space-y-6 shadow-industrial">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b535c]">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-[#cbd5e1]" />
                Цехлар кесимида камчиликлар ва ижро ҳолати диаграммаси
              </h3>
              <p className="text-xs text-[#E9EDF2]/70 mt-1">
                Ҳар бир цех блокини босиб камчиликлар реестрида саралаб кўриш мумкин
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold text-[#E9EDF2]/80">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#10b981] inline-block" /> Ёпилган
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#64748b] inline-block" /> Ижрода
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#ef4444] inline-block" /> Муддати ўтган
              </span>
            </div>
          </div>

          {/* Custom Responsive Industrial Bar Chart */}
          <div className="space-y-3.5 pt-1">
            {workshopStats.map((item) => {
              const closedWidth = item.total > 0 ? (item.closed / item.total) * 100 : 0;
              const overdueWidth = item.total > 0 ? (item.overdue / item.total) * 100 : 0;
              const activeWidth = item.total > 0 ? (item.active / item.total) * 100 : 0;

              return (
                <div
                  key={item.code}
                  onClick={() => onFilterByWorkshop(item.code)}
                  className="p-4 bg-[#082428] hover:bg-[#154c55] border border-[#1b535c] hover:border-[#64748b] rounded-xl cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2.5 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-base text-white group-hover:text-[#cbd5e1] transition-colors">
                        {item.code}
                      </span>
                      <span className="text-[#E9EDF2]/80 font-medium hidden sm:inline">
                        — {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 font-mono font-semibold">
                      <span className="text-[#E9EDF2]/70 text-xs">
                        Жами: <strong className="text-white">{item.total}</strong> та
                      </span>
                      <span className="text-[#34d399] font-black text-xs">
                        {item.rate}% ижро
                      </span>
                      {item.overdue > 0 && (
                        <span className="text-[#f87171] font-bold bg-[#ef4444]/15 px-2 py-0.5 rounded border border-[#ef4444]/30 text-xs">
                          {item.overdue} кечиккан
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Multi-segment stacked bar */}
                  <div className="w-full bg-[#0b2e34] h-3 rounded-lg overflow-hidden flex border border-[#1b535c]">
                    <div
                      style={{ width: `${closedWidth}%` }}
                      className="bg-[#10b981] h-full transition-all duration-300"
                      title={`Ёпилган: ${item.closed}`}
                    />
                    <div
                      style={{ width: `${activeWidth}%` }}
                      className="bg-[#64748b] h-full transition-all duration-300"
                      title={`Ижрода: ${item.active}`}
                    />
                    <div
                      style={{ width: `${overdueWidth}%` }}
                      className="bg-[#ef4444] h-full transition-all duration-300"
                      title={`Муддати ўтган: ${item.overdue}`}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs text-[#E9EDF2]/60">
                    <span>Цех бошлиғи: <strong className="text-[#E9EDF2]/90">{(item.manager || item.managerName || 'Масъул раҳбар').split(' ')[0]} {(item.manager || item.managerName || '').split(' ')[1] || ''}</strong></span>
                    <span>Хавф индекси: <strong className="text-white font-mono">{item.riskScore}/100</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recurring Violations Analysis */}
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-7 lg:p-8 space-y-6 shadow-industrial flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-[#1b535c]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                <Repeat className="w-5 h-5 text-[#cbd5e1]" />
                Такрорий камчиликлар таҳлили
              </h3>
              <p className="text-xs text-[#E9EDF2]/70 mt-1">
                Комбинатда энг кўп такрорланаётган тизимли қоидабузарликлар
              </p>
            </div>

            <div className="space-y-3 mt-5">
              {recurringDefectsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#E9EDF2]/60">
                  Ҳозирда такрорий камчиликлар қайд этилмаган.
                </div>
              ) : (
                recurringDefectsList.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-[#082428] border border-[#1b535c] hover:border-[#64748b] rounded-xl space-y-2 transition-colors shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#cbd5e1]">{rec.id}</span>
                      <span className="px-2.5 py-0.5 rounded font-mono text-[11px] bg-[#334155]/60 text-white border border-[#64748b]/50 font-bold">
                        {rec.recurringCount} марта қайталанган
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                      {rec.title}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-[#E9EDF2]/70 pt-1.5 border-t border-[#1b535c]">
                      <span>Цех: <strong className="text-white font-mono">{rec.workshopCode}</strong></span>
                      <span className="text-[#f87171] font-bold">Кўрсатма берилган</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Systemic Recommendation for Leadership */}
          <div className="p-4 bg-[#082428] border-l-4 border-[#64748b] rounded-r-xl text-xs space-y-1.5 text-[#E9EDF2] shadow-sm mt-4">
            <span className="font-bold text-[#cbd5e1] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              Раҳбарият учун хулоса ва чора:
            </span>
            <p className="text-[11px] leading-relaxed text-[#E9EDF2]/80">
              СПЦ ва ККЦ цехларида ёнғин гидрантларини хомашё чиқиндилари билан тўсиш ҳамда кабель каналлари ёнғиндан ҳимоя мастикаси бузилиши қайталанмоқда. Муҳандислик хизматига 2-сонли буйруқ билан комплекс интизомий кўрик тайинлаш тавсия этилади.
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Fire Risk Heatmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories Bar List */}
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-7 lg:p-8 space-y-5 shadow-industrial">
          <div className="pb-3 border-b border-[#1b535c]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
              <PieChart className="w-5 h-5 text-[#cbd5e1]" />
              Ёнғин хавфсизлиги йўналишлари кесимида тақсимот
            </h3>
            <p className="text-xs text-[#E9EDF2]/70 mt-1">
              Ҳимоя воситалари, эвакуация йўллари, электр ва автоматика улуши
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {categoryStats.map((cat) => (
              <div key={cat.key} className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#E9EDF2]">
                  <span className="font-medium truncate max-w-[280px]">
                    {cat.label}
                  </span>
                  <span className="font-mono text-[#E9EDF2]/70">
                    <strong className="text-white">{cat.count}</strong> та ({cat.percent}%)
                  </span>
                </div>
                <div className="w-full bg-[#082428] h-2.5 rounded-full overflow-hidden border border-[#1b535c]">
                  <div
                    className="bg-[#64748b] h-full rounded-full transition-all"
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metallurgical Fire Safety Index by Workshop */}
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-7 lg:p-8 space-y-5 shadow-industrial">
          <div className="pb-3 border-b border-[#1b535c]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-[#cbd5e1]" />
              Цехлар бўйича ёнғин хавфи матрицаси (Safety Rating)
            </h3>
            <p className="text-xs text-[#E9EDF2]/70 mt-1">
              Ходимлар хавфсизлиги ва авариявий тайёргарлик кўрсаткичлари
            </p>
          </div>

          <div className="divide-y divide-[#1b535c]">
            {workshopStats.slice(0, 5).map((w) => (
              <div key={w.code} className="py-3.5 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span className="font-mono text-[#cbd5e1] text-sm font-extrabold">{w.code}</span>
                    <span>{w.name}</span>
                  </div>
                  <div className="text-[11px] text-[#E9EDF2]/60">
                    Ходимлар: {w.employeeCount} нафар · Масъул: {w.manager || w.managerName || 'Масъул раҳбар'}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-[#E9EDF2]">
                    Ижро: <span className="text-[#10b981] font-black">{w.rate}%</span>
                  </div>
                  <div className={`text-[11px] font-mono mt-0.5 ${
                    w.overdue > 0 ? 'text-[#ef4444] font-bold' : 'text-[#E9EDF2]/60'
                  }`}>
                    {w.overdue > 0 ? `⚠️ ${w.overdue} та муддати ўтган` : 'Барқарор'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
