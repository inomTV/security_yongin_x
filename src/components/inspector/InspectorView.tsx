import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  AlertOctagon, 
  Camera, 
  Calendar, 
  MapPin, 
  User, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  UploadCloud,
  FileCheck2
} from 'lucide-react';
import { Workshop, ChecklistQuestion, DefectItem, Severity, ChecklistCategory } from '../../types';
import { WORKSHOPS, STANDARD_CHECKLIST, CATEGORY_LABELS, SAMPLE_DEFECT_PHOTOS } from '../../data/mockData';

interface InspectorViewProps {
  onAddDefect: (defect: Omit<DefectItem, 'id' | 'history'>) => void;
  onNavigateToRegistry: () => void;
}

export const InspectorView: React.FC<InspectorViewProps> = ({
  onAddDefect,
  onNavigateToRegistry,
}) => {
  const [selectedWorkshopCode, setSelectedWorkshopCode] = useState<string>('СПЦ');
  const [activeSubTab, setActiveSubTab] = useState<'CHECKLIST' | 'MANUAL_FORM'>('CHECKLIST');
  
  // Checklist State
  const [checklist, setChecklist] = useState<ChecklistQuestion[]>(STANDARD_CHECKLIST);
  const [auditSuccessBanner, setAuditSuccessBanner] = useState<string | null>(null);

  // Manual Defect Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ChecklistCategory>('YONGIN_OCHIRISH');
  const [formZone, setFormZone] = useState('');
  const [formSeverity, setFormSeverity] = useState<Severity>('YUQORI');
  const [formDeadlineDays, setFormDeadlineDays] = useState<number>(3);
  const [formDescription, setFormDescription] = useState('');
  const [formPhoto, setFormPhoto] = useState<string>(SAMPLE_DEFECT_PHOTOS.hydrantBlocked);
  const [formIsRecurring, setFormIsRecurring] = useState<boolean>(false);
  const [formCustomPhotoPreview, setFormCustomPhotoPreview] = useState<string | null>(null);

  const selectedWorkshop = WORKSHOPS.find((w) => w.code === selectedWorkshopCode) || WORKSHOPS[0];

  // Calculate deadline date string
  const calculateDeadline = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Handle checklist item status change
  const handleChecklistVote = (id: string, status: 'PASS' | 'FAIL') => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );

    // If marked as FAIL, automatically populate and switch to form
    const targetItem = checklist.find((item) => item.id === id);
    if (status === 'FAIL' && targetItem) {
      setFormTitle(`${CATEGORY_LABELS[targetItem.category]} бўйича камчилик: ${targetItem.text.slice(0, 50)}...`);
      setFormCategory(targetItem.category);
      setFormSeverity(targetItem.defectDetails?.severity || 'YUQORI');
      setFormZone(targetItem.defectDetails?.zone || `${selectedWorkshop.code} ишлаб чиқариш майдони`);
      setFormDescription(`${targetItem.defectDetails?.description || ''} Меъёрий асос: ${targetItem.standardNorm}`);
      setFormDeadlineDays(targetItem.defectDetails?.deadlineDays || 3);
      setActiveSubTab('MANUAL_FORM');
    }
  };

  // Handle file upload preview
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormCustomPhotoPreview(result);
        setFormPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Defect Form
  const handleSubmitDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    const newDefectData: Omit<DefectItem, 'id' | 'history'> = {
      title: formTitle,
      category: formCategory,
      categoryName: CATEGORY_LABELS[formCategory],
      workshopCode: selectedWorkshop.code,
      workshopName: selectedWorkshop.name,
      zone: formZone || `${selectedWorkshop.code} марказий корпуси`,
      detectedDate: new Date().toISOString().split('T')[0],
      deadline: calculateDeadline(formDeadlineDays),
      status: 'YANGI',
      severity: formSeverity,
      inspectorName: 'Капитан Саидов М.Б. (ЁХХ инспектори)',
      responsiblePerson: `${selectedWorkshop.manager} (${selectedWorkshop.code})`,
      description: formDescription,
      defectPhoto: formPhoto,
      isRecurring: formIsRecurring,
      recurringCount: formIsRecurring ? 2 : 0,
    };

    onAddDefect(newDefectData);

    setAuditSuccessBanner(`Камчилик муваффақиятли расмийлаштирилди ва ${selectedWorkshop.name} масъулига топширилди!`);
    setTimeout(() => setAuditSuccessBanner(null), 5000);

    // Reset Form
    setFormTitle('');
    setFormDescription('');
    setFormZone('');
    setFormCustomPhotoPreview(null);
    setActiveSubTab('CHECKLIST');
  };

  // Quick stats for checklist
  const passedCount = checklist.filter((c) => c.status === 'PASS').length;
  const failedCount = checklist.filter((c) => c.status === 'FAIL').length;
  const remainingCount = checklist.filter((c) => !c.status).length;

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Top Banner Notice */}
      {auditSuccessBanner && (
        <div className="p-5 bg-[#10b981]/15 border border-[#10b981]/40 rounded-2xl text-[#E9EDF2] flex items-center justify-between shadow-industrial">
          <div className="flex items-center gap-3.5">
            <CheckCircle className="w-6 h-6 text-[#10b981] shrink-0" />
            <span className="text-sm font-bold">{auditSuccessBanner}</span>
          </div>
          <button
            onClick={onNavigateToRegistry}
            className="text-xs font-bold px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            Реестрда кўриш <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Workshop Selection Strip in Deep Teal #0f3b42 */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-8 lg:p-9 space-y-6 shadow-industrial">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-2">
          <div className="flex items-start gap-4">
            <img
              src="/assets/aistudio/Logo_UMK_5145ab7c.png"
              alt="UZMETKOMBINAT"
              className="h-12 w-auto object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(100,116,139,0.35)]"
            />
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-[#94a3b8] uppercase tracking-widest mb-1.5 font-mono">
                <ShieldAlert className="w-4 h-4 text-[#94a3b8]" />
                «ЎЗМЕТКОМБИНАТ» АЖ · 1. Текширилувчи металлургия объектини танланг
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Ишлаб чиқариш цехлари бўйича ёнғин хавфсизлиги аудити
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#E9EDF2]/70 font-semibold">Хавфлилик тоифаси:</span>
            <span className={`text-xs px-3.5 py-1.5 rounded-xl font-bold font-mono shadow-sm ${
              selectedWorkshop.dangerClass === 'A' 
                ? 'bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30' 
                : 'bg-[#475569]/30 text-[#cbd5e1] border border-[#64748b]/40'
            }`}>
              Тоифа {selectedWorkshop.dangerClass} (Юқори саноат хавфи)
            </span>
          </div>
        </div>

        {/* Workshop Cards Grid in Deep Teal #0f3b42 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {WORKSHOPS.map((workshop) => {
            const isSelected = workshop.code === selectedWorkshopCode;
            return (
              <button
                key={workshop.code}
                type="button"
                onClick={() => setSelectedWorkshopCode(workshop.code)}
                className={`p-4 rounded-2xl text-left transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#475569] border-[#64748b] text-white shadow-industrial scale-[1.02]'
                    : 'bg-[#082428] border-[#1b535c] hover:border-[#64748b] text-[#E9EDF2] hover:bg-[#154c55]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-mono text-lg font-black tracking-tight ${isSelected ? 'text-white' : 'text-[#cbd5e1]'}`}>
                    {workshop.code}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    workshop.dangerClass === 'A' ? 'text-[#f87171] bg-[#ef4444]/15 border border-[#ef4444]/30' : 'text-[#cbd5e1] bg-[#475569]/30 border border-[#64748b]/30'
                  }`}>
                    {workshop.dangerClass}
                  </span>
                </div>
                <div className="text-xs font-bold truncate text-[#E9EDF2]">
                  {workshop.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Workshop Detail Card */}
        <div className="pt-5 border-t border-[#1b535c] grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-[#E9EDF2]/90">
          <div className="flex items-start gap-3 bg-[#082428] p-3.5 rounded-xl border border-[#1b535c]">
            <MapPin className="w-4 h-4 text-[#94a3b8] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#E9EDF2]/60 font-semibold block">Цех тўлиқ номи:</span>
              <span className="font-bold text-white leading-snug">{selectedWorkshop.fullName}</span>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-[#082428] p-3.5 rounded-xl border border-[#1b535c]">
            <User className="w-4 h-4 text-[#94a3b8] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#E9EDF2]/60 font-semibold block">Цех масъули (бошлиғи):</span>
              <span className="font-bold text-white">{selectedWorkshop.manager}</span>
              <span className="text-xs text-[#cbd5e1] block font-mono mt-0.5 font-bold">{selectedWorkshop.phone}</span>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-[#082428] p-3.5 rounded-xl border border-[#1b535c]">
            <AlertOctagon className="w-4 h-4 text-[#94a3b8] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#E9EDF2]/60 font-semibold block">Ёнғин хавфи тавсифи:</span>
              <span className="font-medium text-[#E9EDF2] leading-snug">{selectedWorkshop.dangerDescription}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1b535c]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubTab('CHECKLIST')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 ${
              activeSubTab === 'CHECKLIST'
                ? 'bg-[#475569] text-white border border-[#64748b] font-black shadow-md'
                : 'text-[#E9EDF2]/80 hover:text-white bg-[#0f3b42] border border-[#1b535c]'
            }`}
          >
            <ClipboardCheck className="w-4 h-4 stroke-[2.5]" />
            Рақамли Чек-лист (Инспекция)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('MANUAL_FORM')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 ${
              activeSubTab === 'MANUAL_FORM'
                ? 'bg-[#475569] text-white border border-[#64748b] font-black shadow-md'
                : 'text-[#E9EDF2]/80 hover:text-white bg-[#0f3b42] border border-[#1b535c]'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Камчиликни расми билан киритиш
          </button>
        </div>

        {activeSubTab === 'CHECKLIST' && (
          <div className="flex items-center gap-5 text-xs font-bold">
            <span className="text-[#10b981] flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> {passedCount} мувофиқ
            </span>
            <span className="text-[#ef4444] flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /> {failedCount} камчилик
            </span>
            <span className="text-[#E9EDF2]/60 font-medium">
              {remainingCount} текширилмаган
            </span>
          </div>
        )}
      </div>

      {/* SUB-VIEW 1: Digital Checklist */}
      {activeSubTab === 'CHECKLIST' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#0f3b42] border border-[#1b535c] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
            <div className="text-xs text-[#E9EDF2]">
              <span className="font-bold text-white block mb-0.5">
                Металлургия цехи учун стандартлаштирилган ёнғин назорати чек-листи
              </span>
              Ҳар бир пунктни текшириб "Мувофиқ" ёки "Камчилик бор" деб белгиланг. "Камчилик бор" деб танланганда фото ва тафсилотни расмийлаштириш ойнаси автоматик очилади.
            </div>
            <button
              type="button"
              onClick={() => {
                setAuditSuccessBanner(`${selectedWorkshop.code} цехи бўйича режали чек-лист кўриги якунланди!`);
                setTimeout(() => setAuditSuccessBanner(null), 4000);
              }}
              className="px-4 py-2 bg-[#0b2e34] hover:bg-[#154c55] text-white text-xs font-bold rounded-lg border border-[#1b535c] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <FileCheck2 className="w-4 h-4 text-[#10b981]" />
              Текширув баёнини сақлаш
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {checklist.map((item, idx) => {
              const isPassed = item.status === 'PASS';
              const isFailed = item.status === 'FAIL';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isFailed
                      ? 'bg-[#ef4444]/15 border-[#ef4444]'
                      : isPassed
                      ? 'bg-[#10b981]/15 border-[#10b981]'
                      : 'bg-[#0f3b42] border-[#1b535c]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#94a3b8]">
                          №{idx + 1}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded bg-[#082428] text-[#E9EDF2] border border-[#1b535c] font-medium">
                          {CATEGORY_LABELS[item.category]}
                        </span>
                        <span className="text-[11px] text-[#E9EDF2]/60 font-mono">
                          {item.standardNorm}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white leading-snug">
                        {item.text}
                      </p>
                    </div>

                    {/* Actions: Pass (Green #10b981) / Fail (Red #ef4444) */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleChecklistVote(item.id, 'PASS')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                          isPassed
                            ? 'bg-[#10b981] border-[#10b981] text-white shadow-md'
                            : 'bg-[#082428] border-[#1b535c] text-[#E9EDF2]/80 hover:text-[#10b981] hover:border-[#10b981]'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Мувофиқ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChecklistVote(item.id, 'FAIL')}
                        className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 ${
                          isFailed
                            ? 'bg-[#ef4444] border-[#ef4444] text-white shadow-md'
                            : 'bg-[#082428] border-[#1b535c] text-[#E9EDF2]/80 hover:text-[#ef4444] hover:border-[#ef4444]'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        Камчилик бор
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Manual Defect Entry Form */}
      {activeSubTab === 'MANUAL_FORM' && (
        <form onSubmit={handleSubmitDefect} className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-7 space-y-6 shadow-industrial">
          <div className="border-b border-[#1b535c] pb-4">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-[#94a3b8]" />
              Янги камчиликни фотосурати билан расмийлаштириш
            </h3>
            <p className="text-xs text-[#E9EDF2]/75">
              Объект: <span className="font-bold text-white">{selectedWorkshop.fullName}</span>. 
              Масъул шахс ва бартараф этиш муддатини қатъий белгиланг.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                  Камчилик номи ва мазмуни: *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Масалан: 2-сонли гидрант ёнида қувурлар тахланган, яқинлашиш имконсиз"
                  className="w-full bg-[#082428] border border-[#1b535c] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#E9EDF2]/40 focus:outline-none focus:border-[#64748b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                    Йўналиш (Категория):
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ChecklistCategory)}
                    className="w-full bg-[#082428] border border-[#1b535c] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#64748b]"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                    Хавф даражаси:
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value as Severity)}
                    className="w-full bg-[#082428] border border-[#1b535c] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#64748b]"
                  >
                    <option value="YUQORI">Юқори (Критик хавф)</option>
                    <option value="ORTA">Ўртача хавф</option>
                    <option value="PAST">Паст хавф</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                  Аниқ цех ҳудуди ёки зонаси: *
                </label>
                <input
                  type="text"
                  required
                  value={formZone}
                  onChange={(e) => setFormZone(e.target.value)}
                  placeholder="Масалан: 14-устун, печ трансформатори блоки, 2-қават"
                  className="w-full bg-[#082428] border border-[#1b535c] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#E9EDF2]/40 focus:outline-none focus:border-[#64748b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                  Бартараф этиш муддати (кун):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setFormDeadlineDays(days)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                        formDeadlineDays === days
                          ? 'bg-[#475569] text-white border-[#64748b]'
                          : 'bg-[#082428] border border-[#1b535c] text-[#E9EDF2] hover:border-[#64748b]'
                      }`}
                    >
                      {days === 1 ? '24 соат' : `${days} кун`}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-[#E9EDF2]/70 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#94a3b8]" />
                  Якуний сана: <span className="font-mono text-white font-bold">{calculateDeadline(formDeadlineDays)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                  Батафсил тавсиф ва норматив талаб: *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Камчилик қандай хавф туғдириши ва қандай техник тадбир бажарилиши лозимлиги..."
                  className="w-full bg-[#082428] border border-[#1b535c] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#E9EDF2]/40 focus:outline-none focus:border-[#64748b]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurring-check"
                  checked={formIsRecurring}
                  onChange={(e) => setFormIsRecurring(e.target.checked)}
                  className="rounded border-[#1b535c] text-[#475569] focus:ring-[#475569]"
                />
                <label htmlFor="recurring-check" className="text-xs font-medium text-[#E9EDF2] cursor-pointer">
                  Бу такрорий қоидабузарлик (цехга олдин ҳам кўрсатма берилган)
                </label>
              </div>
            </div>

            {/* Right Column: Photo Evidence Selection & Preview */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                Камчилик фотосуратини бириктириш (Далил): *
              </label>

              {/* Current Preview */}
              <div className="relative aspect-video rounded-xl overflow-hidden border border-[#1b535c] bg-[#082428] flex items-center justify-center">
                <img
                  src={formPhoto}
                  alt="Камчилик фотоси"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#082428]/90 border border-[#1b535c] text-[#cbd5e1] text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                  ФОТОДАЛИЛ
                </div>
              </div>

              {/* Upload or Preset Selection */}
              <div className="space-y-2">
                <div className="text-xs text-[#E9EDF2]/70 font-semibold">
                  Тайёр металлургия намуналаридан танлаш ёки ўз расмингизни юклаш:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormPhoto(SAMPLE_DEFECT_PHOTOS.hydrantBlocked)}
                    className={`aspect-video rounded-lg overflow-hidden border transition-all ${
                      formPhoto === SAMPLE_DEFECT_PHOTOS.hydrantBlocked
                        ? 'border-[#64748b] ring-2 ring-[#64748b]/50'
                        : 'border-[#1b535c] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={SAMPLE_DEFECT_PHOTOS.hydrantBlocked} alt="Гидрант тўсиқ" className="w-full h-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPhoto(SAMPLE_DEFECT_PHOTOS.cablesDamaged)}
                    className={`aspect-video rounded-lg overflow-hidden border transition-all ${
                      formPhoto === SAMPLE_DEFECT_PHOTOS.cablesDamaged
                        ? 'border-[#64748b] ring-2 ring-[#64748b]/50'
                        : 'border-[#1b535c] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={SAMPLE_DEFECT_PHOTOS.cablesDamaged} alt="Кабел зарар" className="w-full h-full object-cover" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPhoto(SAMPLE_DEFECT_PHOTOS.plantHero)}
                    className={`aspect-video rounded-lg overflow-hidden border transition-all ${
                      formPhoto === SAMPLE_DEFECT_PHOTOS.plantHero
                        ? 'border-[#64748b] ring-2 ring-[#64748b]/50'
                        : 'border-[#1b535c] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={SAMPLE_DEFECT_PHOTOS.plantHero} alt="Цех ҳолати" className="w-full h-full object-cover" />
                  </button>
                </div>

                {/* Upload from device */}
                <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-[#1b535c] hover:border-[#64748b] rounded-xl cursor-pointer bg-[#082428] transition-colors text-xs text-[#E9EDF2]/80 hover:text-white font-semibold">
                  <UploadCloud className="w-4 h-4 text-[#94a3b8]" />
                  <span>Қурилмадан (камера/файл) расм юклаш</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Responsible Officer Card */}
              <div className="p-3.5 bg-[#082428] border border-[#1b535c] rounded-xl text-xs space-y-1">
                <div className="text-[#E9EDF2]/60 font-semibold">Бириктирилувчи цех масъули:</div>
                <div className="text-white font-bold">{selectedWorkshop.manager}</div>
                <div className="text-[#E9EDF2]/80">{selectedWorkshop.fullName}</div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1b535c]">
            <button
              type="button"
              onClick={() => setActiveSubTab('CHECKLIST')}
              className="px-4 py-2.5 text-xs font-bold text-[#E9EDF2]/70 hover:text-white"
            >
              Бекор қилиш
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-extrabold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-industrial active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Камчиликни киритиш ва топшириқ бериш
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
