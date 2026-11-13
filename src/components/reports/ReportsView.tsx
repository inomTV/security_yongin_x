import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Building2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  ShieldCheck,
  Flame,
  Clock
} from 'lucide-react';
import { InspectionSession, DefectItem, Workshop, EmployeeUser, Language } from '../../types';

interface ReportsViewProps {
  inspections: InspectionSession[];
  defects: DefectItem[];
  workshops: Workshop[];
  employees: EmployeeUser[];
  language: Language;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  inspections,
  defects,
  workshops,
  employees,
  language,
}) => {
  const [selectedReportType, setSelectedReportType] = useState<
    'INSPECTION_ACT' | 'DEFECTS_LIST' | 'EMPLOYEES_SUMMARY' | 'WORKSHOP_BREAKDOWN' | 'OVERDUE_REPORT' | 'PERIOD_REPORT'
  >('INSPECTION_ACT');

  const [selectedInspectionId, setSelectedInspectionId] = useState<string>(inspections[0]?.id || 'FS-000125');
  const [selectedWorkshopCode, setSelectedWorkshopCode] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');

  const currentInspection = inspections.find((i) => i.id === selectedInspectionId) || inspections[0];
  const inspectionDefects = defects.filter((d) => d.inspectionId === currentInspection?.id);

  // CSV Export utility with UTF-8 BOM so Uzbek Cyrillic (Ў, Қ, Ғ, Ҳ) displays perfectly in Excel
  const downloadCSV = (filename: string, headers: string[], rows: (string | number | undefined | null)[][]) => {
    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintAct = () => {
    window.print();
  };

  const handleExportDefectsListCSV = () => {
    const headers = [
      'Камчилик №', 'Текширув №', 'Цех', 'Участка', 'Камчилик номи',
      'Хавф даражаси', 'Мақом', 'Аниқланган сана', 'Муддат', 'Масъул ходим', 'Назоратчи'
    ];
    const rows = defects.map((d) => [
      d.id,
      d.inspectionId,
      d.workshopCode,
      d.zone,
      d.catalogTitleSnapshot,
      d.priority,
      d.status,
      d.detectedDate,
      d.deadline,
      d.responsiblePerson,
      d.inspectorName,
    ]);
    downloadCSV(`Kamchiliklar_Reestri_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleExportWorkshopsCSV = () => {
    const headers = ['Цех коди', 'Цех номи', 'Хавф тоифаси', 'Цех бошлиғи', 'Жами камчиликлар', 'Ёпилган', 'Ижрода', 'Муддати ўтган'];
    const rows = workshops.map((w) => {
      const shopDefects = defects.filter((d) => d.workshopCode === w.code);
      const total = shopDefects.length;
      const closed = shopDefects.filter((d) => d.status === 'YOPILGAN').length;
      const inProgress = shopDefects.filter((d) => d.status !== 'YOPILGAN' && !d.isOverdue).length;
      const overdue = shopDefects.filter((d) => d.isOverdue || d.status === 'MUDDATI_OTGAN').length;
      return [w.code, w.name, w.dangerClass, w.managerName, total, closed, inProgress, overdue];
    });
    downloadCSV(`Sexlar_Kesimida_Hisobot_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleExportOverdueCSV = () => {
    const overdueDefects = defects.filter((d) => d.isOverdue || d.status === 'MUDDATI_OTGAN');
    const headers = ['Камчилик №', 'Цех', 'Участка', 'Камчилик мазмуни', 'Масъул шахс', 'Муддати', 'Кечикиш кунлари'];
    const rows = overdueDefects.map((d) => [
      d.id,
      d.workshopCode,
      d.zone,
      d.catalogTitleSnapshot,
      d.responsiblePerson,
      d.deadline,
      'Муддати ўтган'
    ]);
    downloadCSV(`Muddati_Otgan_Kamchiliklar_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Banner - hidden when printing */}
      <div className="print:hidden bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 sm:p-8 shadow-industrial select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#082428] border border-[#1b535c] text-[#94a3b8] shadow-inner shrink-0">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-black text-[#94a3b8] uppercase tracking-wider mb-1">
                <span>{language === 'UZ' ? 'Расмий ҳисоботлар ва Далолатномалар' : 'Официальные отчеты и акты'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {language === 'UZ' ? 'Ҳисоботлар генератори ва PDF/Excel экспорт' : 'Генератор отчетов и экспорт'}
              </h2>
              <p className="text-xs sm:text-sm text-[#E9EDF2]/80 mt-1 max-w-2xl">
                {language === 'UZ' 
                  ? 'Текширув далолатномаларини расмий PDF шаклида чоп этиш, камчиликлар ва цехлар ҳисоботларини Excel (CSV) форматида юклаб олиш'
                  : 'Печать официальных актов проверок (PDF), выгрузка реестров замечаний в Excel'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handlePrintAct}
              className="px-4 py-2.5 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'UZ' ? 'Ҳисоботни чоп этиш (PDF)' : 'Печать отчета (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Types Selector - hidden when printing */}
      <div className="print:hidden bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-4 shadow-industrial space-y-3 select-none">
        <div className="text-xs font-bold text-[#E9EDF2]/70 uppercase tracking-wider font-mono">
          {language === 'UZ' ? 'Ҳисобот турини танланг:' : 'Выберите тип отчета:'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() => setSelectedReportType('INSPECTION_ACT')}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              selectedReportType === 'INSPECTION_ACT'
                ? 'bg-[#475569] text-white border-[#64748b] font-black shadow-md'
                : 'bg-[#082428] text-[#E9EDF2]/80 border-[#1b535c] hover:bg-[#154c55]'
            }`}
          >
            <div className="text-xs font-bold truncate">1. Текширув далолатномаси</div>
            <div className="text-[10px] opacity-75 mt-0.5">PDF чоп этиш</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedReportType('DEFECTS_LIST')}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              selectedReportType === 'DEFECTS_LIST'
                ? 'bg-[#475569] text-white border-[#64748b] font-black shadow-md'
                : 'bg-[#082428] text-[#E9EDF2]/80 border-[#1b535c] hover:bg-[#154c55]'
            }`}
          >
            <div className="text-xs font-bold truncate">2. Камчиликлар рўйхати</div>
            <div className="text-[10px] opacity-75 mt-0.5">Excel / CSV</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedReportType('WORKSHOP_BREAKDOWN')}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              selectedReportType === 'WORKSHOP_BREAKDOWN'
                ? 'bg-[#475569] text-white border-[#64748b] font-black shadow-md'
                : 'bg-[#082428] text-[#E9EDF2]/80 border-[#1b535c] hover:bg-[#154c55]'
            }`}
          >
            <div className="text-xs font-bold truncate">3. Цехлар ҳисоботи</div>
            <div className="text-[10px] opacity-75 mt-0.5">Барча цехлар</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedReportType('OVERDUE_REPORT')}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              selectedReportType === 'OVERDUE_REPORT'
                ? 'bg-[#475569] text-white border-[#64748b] font-black shadow-md'
                : 'bg-[#082428] text-[#E9EDF2]/80 border-[#1b535c] hover:bg-[#154c55]'
            }`}
          >
            <div className="text-xs font-bold truncate">4. Муддати ўтганлар</div>
            <div className="text-[10px] opacity-75 mt-0.5">Фавқулодда назорат</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedReportType('EMPLOYEES_SUMMARY')}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              selectedReportType === 'EMPLOYEES_SUMMARY'
                ? 'bg-[#475569] text-white border-[#64748b] font-black shadow-md'
                : 'bg-[#082428] text-[#E9EDF2]/80 border-[#1b535c] hover:bg-[#154c55]'
            }`}
          >
            <div className="text-xs font-bold truncate">5. Масъул ходимлар</div>
            <div className="text-[10px] opacity-75 mt-0.5">Ижро интизоми</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedReportType('PERIOD_REPORT')}
            className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
              selectedReportType === 'PERIOD_REPORT'
                ? 'bg-[#475569] text-white border-[#64748b] font-black shadow-md'
                : 'bg-[#082428] text-[#E9EDF2]/80 border-[#1b535c] hover:bg-[#154c55]'
            }`}
          >
            <div className="text-xs font-bold truncate">6. Даврий (Ой/Чорак)</div>
            <div className="text-[10px] opacity-75 mt-0.5">Раҳбарият учун</div>
          </button>
        </div>
      </div>

      {/* REPORT CONTENT 1: PRINTABLE INSPECTION ACT (PDF ACT) */}
      {selectedReportType === 'INSPECTION_ACT' && (
        <div className="space-y-4">
          {/* Inspection Selector Header - hidden when printing */}
          <div className="print:hidden bg-[#0f3b42] border border-[#1b535c] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">{language === 'UZ' ? 'Текширув далолатномасини танланг:' : 'Выберите акт проверки:'}</span>
              <select
                value={selectedInspectionId}
                onChange={(e) => setSelectedInspectionId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-mono font-bold"
              >
                {inspections.map((insp) => (
                  <option key={insp.id} value={insp.id}>
                    {insp.id} — {insp.workshopCode} ({insp.date})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handlePrintAct}
              className="px-4 py-2 rounded-xl bg-[#082428] hover:bg-[#154c55] text-[#cbd5e1] hover:text-white border border-[#1b535c] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'UZ' ? 'Ушбу актни чоп этиш' : 'Печать этого акта'}</span>
            </button>
          </div>

          {/* OFFICIAL ACT DOCUMENT (A4 PRINT OPTIMIZED) */}
          <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-300 shadow-2xl max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
            {/* Act Top Header */}
            <div className="border-b-2 border-slate-900 pb-5 text-center">
              <div className="flex items-center justify-between mb-3">
                <img
                  src="/assets/aistudio/Logo_UMK_5145ab7c.png"
                  alt="Ўзметкомбинат"
                  className="h-12 w-auto object-contain"
                />
                <div className="text-right text-[11px] font-mono text-slate-600 font-semibold">
                  <div>«ЎЗБЕКИСТОН МЕТАЛЛУРГИЯ КОМБИНАТИ» АЖ</div>
                  <div>Ёнғин хавфсизлиги ва фавқулодда вазиятлар бошқармаси</div>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 font-serif">
                ЁНҒИН ХАВФСИЗЛИГИ ҲОЛАТИНИ ТЕКШИРИШ
              </h1>
              <h2 className="text-lg font-bold text-slate-800 uppercase font-mono mt-0.5">
                ДАЛОЛАТНОМАСИ № {currentInspection?.id}
              </h2>
              <div className="text-xs text-slate-500 font-mono mt-1">
                (ГОСТ 12.4.009-83 ва ШНК 2.01.02-04 меъёрлари асосида)
              </div>
            </div>

            {/* Act Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-300 text-xs font-mono">
              <div>
                <span className="text-slate-500">Текширув санаси:</span>{' '}
                <strong className="text-slate-900 font-bold">{currentInspection?.date} йил</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Текширув жойи (Шаҳар):</span>{' '}
                <strong className="text-slate-900 font-bold">Бекобод ш., «Ўзметкомбинат» АЖ</strong>
              </div>
              <div>
                <span className="text-slate-500">Текширилган цех:</span>{' '}
                <strong className="text-slate-900 font-bold">[{currentInspection?.workshopCode}] {currentInspection?.workshopName}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Масъул ёнғин назоратчиси:</span>{' '}
                <strong className="text-slate-900 font-bold">{currentInspection?.inspectorName}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Аниқ текширилган ҳудуд / объект:</span>{' '}
                <strong className="text-slate-900 font-bold">{currentInspection?.location}</strong>
              </div>
            </div>

            {/* Act Body: Defects List */}
            <div className="py-5 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 uppercase font-serif border-b border-slate-200 pb-1">
                ТЕКШИРУВ НАТИЖАСИДА АНИҚЛАНГАН ҲОЛАТЛАР:
              </h3>

              {currentInspection?.status === 'KAMCHILIK_ANIQLANMADI' || inspectionDefects.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                  <p className="font-bold text-sm text-slate-800">
                    Ушбу текширувда ёнғин хавфсизлиги қоидабузарликлари аниқланмади.
                  </p>
                  <p className="text-xs text-slate-500">
                    Объект ва бирламчи ёнғин ўчириш воситалари ҳолати ГОСТ 12.4.009-83 меъёрларига тўлиқ жавоб беради.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inspectionDefects.map((defect, idx) => (
                    <div key={defect.id} className="p-4 border border-slate-300 rounded-xl bg-slate-50 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-2 py-0.5 bg-slate-200 text-slate-900 rounded">
                            {idx + 1}. {defect.id}
                          </span>
                          <span className="font-bold text-xs text-slate-900">
                            {defect.catalogTitleSnapshot}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                          {defect.priority} ХАВФ
                        </span>
                      </div>

                      <p className="text-slate-700 leading-relaxed text-xs">
                        <strong>Тавсиф:</strong> {defect.description}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 font-mono pt-1 border-t border-slate-200">
                        <div>
                          <strong>Аниқланган жой:</strong> {defect.zone}
                        </div>
                        <div>
                          <strong>Ижрочи масъул:</strong> {defect.responsiblePerson}
                        </div>
                        <div>
                          <strong>Бажариш муддати:</strong> {defect.deadline}
                        </div>
                      </div>

                      {/* Photo evidence if any */}
                      {defect.photoBefore && (
                        <div className="pt-2 flex items-center gap-3">
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Аниқланган ҳолат фотоси:</div>
                            <img
                              src={defect.photoBefore}
                              alt="Defect"
                              className="h-20 w-auto object-cover rounded border border-slate-300 mt-0.5"
                            />
                          </div>
                          {defect.photoAfter && (
                            <div>
                              <div className="text-[10px] font-bold text-emerald-700 uppercase">Бартараф этилган ҳолат фотоси:</div>
                              <img
                                src={defect.photoAfter}
                                alt="Resolution"
                                className="h-20 w-auto object-cover rounded border border-emerald-400 mt-0.5"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Act Signatures */}
            <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs font-mono">
              <div className="space-y-6">
                <div>
                  <strong>Далолатномани тузди (Назоратчи):</strong>
                  <div className="text-slate-600 mt-1">{currentInspection?.inspectorName}</div>
                </div>
                <div className="border-b border-slate-400 pb-1 flex justify-between text-slate-400 text-[10px]">
                  <span>(Имзо)</span>
                  <span>{currentInspection?.date} йил</span>
                </div>
              </div>

              <div className="space-y-6 text-right">
                <div>
                  <strong>Далолатнома билан танишдим (Цех бошлиғи):</strong>
                  <div className="text-slate-600 mt-1">{currentInspection?.workshopName} масъули</div>
                </div>
                <div className="border-b border-slate-400 pb-1 flex justify-between text-slate-400 text-[10px]">
                  <span>(Имзо ва муҳр)</span>
                  <span>____.____.2026 йил</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 2: DEFECTS LIST TABLE + EXCEL EXPORT */}
      {selectedReportType === 'DEFECTS_LIST' && (
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-6 shadow-industrial space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b535c]">
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {language === 'UZ' ? 'Камчиликларнинг умумий реестри ҳисоботи' : 'Сводный реестр замечаний'}
              </h3>
              <p className="text-xs text-[#E9EDF2]/60 mt-0.5">
                {language === 'UZ' ? 'Барча цехлар ва участкалар бўйича жами ёнғин хавфи камчиликлари' : 'Полный перечень замечаний по всем участкам'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportDefectsListCSV}
              className="px-4 py-2 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{language === 'UZ' ? 'Excel (CSV) юклаб олиш' : 'Скачать в Excel'}</span>
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#082428] text-[#E9EDF2]/70 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Цех</th>
                  <th className="py-2.5 px-3">Камчилик мазмуни</th>
                  <th className="py-2.5 px-3">Хавф</th>
                  <th className="py-2.5 px-3">Мақом</th>
                  <th className="py-2.5 px-3">Муддат</th>
                  <th className="py-2.5 px-3">Масъул</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b535c]/50">
                {defects.map((d) => (
                  <tr key={d.id} className="hover:bg-[#12454d]">
                    <td className="py-2.5 px-3 font-mono text-[#cbd5e1] font-bold">{d.id}</td>
                    <td className="py-2.5 px-3 font-bold">{d.workshopCode}</td>
                    <td className="py-2.5 px-3 max-w-sm truncate">{d.catalogTitleSnapshot}</td>
                    <td className="py-2.5 px-3 font-bold text-[#f87171]">{d.priority}</td>
                    <td className="py-2.5 px-3">{d.status}</td>
                    <td className="py-2.5 px-3 font-mono">{d.deadline}</td>
                    <td className="py-2.5 px-3">{d.responsiblePerson}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 3: WORKSHOPS BREAKDOWN */}
      {selectedReportType === 'WORKSHOP_BREAKDOWN' && (
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-6 shadow-industrial space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b535c]">
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {language === 'UZ' ? 'Цехлар кесимида ёнғин хавфсизлиги ҳисоботи' : 'Отчет в разрезе цехов'}
              </h3>
              <p className="text-xs text-[#E9EDF2]/60 mt-0.5">
                {language === 'UZ' ? 'Ҳар бир цех бўйича очиқ, ёпилган ва муддати ўтган камчиликлар статистикаси' : 'Статистика нарушений по каждому цеху комбината'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportWorkshopsCSV}
              className="px-4 py-2 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{language === 'UZ' ? 'Excel (CSV) юклаб олиш' : 'Скачать в Excel'}</span>
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#082428] text-[#E9EDF2]/70 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Код</th>
                  <th className="py-2.5 px-3">Цех номи</th>
                  <th className="py-2.5 px-3">Хавф тоифаси</th>
                  <th className="py-2.5 px-3">Цех бошлиғи</th>
                  <th className="py-2.5 px-3 text-center">Жами камчилик</th>
                  <th className="py-2.5 px-3 text-center">Ёпилган</th>
                  <th className="py-2.5 px-3 text-center">Ижрода</th>
                  <th className="py-2.5 px-3 text-center">Муддати ўтган</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b535c]/50">
                {workshops.map((w) => {
                  const shopDefects = defects.filter((d) => d.workshopCode === w.code);
                  const total = shopDefects.length;
                  const closed = shopDefects.filter((d) => d.status === 'YOPILGAN').length;
                  const inProgress = shopDefects.filter((d) => d.status !== 'YOPILGAN' && !d.isOverdue).length;
                  const overdue = shopDefects.filter((d) => d.isOverdue || d.status === 'MUDDATI_OTGAN').length;

                  return (
                    <tr key={w.code} className="hover:bg-[#12454d]">
                      <td className="py-2.5 px-3 font-mono text-[#cbd5e1] font-black">{w.code}</td>
                      <td className="py-2.5 px-3 font-bold">{w.name}</td>
                      <td className="py-2.5 px-3 font-mono">{w.dangerClass}-тоифа</td>
                      <td className="py-2.5 px-3">{w.managerName}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-white">{total}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#10b981] font-bold">{closed}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#cbd5e1]">{inProgress}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#ef4444] font-bold">{overdue}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 4: OVERDUE REPORT */}
      {selectedReportType === 'OVERDUE_REPORT' && (
        <div className="bg-[#0f3b42] border border-[#ef4444]/40 rounded-2xl p-6 shadow-industrial space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b535c]">
            <div>
              <div className="flex items-center gap-2 text-[#ef4444] font-black text-xs font-mono uppercase mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Фавқулодда раҳбарият назоратидаги рўйхат</span>
              </div>
              <h3 className="font-extrabold text-sm text-white">
                {language === 'UZ' ? 'Муддати ўтган камчиликлар тўғрисидаги махсус ҳисобот' : 'Отчет по просроченным предписаниям'}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleExportOverdueCSV}
              className="px-4 py-2 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{language === 'UZ' ? 'Excel (CSV) юклаб олиш' : 'Скачать в Excel'}</span>
            </button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#082428] text-[#E9EDF2]/70 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Цех</th>
                  <th className="py-2.5 px-3">Аниқланган жой</th>
                  <th className="py-2.5 px-3">Камчилик мазмуни</th>
                  <th className="py-2.5 px-3">Белгиланган муддат</th>
                  <th className="py-2.5 px-3">Масъул шахс</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b535c]/50">
                {defects.filter((d) => d.isOverdue || d.status === 'MUDDATI_OTGAN').map((d) => (
                  <tr key={d.id} className="hover:bg-[#12454d] text-[#f87171]">
                    <td className="py-2.5 px-3 font-mono font-black">{d.id}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{d.workshopCode}</td>
                    <td className="py-2.5 px-3 text-[#E9EDF2]">{d.zone}</td>
                    <td className="py-2.5 px-3 text-white max-w-sm truncate">{d.catalogTitleSnapshot}</td>
                    <td className="py-2.5 px-3 font-mono font-black">{d.deadline}</td>
                    <td className="py-2.5 px-3 text-[#E9EDF2]">{d.responsiblePerson}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 5: EMPLOYEES SUMMARY */}
      {selectedReportType === 'EMPLOYEES_SUMMARY' && (
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-6 shadow-industrial space-y-4 text-white">
          <h3 className="font-extrabold text-sm text-white pb-3 border-b border-[#1b535c]">
            {language === 'UZ' ? 'Масъул ходимлар ва роллар ҳисоботи' : 'Отчет по персоналу и ответственным'}
          </h3>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#082428] text-[#E9EDF2]/70 uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Табел</th>
                  <th className="py-2.5 px-3">Ф.И.Ш.</th>
                  <th className="py-2.5 px-3">Цех</th>
                  <th className="py-2.5 px-3">Тизим роли</th>
                  <th className="py-2.5 px-3">Телефон</th>
                  <th className="py-2.5 px-3">Ҳолат</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b535c]/50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#12454d]">
                    <td className="py-2.5 px-3 font-mono text-[#cbd5e1] font-bold">{emp.badgeNumber}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{emp.fullName}</td>
                    <td className="py-2.5 px-3 font-mono text-[#E9EDF2] font-semibold">{emp.workshopCode}</td>
                    <td className="py-2.5 px-3 font-bold">{emp.role}</td>
                    <td className="py-2.5 px-3 font-mono">{emp.phone}</td>
                    <td className="py-2.5 px-3 text-[#10b981] font-bold">{emp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT 6: PERIOD REPORT */}
      {selectedReportType === 'PERIOD_REPORT' && (
        <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-6 shadow-industrial space-y-4 text-white">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#1b535c]">
            <h3 className="font-extrabold text-sm text-white">
              {language === 'UZ' ? 'Даврий ёнғин хавфсизлиги таҳлили (Ойлик / Чораклик)' : 'Периодический анализ безопасности'}
            </h3>
            <div className="flex items-center gap-1.5 p-1 bg-[#082428] rounded-xl border border-[#1b535c] text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedPeriod('MONTH')}
                className={`px-3 py-1 rounded-lg ${selectedPeriod === 'MONTH' ? 'bg-[#475569] text-white font-black' : 'text-[#E9EDF2]/70'}`}
              >
                Жорий ой
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('QUARTER')}
                className={`px-3 py-1 rounded-lg ${selectedPeriod === 'QUARTER' ? 'bg-[#475569] text-white font-black' : 'text-[#E9EDF2]/70'}`}
              >
                I Чорак 2026
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('YEAR')}
                className={`px-3 py-1 rounded-lg ${selectedPeriod === 'YEAR' ? 'bg-[#475569] text-white font-black' : 'text-[#E9EDF2]/70'}`}
              >
                2026 Йил
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#082428] border border-[#1b535c]">
              <div className="text-xs text-[#E9EDF2]/70">Ўтказилган текширувлар</div>
              <div className="text-2xl font-black text-white font-mono mt-1">{inspections.length} та</div>
            </div>
            <div className="p-4 rounded-xl bg-[#082428] border border-[#1b535c]">
              <div className="text-xs text-[#E9EDF2]/70">Аниқланган камчиликлар</div>
              <div className="text-2xl font-black text-[#cbd5e1] font-mono mt-1">{defects.length} та</div>
            </div>
            <div className="p-4 rounded-xl bg-[#082428] border border-[#1b535c]">
              <div className="text-xs text-[#E9EDF2]/70">Бартараф этилган</div>
              <div className="text-2xl font-black text-[#10b981] font-mono mt-1">
                {defects.filter((d) => d.status === 'YOPILGAN').length} та
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#082428] border border-[#1b535c]">
              <div className="text-xs text-[#E9EDF2]/70">Ижро самарадорлиги</div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {defects.length > 0 ? Math.round((defects.filter((d) => d.status === 'YOPILGAN').length / defects.length) * 100) : 100}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
