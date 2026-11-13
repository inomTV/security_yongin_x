import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  ClipboardCheck, 
  Building2, 
  MapPin, 
  User, 
  Calendar, 
  Camera, 
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Search,
  UploadCloud
} from 'lucide-react';
import { 
  InspectionSession, 
  DefectItem, 
  Workshop, 
  EmployeeUser, 
  DefectCatalogItem, 
  Severity,
  Language 
} from '../../types';
import { SAMPLE_DEFECT_PHOTOS } from '../../data/mockData';

interface NewInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshops: Workshop[];
  employees: EmployeeUser[];
  catalog: DefectCatalogItem[];
  currentUser: EmployeeUser;
  nextInspectionId: string;
  nextDefectNumber: number;
  onSubmitInspection: (
    inspection: InspectionSession, 
    defects: Omit<DefectItem, 'id' | 'history'>[]
  ) => void;
  language: Language;
}

interface DraftDefect {
  tempId: string;
  catalogItemId: string;
  catalogTitle: string;
  catalogCategory: DefectCatalogItem['category'];
  categoryName: string;
  zone: string;
  description: string;
  priority: Severity;
  deadlineDays: number;
  responsibleEmployeeId: string;
  responsiblePerson: string;
  photoBefore: string;
  videoUrl?: string;
}

