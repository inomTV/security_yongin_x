import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  Printer, 
  Eye, 
  FileText,
  User
} from 'lucide-react';
import { InspectionSession, DefectItem, Workshop, Language, EmployeeUser } from '../../types';

interface InspectionsViewProps {
  inspections: InspectionSession[];
  defects: DefectItem[];
  workshops: Workshop[];
  currentUser: EmployeeUser;
  onOpenNewInspection: () => void;
  onSelectInspection: (inspection: InspectionSession) => void;
  onPrintInspectionAct: (inspection: InspectionSession) => void;
  language: Language;
}

export const InspectionsView: React.FC<InspectionsViewProps> = ({
  inspections,
  defects,
  workshops,
  currentUser,
  onOpenNewInspection,
  onSelectInspection,
  onPrintInspectionAct,
  language,
}) => {
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredInspections = inspections.filter((insp) => {
    if (selectedWorkshop !== 'ALL' && insp.workshopCode !== selectedWorkshop) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = insp.id.toLowerCase().includes(q);
      const matchShop = insp.workshopName.toLowerCase().includes(q) || insp.workshopCode.toLowerCase().includes(q);
      const matchLoc = insp.location.toLowerCase().includes(q);
      const matchInsp = insp.inspectorName.toLowerCase().includes(q);
      if (!matchId && !matchShop && !matchLoc && !matchInsp) return false;
    }
    return true;
  });

  const totalInspections = inspections.length;
  const withDefectsCount = inspections.filter((i) => i.defectsCount > 0).length;
  const cleanInspectionsCount = inspections.filter((i) => i.status === 'KAMCHILIK_ANIQLANMADI').length;

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 sm:p-8 shadow-industrial">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#082428] border border-[#1b535c] text-[#cbd5e1] shadow-inner shrink-0">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-black text-[#cbd5e1] uppercase tracking-wider mb-1">
                <span>{language === 'UZ' ? 'Ёнғин назорати далолатномалари' : 'Акты пожарного надзора'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {language === 'UZ' ? 'Текширувлар ва Далолатномалар реестри' : 'Реестр проверок и актов'}
              </h2>
              <p className="text-xs sm:text-sm text-[#E9EDF2]/80 mt-1 max-w-2xl">
                {language === 'UZ' 
                  ? 'Ҳар бир текширув мустақил FS рақамига эга бўлиб, аниқланган барча камчиликлар ва тоза далолатномаларни қамраб олади'
                  : 'Каждая проверка имеет уникальный номер FS и объединяет выявленные дефекты или фиксирует чистый результат'}
              </p>
            </div>
          </div>

          {(currentUser.role === 'INSPECTOR' || currentUser.role === 'ADMIN') && (
            <button
              type="button"
              onClick={onOpenNewInspection}
              className="px-5 py-3 rounded-xl bg-[#475569] hover:bg-[#334155] text-white border border-[#64748b] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all cursor-pointer self-start lg:self-auto whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{language === 'UZ' ? 'Янги текширув яратиш' : 'Новая проверка'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0f3b42] border border-[#1b535c] shadow-industrial">
          <div className="flex items-center justify-between text-xs text-[#E9EDF2]/70 font-bold">
            <span>{language === 'UZ' ? 'Жами текширувлар' : 'Всего проверок'}</span>
            <ClipboardCheck className="w-4 h-4 text-[#cbd5e1]" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {totalInspections}
          </div>
          <p className="text-[11px] text-[#E9EDF2]/60 mt-1">
            {language === 'UZ' ? 'Корхона цехлари кесимида' : 'По всем цехам комплекса'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f3b42] border border-[#1b535c] shadow-industrial">
          <div className="flex items-center justify-between text-xs text-[#E9EDF2]/70 font-bold">
            <span>{language === 'UZ' ? 'Камчилик аниқланган' : 'С нарушениями'}</span>
            <AlertCircle className="w-4 h-4 text-[#ef4444]" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {withDefectsCount}
          </div>
          <p className="text-[11px] text-[#f87171] font-bold mt-1">
            {language === 'UZ' ? 'Ижро назорати остида' : 'На контроле исполнения'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0f3b42] border border-[#1b535c] shadow-industrial">
          <div className="flex items-center justify-between text-xs text-[#E9EDF2]/70 font-bold">
            <span>{language === 'UZ' ? '«Камчилик аниқланмади»' : 'Без нарушений'}</span>
            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-2">
            {cleanInspectionsCount}
          </div>
          <p className="text-[11px] text-[#10b981] font-bold mt-1">
            {language === 'UZ' ? 'Тоза далолатномалар' : 'Образцовые акты'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-4 shadow-industrial flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E9EDF2]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'UZ' ? 'Рақам, цех, жой бўйича қидириш...' : 'Поиск по номеру, цеху, участку...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs placeholder:text-[#E9EDF2]/40 focus:outline-none focus:border-[#64748b]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedWorkshop('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedWorkshop === 'ALL'
                ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            {language === 'UZ' ? 'Барча цехлар' : 'Все цеха'}
          </button>
          {workshops.map((ws) => (
            <button
              key={ws.code}
              type="button"
              onClick={() => setSelectedWorkshop(ws.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedWorkshop === ws.code
                  ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                  : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
              }`}
            >
              {ws.code}
            </button>
          ))}
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl overflow-hidden shadow-industrial">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082428] border-b border-[#1b535c] text-[#E9EDF2]/80 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">{language === 'UZ' ? 'Текширув №' : '№ Проверки'}</th>
                <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Сана' : 'Дата'}</th>
                <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Цех ва Участка' : 'Цех и Участок'}</th>
                <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Назоратчи' : 'Инспектор'}</th>
                <th className="py-3.5 px-3 font-bold text-center">{language === 'UZ' ? 'Камчиликлар' : 'Дефекты'}</th>
                <th className="py-3.5 px-3 font-bold text-center">{language === 'UZ' ? 'Мақом' : 'Статус'}</th>
                <th className="py-3.5 px-4 font-bold text-right">{language === 'UZ' ? 'Амаллар' : 'Действия'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b535c]/60 text-white">
              {filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#E9EDF2]/60">
                    <ClipboardCheck className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-white">
                      {language === 'UZ' ? 'Текширувлар топилмади' : 'Проверки не найдены'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInspections.map((insp) => {
                  const isClean = insp.status === 'KAMCHILIK_ANIQLANMADI';
                  const shopDefects = defects.filter((d) => d.inspectionId === insp.id);

                  return (
                    <tr key={insp.id} className="hover:bg-[#12454d] transition-colors">
                      {/* ID */}
                      <td className="py-4 px-4 font-mono font-black text-sm text-[#cbd5e1]">
                        {insp.id}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-3 font-mono text-xs text-[#E9EDF2]/80 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#cbd5e1]" />
                          <span>{insp.date}</span>
                        </div>
                      </td>

                      {/* Workshop & Location */}
                      <td className="py-4 px-3">
                        <div className="font-extrabold text-xs text-white">
                          <span className="font-mono text-[#E9EDF2] mr-1.5 bg-[#082428] px-1.5 py-0.5 rounded border border-[#1b535c]">[{insp.workshopCode}]</span>
                          {insp.workshopName}
                        </div>
                        <div className="text-[11px] text-[#E9EDF2]/75 mt-0.5 max-w-sm truncate" title={insp.location}>
                          {insp.location}
                        </div>
                      </td>

                      {/* Inspector */}
                      <td className="py-4 px-3 text-xs text-[#E9EDF2]/90">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#cbd5e1]" />
                          <span>{insp.inspectorName}</span>
                        </div>
                      </td>

                      {/* Defects Count */}
                      <td className="py-4 px-3 text-center">
                        {isClean ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#10b981] bg-[#10b981]/15 border border-[#10b981]/30">
                            <CheckCircle2 className="w-3 h-3" />
                            0 та
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono text-[#f87171] bg-[#ef4444]/15 border border-[#ef4444]/30">
                            {insp.defectsCount} та ({insp.resolvedCount} ёпилган)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {isClean ? (
                          <span className="text-[11px] font-extrabold text-[#10b981] bg-[#10b981]/10 px-2.5 py-0.5 rounded-md border border-[#10b981]/30">
                            {language === 'UZ' ? 'Камчилик аниқланмади' : 'Без замечаний'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-extrabold text-[#e2e8f0] bg-[#334155]/60 px-2.5 py-0.5 rounded-md border border-[#64748b]/50">
                            {language === 'UZ' ? 'Ижрода' : 'В работе'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onPrintInspectionAct(insp)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#082428] hover:bg-[#154c55] text-[#cbd5e1] hover:text-white border border-[#1b535c] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title={language === 'UZ' ? 'Текширув далолатномасини чоп этиш (PDF)' : 'Печать акта проверки (PDF)'}
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{language === 'UZ' ? 'Акт (PDF)' : 'Акт (PDF)'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