export const NewInspectionModal: React.FC<NewInspectionModalProps> = ({
  isOpen,
  onClose,
  workshops,
  employees,
  catalog,
  currentUser,
  nextInspectionId,
  nextDefectNumber,
  onSubmitInspection,
  language,
}) => {
  if (!isOpen) return null;

  const activeWorkshops = workshops.filter((w) => w.isActive);
  const [selectedWorkshopCode, setSelectedWorkshopCode] = useState<string>(activeWorkshops[0]?.code || 'СПЦ');
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [draftDefects, setDraftDefects] = useState<DraftDefect[]>([]);

  // Catalog picker sub-modal state
  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState<boolean>(false);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('ALL');

  const selectedWorkshop = workshops.find((w) => w.code === selectedWorkshopCode) || workshops[0];

  // Employees in selected workshop
  const workshopEmployees = employees.filter(
    (e) => e.workshopCode === selectedWorkshopCode || e.workshopCode === 'ALL'
  );
  const defaultResponsible = workshopEmployees.find((e) => e.role === 'RESPONSIBLE_EMPLOYEE') || workshopEmployees[0] || employees[0];

  // Filter catalog items
  const filteredCatalog = catalog.filter((c) => {
    if (!c.isActive) return false;
    if (catalogCategoryFilter !== 'ALL' && c.category !== catalogCategoryFilter) return false;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSelectCatalogItem = (item: DefectCatalogItem) => {
    const newDraft: DraftDefect = {
      tempId: `draft-${Date.now()}-${Math.random()}`,
      catalogItemId: item.id,
      catalogTitle: item.title,
      catalogCategory: item.category,
      categoryName: item.categoryName,
      zone: location ? `${selectedWorkshop.code} — ${location}` : `${selectedWorkshop.code} ишлаб чиқариш майдони`,
      description: item.description,
      priority: item.defaultSeverity,
      deadlineDays: item.deadlineDays || 3,
      responsibleEmployeeId: defaultResponsible?.id || 'USR-005',
      responsiblePerson: defaultResponsible?.fullName || 'Тўхтамишев Олим Саидович',
      photoBefore: SAMPLE_DEFECT_PHOTOS.hydrantBlocked,
    };

    setDraftDefects((prev) => [...prev, newDraft]);
    setIsCatalogPickerOpen(false);
  };

  const handleRemoveDraftDefect = (tempId: string) => {
    setDraftDefects((prev) => prev.filter((d) => d.tempId !== tempId));
  };

  const handleUpdateDraft = (tempId: string, updates: Partial<DraftDefect>) => {
    setDraftDefects((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, ...updates } : d))
    );
  };

  const handlePhotoUpload = (tempId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateDraft(tempId, { photoBefore: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit with defects
  const handleFinalSubmitWithDefects = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert(language === 'UZ' ? 'Илтимос, текширилаётган жойни киритинг' : 'Укажите проверяемый участок');
      return;
    }

    if (draftDefects.length === 0) {
      alert(language === 'UZ' ? 'Камчиликлар қўшинг ёки «Камчилик аниқланмади» тугмасини танланг' : 'Добавьте дефекты или нажмите «Нарушений не обнаружено»');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const inspection: InspectionSession = {
      id: nextInspectionId,
      date: todayStr,
      workshopCode: selectedWorkshop.code,
      workshopName: selectedWorkshop.name,
      location: location.trim(),
      inspectorId: currentUser.id,
      inspectorName: currentUser.fullName,
      notes: notes.trim(),
      status: 'JARAYONDA',
      defectsCount: draftDefects.length,
      resolvedCount: 0,
      createdAt: nowStr,
    };

    const preparedDefects: Omit<DefectItem, 'id' | 'history'>[] = draftDefects.map((draft, idx) => {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + (draft.deadlineDays || 3));
      const deadlineStr = deadlineDate.toISOString().split('T')[0];

      return {
        inspectionId: nextInspectionId,
        catalogItemId: draft.catalogItemId,
        catalogTitleSnapshot: draft.catalogTitle,
        catalogCategorySnapshot: draft.catalogCategory,
        categoryNameSnapshot: draft.categoryName,
        workshopCode: selectedWorkshop.code,
        workshopName: selectedWorkshop.name,
        zone: draft.zone || location,
        detectedDate: todayStr,
        deadline: deadlineStr,
        isOverdue: false,
        status: 'BIRIKTIRILGAN',
        priority: draft.priority,
        inspectorId: currentUser.id,
        inspectorName: currentUser.fullName,
        responsibleEmployeeId: draft.responsibleEmployeeId,
        responsiblePerson: draft.responsiblePerson,
        description: draft.description,
        photoBefore: draft.photoBefore,
        videoUrl: draft.videoUrl,
        isRecurring: false,
      };
    });

    onSubmitInspection(inspection, preparedDefects);
    onClose();
  };

  // Submit Clean Inspection (No defects found)
  const handleCleanInspectionSubmit = () => {
    if (!location.trim()) {
      alert(language === 'UZ' ? 'Илтимос, текширилаётган жойни киритинг' : 'Укажите проверяемый участок');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const inspection: InspectionSession = {
      id: nextInspectionId,
      date: todayStr,
      workshopCode: selectedWorkshop.code,
      workshopName: selectedWorkshop.name,
      location: location.trim(),
      inspectorId: currentUser.id,
      inspectorName: currentUser.fullName,
      notes: notes.trim() || (language === 'UZ' ? 'Профилактик кўрикда камчиликлар аниқланмади.' : 'Нарушений не выявлено.'),
      status: 'KAMCHILIK_ANIQLANMADI',
      defectsCount: 0,
      resolvedCount: 0,
      createdAt: nowStr,
    };

    onSubmitInspection(inspection, []);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
      <div 
        className="relative w-full max-w-4xl bg-[#0f3b42] border border-[#1b535c] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1b535c] bg-[#071f23] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#334155]/60 text-white border border-[#64748b]/50">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-white bg-[#334155]/60 px-2 py-0.5 rounded border border-[#64748b]/50">
                  {nextInspectionId}
                </span>
                <h3 className="font-black text-base text-white">
                  {language === 'UZ' ? 'Янги ёнғин хавфсизлиги текшируви далолатномаси' : 'Новый акт проверки пожарной безопасности'}
                </h3>
              </div>
              <p className="text-xs text-[#E9EDF2]/70 mt-0.5">
                {language === 'UZ' ? 'Ҳар бир текширув мустақил карточка сифатида расмийлаштирилади' : 'Каждая проверка оформляется независимой карточкой'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#E9EDF2]/60 hover:text-white hover:bg-[#154c55] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Inspection Metadata Fields */}
          <div className="p-4 rounded-2xl bg-[#082428] border border-[#1b535c] space-y-4">
            <h4 className="font-extrabold text-[#cbd5e1] text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
              <Building2 className="w-4 h-4" />
              <span>{language === 'UZ' ? 'Текширув асосий маълумотлари' : 'Основные параметры проверки'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Workshop selector */}
              <div>
                <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                  {language === 'UZ' ? 'Текширилаётган цех: *' : 'Проверяемый цех: *'}
                </label>
                <select
                  value={selectedWorkshopCode}
                  onChange={(e) => setSelectedWorkshopCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0f3b42] border border-[#1b535c] text-white focus:outline-none focus:border-[#64748b] font-bold"
                >
                  {activeWorkshops.map((ws) => (
                    <option key={ws.code} value={ws.code}>
                      {ws.code} — {ws.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                  {language === 'UZ' ? 'Аниқ жой / Участка: *' : 'Точный участок: *'}
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Масалан: 1-сонли печ ва гидравлика станцияси"
                  className="w-full px-3 py-2 rounded-xl bg-[#0f3b42] border border-[#1b535c] text-white focus:outline-none focus:border-[#64748b]"
                />
              </div>

              {/* Inspector */}
              <div>
                <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                  {language === 'UZ' ? 'Назоратчи (Автоматик):' : 'Инспектор:'}
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.fullName}
                  className="w-full px-3 py-2 rounded-xl bg-[#0b2e34] border border-[#1b535c] text-[#E9EDF2]/80 font-bold cursor-not-allowed"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                {language === 'UZ' ? 'Текширув бўйича умумий изоҳ:' : 'Примечание к проверке:'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Текширув мақсади ёки қўшимча кўрсатмалар..."
                className="w-full px-3 py-2 rounded-xl bg-[#0f3b42] border border-[#1b535c] text-white focus:outline-none focus:border-[#64748b]"
              />
            </div>
          </div>

          {/* Defects in this Inspection */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#cbd5e1]" />
                  <span>
                    {language === 'UZ' ? 'Аниқланган камчиликлар рўйхати' : 'Выявленные замечания'}
                  </span>
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-[#334155]/60 text-white border border-[#64748b]/50">
                    {draftDefects.length} та
                  </span>
                </h4>
                <p className="text-[11px] text-[#E9EDF2]/60 mt-0.5">
                  {language === 'UZ' ? '115+ талик каталог орқали бир нечта камчилик киритиш мумкин' : 'Выберите выявленные замечания из каталога'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCatalogPickerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#082428] hover:bg-[#154c55] border border-[#1b535c] text-[#cbd5e1] hover:text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <BookOpen className="w-3.5 h-3.5" />
                <span>{language === 'UZ' ? 'Каталогдан камчилик танлаш' : 'Выбрать из каталога'}</span>
              </button>
            </div>

            {/* List of Added Draft Defects */}
            {draftDefects.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#082428]/60 border border-dashed border-[#1b535c] text-center">
                <BookOpen className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2 opacity-60" />
                <p className="text-xs font-bold text-white">
                  {language === 'UZ' ? 'Ҳозирча камчилик қўшилмади' : 'Замечания пока не добавлены'}
                </p>
                <p className="text-[11px] text-[#E9EDF2]/60 mt-1 max-w-md mx-auto">
                  {language === 'UZ' 
                    ? 'Агар текширувда камчилик топилмаган бўлса, пастдаги «Камчилик аниқланмади» тугмасини босиб тоза далолатномани расмийлаштиринг.'
                    : 'Если нарушений нет, нажмите кнопку «Нарушений не обнаружено» для составления чистого акта.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {draftDefects.map((defect, index) => {
                  return (
                    <div
                      key={defect.tempId}
                      className="p-4 rounded-2xl bg-[#082428] border border-[#1b535c] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-[#334155]/60 text-white font-mono font-black flex items-center justify-center shrink-0 border border-[#64748b]/50">
                            {index + 1}
                          </span>
                          <div>
                            <div className="font-black text-white text-xs leading-snug">
                              {defect.catalogTitle}
                            </div>
                            <span className="text-[10px] text-[#E9EDF2]/60 font-mono">
                              {defect.categoryName}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveDraftDefect(defect.tempId)}
                          className="p-1 rounded-lg text-[#E9EDF2]/40 hover:text-[#ef4444] hover:bg-[#154c55] transition-colors cursor-pointer"
                          title="Ўчириш"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Defect Details row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        {/* Priority */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#E9EDF2]/80 mb-1">
                            {language === 'UZ' ? 'Устуворлик:' : 'Приоритет:'}
                          </label>
                          <select
                            value={defect.priority}
                            onChange={(e) => handleUpdateDraft(defect.tempId, { priority: e.target.value as Severity })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f3b42] border border-[#1b535c] text-white font-bold"
                          >
                            <option value="YUQORI">{language === 'UZ' ? 'Юқори (Критик)' : 'Высокий (Критический)'}</option>
                            <option value="ORTA">{language === 'UZ' ? 'Ўрта' : 'Средний'}</option>
                            <option value="PAST">{language === 'UZ' ? 'Паст хавф' : 'Низкий'}</option>
                          </select>
                        </div>

                        {/* Responsible Person */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#E9EDF2]/80 mb-1">
                            {language === 'UZ' ? 'Масъул ходим:' : 'Ответственный:'}
                          </label>
                          <select
                            value={defect.responsibleEmployeeId}
                            onChange={(e) => {
                              const emp = employees.find((em) => em.id === e.target.value);
                              handleUpdateDraft(defect.tempId, {
                                responsibleEmployeeId: e.target.value,
                                responsiblePerson: emp?.fullName || 'Масъул ходим',
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f3b42] border border-[#1b535c] text-white font-bold"
                          >
                            {workshopEmployees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.fullName} ({emp.badgeNumber}) - {emp.role}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Deadline Days */}
                        <div>
                          <label className="block text-[11px] font-bold text-[#E9EDF2]/80 mb-1">
                            {language === 'UZ' ? 'Муддат (кун):' : 'Срок (дней):'}
                          </label>
                          <select
                            value={defect.deadlineDays}
                            onChange={(e) => handleUpdateDraft(defect.tempId, { deadlineDays: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f3b42] border border-[#1b535c] text-white font-bold font-mono"
                          >
                            <option value={1}>1 кун (Тезкор)</option>
                            <option value={2}>2 кун</option>
                            <option value={3}>3 кун (Стандарт)</option>
                            <option value={5}>5 кун</option>
                            <option value={7}>7 кун (1 ҳафта)</option>
                            <option value={10}>10 кун</option>
                          </select>
                        </div>
                      </div>

                      {/* Photo & Description */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-[#E9EDF2]/80 mb-1">
                            {language === 'UZ' ? 'Аниқланган ҳолат изоҳи:' : 'Описание дефекта:'}
                          </label>
                          <input
                            type="text"
                            value={defect.description}
                            onChange={(e) => handleUpdateDraft(defect.tempId, { description: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-[#0f3b42] border border-[#1b535c] text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#E9EDF2]/80 mb-1">
                            {language === 'UZ' ? 'Фото сурат:' : 'Фото дефекта:'}
                          </label>
                          <label className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#0f3b42] hover:bg-[#154c55] border border-[#1b535c] text-white font-bold cursor-pointer transition-colors">
                            <Camera className="w-3.5 h-3.5 text-[#cbd5e1]" />
                            <span className="truncate">{language === 'UZ' ? 'Юклаш' : 'Загрузить'}</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload(defect.tempId, e)}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[#1b535c] bg-[#071f23] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCleanInspectionSubmit}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#10b981]/15 hover:bg-[#10b981]/25 text-[#10b981] border border-[#10b981]/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="Камчилик аниқланмаган ҳолатда тоза далолатнома тузиш"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'UZ' ? '«Камчилик аниқланмади» деб якунлаш' : '«Нарушений не обнаружено»'}</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#082428] text-[#E9EDF2] hover:text-white border border-[#1b535c] font-bold text-xs cursor-pointer"
            >
              {language === 'UZ' ? 'Бекор қилиш' : 'Отмена'}
            </button>

            <button
              type="button"
              disabled={draftDefects.length === 0}
              onClick={handleFinalSubmitWithDefects}
              className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                draftDefects.length > 0
                  ? 'bg-[#475569] hover:bg-[#334155] text-white border border-[#64748b] cursor-pointer'
                  : 'bg-[#154c55] text-[#E9EDF2]/40 cursor-not-allowed'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>{language === 'UZ' ? 'Далолатномани расмийлаштириш' : 'Оформить акт'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Picker Sub-Modal */}
      {isCatalogPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-[#0a272c] border border-[#1b535c] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-white">
            <div className="p-4 border-b border-[#1b535c] bg-[#071f23] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#cbd5e1]" />
                <h4 className="font-extrabold text-sm text-white">
                  {language === 'UZ' ? '115+ талик ёнғин хавфсизлиги камчиликлари каталоги' : 'Каталог нарушений пожарной безопасности (115+)'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogPickerOpen(false)}
                className="p-1 rounded-lg text-[#E9EDF2]/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="p-3 border-b border-[#1b535c] bg-[#082428] flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E9EDF2]/40" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder={language === 'UZ' ? 'Камчилик номи ёки коди бўйича қидириш...' : 'Поиск по коду или названию...'}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0f3b42] border border-[#1b535c] text-white text-xs focus:outline-none focus:border-[#64748b]"
                />
              </div>

              <select
                value={catalogCategoryFilter}
                onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#0f3b42] border border-[#1b535c] text-white text-xs font-bold"
              >
                <option value="ALL">{language === 'UZ' ? 'Барча тоифалар' : 'Все категории'}</option>
                <option value="YONGIN_OCHIRISH">Бирламчи ёнғин ўчириш воситалари</option>
                <option value="EVAKUATSIYA">Эвакуация йўллари</option>
                <option value="ELEKTR_TIZIMI">Электр хўжалиги</option>
                <option value="AVTOMATIKA">Автоматик сигнализация</option>
                <option value="SUV_TARMOGI">Ёнғин сув тармоғи</option>
                <option value="ISSIQLIK_GAZ">Печлар ва газ ускуналари</option>
                <option value="YONUVCHI_MOYLAR">Ёнувчи мойлар ва баллонлар</option>
                <option value="XAVFSIZLIK_BELGILARI">Хавфсизлик белгилари</option>
              </select>
            </div>

            {/* Catalog Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1b535c]/50 p-2 custom-scrollbar text-xs">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectCatalogItem(item)}
                  className="p-3 hover:bg-[#12454d] rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-black text-white bg-[#334155]/60 px-1.5 py-0.2 rounded border border-[#64748b]/50">
                        {item.code}
                      </span>
                      <span className="text-[10px] text-[#E9EDF2]/60 font-mono">
                        {item.categoryName}
                      </span>
                      <span className="text-[10px] font-mono text-[#10b981]">
                        {item.standardNorm}
                      </span>
                    </div>

                    <h5 className="font-bold text-white text-xs mt-1 group-hover:text-[#cbd5e1] transition-colors leading-snug">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-[#E9EDF2]/70 mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="p-1.5 rounded-lg bg-[#475569] text-white font-black group-hover:bg-[#334155] border border-[#64748b] transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
