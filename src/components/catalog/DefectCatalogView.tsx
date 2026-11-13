import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Power, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Building2,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { DefectCatalogItem, ChecklistCategory, Severity, EmployeeUser, Language } from '../../types';
import { CATALOG_CATEGORIES } from '../../data/catalog100';

interface DefectCatalogViewProps {
  catalog: DefectCatalogItem[];
  currentUser: EmployeeUser;
  onAddCatalogItem: (item: Omit<DefectCatalogItem, 'id' | 'timesDetected'>) => void;
  onUpdateCatalogItem: (id: string, updates: Partial<DefectCatalogItem>) => void;
  language: Language;
}

export const DefectCatalogView: React.FC<DefectCatalogViewProps> = ({
  catalog,
  currentUser,
  onAddCatalogItem,
  onUpdateCatalogItem,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<DefectCatalogItem | null>(null);

  const [formData, setFormData] = useState<{
    code: string;
    category: ChecklistCategory;
    categoryName: string;
    title: string;
    description: string;
    defaultSeverity: Severity;
    standardNorm: string;
    deadlineDays: number;
    isActive: boolean;
  }>({
    code: '',
    category: 'YONGIN_OCHIRISH',
    categoryName: 'Бирламчи ёнғин ўчириш воситалари',
    title: '',
    description: '',
    defaultSeverity: 'YUQORI',
    standardNorm: 'ГОСТ 12.4.009-83',
    deadlineDays: 3,
    isActive: true,
  });

  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'INSPECTOR';

  const filteredCatalog = catalog.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedSeverity !== 'ALL' && item.defaultSeverity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      const matchNorm = item.standardNorm.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchNorm && !matchDesc) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      code: `DEF-${catalog.length + 1}`,
      category: 'YONGIN_OCHIRISH',
      categoryName: 'Бирламчи ёнғин ўчириш воситалари',
      title: '',
      description: '',
      defaultSeverity: 'YUQORI',
      standardNorm: 'ГОСТ 12.4.009-83',
      deadlineDays: 3,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DefectCatalogItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      category: item.category,
      categoryName: item.categoryName,
      title: item.title,
      description: item.description,
      defaultSeverity: item.defaultSeverity,
      standardNorm: item.standardNorm,
      deadlineDays: item.deadlineDays,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const catObj = CATALOG_CATEGORIES.find((c) => c.code === formData.category);
    const categoryName = language === 'UZ' ? catObj?.labelUz || '' : catObj?.labelRu || '';

    if (editingItem) {
      onUpdateCatalogItem(editingItem.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        categoryName: categoryName || formData.categoryName,
        defaultSeverity: formData.defaultSeverity,
        standardNorm: formData.standardNorm,
        deadlineDays: formData.deadlineDays,
        isActive: formData.isActive,
      });
    } else {
      onAddCatalogItem({
        code: formData.code,
        category: formData.category,
        categoryName: categoryName || formData.categoryName,
        title: formData.title,
        description: formData.description,
        defaultSeverity: formData.defaultSeverity,
        standardNorm: formData.standardNorm,
        deadlineDays: formData.deadlineDays,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = (item: DefectCatalogItem) => {
    onUpdateCatalogItem(item.id, { isActive: !item.isActive });
  };

  return (
    <div className="space-y-6 select-none">
      {/* Banner */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 sm:p-8 shadow-industrial">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#082428] border border-[#1b535c] text-[#94a3b8] shadow-inner shrink-0">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-black text-[#94a3b8] uppercase tracking-wider mb-1">
                <span>{language === 'UZ' ? 'Электрон классификатор' : 'Электронный классификатор'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#475569]/30 border border-[#64748b]/40 text-[#cbd5e1]">
                  {catalog.length} ТА БАНД
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {language === 'UZ' ? 'Ёнғин хавфсизлиги камчиликлари каталоги' : 'Каталог нарушений пожарной безопасности'}
              </h2>
              <p className="text-xs sm:text-sm text-[#E9EDF2]/80 mt-1 max-w-3xl">
                {language === 'UZ' 
                  ? 'Металлургия мажмуаси бўйича 100 дан ортиқ стандарт ёнғин хавфи камчиликлари, меъёрий асослари (ГОСТ, ШНК, ҚМҚ) ва бартараф этиш муддатлари электрон банки'
                  : 'Классификатор более 100 типовых нарушений пожарной безопасности с нормативными ссылками (ГОСТ, ШНК, КМК)'}
              </p>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-5 py-3 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer self-start lg:self-auto whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{language === 'UZ' ? 'Каталогга янги камчилик қўшиш' : 'Добавить замечание'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Snapshot guarantee note */}
      <div className="p-3.5 rounded-2xl bg-[#082428] border border-[#1b535c] flex items-center gap-2.5 text-xs text-[#E9EDF2]/75">
        <Info className="w-4 h-4 text-[#94a3b8] shrink-0" />
        <span className="leading-relaxed">
          {language === 'UZ'
            ? 'Тарихий нусха муҳофазаси: Каталогдаги номлар кейинчалик ўзгартирилса ёки нофаол қилинса ҳам, олдинги текширув карточкаларида камчиликнинг аниқланган пайтдаги тарихий нусхаси (Snapshot) ўзгармасдан тўлиқ сақланади.'
            : 'Защита исторических снимков: Изменение каталога не затрагивает ранее оформленные акты и карточки проверок.'}
        </span>
      </div>

      {/* Filter Categories */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-4 shadow-industrial space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#475569] text-white border border-[#64748b] font-black shadow-md'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            {language === 'UZ' ? 'Барча тоифалар' : 'Все категории'} ({catalog.length})
          </button>

          {CATALOG_CATEGORIES.map((cat) => {
            const count = catalog.filter((c) => c.category === cat.code).length;
            const label = language === 'UZ' ? cat.labelUz : cat.labelRu;

            return (
              <button
                key={cat.code}
                type="button"
                onClick={() => setSelectedCategory(cat.code)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.code
                    ? 'bg-[#475569] text-white border border-[#64748b] font-black shadow-md'
                    : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  selectedCategory === cat.code ? 'bg-[#334155] text-white' : 'bg-[#154c55] text-white'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Severity Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#1b535c]">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E9EDF2]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'UZ' ? 'Камчилик номи, меъёр (ГОСТ) ёки коди бўйича қидириш...' : 'Поиск по коду, ГОСТ или названию...'}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs placeholder:text-[#E9EDF2]/40 focus:outline-none focus:border-[#64748b]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#E9EDF2]/60 font-mono">
              {language === 'UZ' ? 'Топилди:' : 'Найдено:'} <strong className="text-white font-bold">{filteredCatalog.length}</strong> та
            </span>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs font-bold"
            >
              <option value="ALL">{language === 'UZ' ? 'Барча хавф даражалари' : 'Все приоритеты'}</option>
              <option value="YUQORI">{language === 'UZ' ? 'Юқори (Критик)' : 'Высокий'}</option>
              <option value="ORTA">{language === 'UZ' ? 'Ўртача' : 'Средний'}</option>
              <option value="PAST">{language === 'UZ' ? 'Паст хавф' : 'Низкий'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl overflow-hidden shadow-industrial">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082428] border-b border-[#1b535c] text-[#E9EDF2]/80 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">{language === 'UZ' ? 'Код' : 'Код'}</th>
                <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Камчилик мазмуни ва тавсифи' : 'Наименование дефекта'}</th>
                <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Тоифа' : 'Категория'}</th>
                <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Меъёрий асос' : 'Норматив'}</th>
                <th className="py-3.5 px-3 font-bold text-center">{language === 'UZ' ? 'Муддат' : 'Срок'}</th>
                <th className="py-3.5 px-3 font-bold text-center">{language === 'UZ' ? 'Хавф' : 'Риск'}</th>
                <th className="py-3.5 px-3 font-bold text-center">{language === 'UZ' ? 'Ҳолат' : 'Статус'}</th>
                {canEdit && (
                  <th className="py-3.5 px-4 font-bold text-right">{language === 'UZ' ? 'Амаллар' : 'Действия'}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b535c]/60 text-white">
              {filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#E9EDF2]/60">
                    <BookOpen className="w-8 h-8 text-[#94a3b8] mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-bold text-white">
                      {language === 'UZ' ? 'Каталогда бундай банд топилмади' : 'В каталоге ничего не найдено'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCatalog.map((item) => {
                  return (
                    <tr key={item.id} className={`hover:bg-[#12454d] transition-colors ${!item.isActive ? 'opacity-50 bg-[#082428]/40' : ''}`}>
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-black text-xs text-[#cbd5e1] whitespace-nowrap">
                        {item.code}
                      </td>

                      {/* Title & Description */}
                      <td className="py-3.5 px-3 max-w-md">
                        <div className="font-extrabold text-xs text-white leading-snug">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-[#E9EDF2]/70 mt-0.5 truncate" title={item.description}>
                          {item.description}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 text-[11px] text-[#E9EDF2]/75 font-mono whitespace-nowrap">
                        {item.categoryName}
                      </td>

                      {/* Standard Norm */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-[#10b981] whitespace-nowrap">
                        {item.standardNorm}
                      </td>

                      {/* Deadline Days */}
                      <td className="py-3.5 px-3 text-center font-mono text-xs whitespace-nowrap">
                        <span className="font-bold text-white">{item.deadlineDays}</span> {language === 'UZ' ? 'кун' : 'дней'}
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {item.defaultSeverity === 'YUQORI' && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30">
                            {language === 'UZ' ? 'Юқори' : 'Высокий'}
                          </span>
                        )}
                        {item.defaultSeverity === 'ORTA' && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#475569]/30 text-[#cbd5e1] border border-[#64748b]/40">
                            {language === 'UZ' ? 'Ўрта' : 'Средний'}
                          </span>
                        )}
                        {item.defaultSeverity === 'PAST' && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#15464f] text-[#E9EDF2] border border-[#225761]">
                            {language === 'UZ' ? 'Паст' : 'Низкий'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {item.isActive ? (
                          <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/30">
                            {language === 'UZ' ? 'Фаол' : 'Активен'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-[#E9EDF2]/40 bg-[#082428] px-2 py-0.5 rounded border border-[#1b535c]">
                            {language === 'UZ' ? 'Нофаол' : 'Неактивен'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      {canEdit && (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg bg-[#082428] text-[#E9EDF2] hover:text-[#cbd5e1] hover:bg-[#154c55] border border-[#1b535c] transition-colors cursor-pointer"
                              title="Таҳрирлаш"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(item)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                item.isActive
                                  ? 'bg-[#082428] text-[#10b981] hover:text-[#ef4444] border-[#1b535c]'
                                  : 'bg-[#082428] text-[#E9EDF2]/40 hover:text-[#10b981] border-[#1b535c]'
                              }`}
                              title={item.isActive ? 'Нофаол қилиш' : 'Фаоллаштириш'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 shadow-2xl text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b535c]">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#94a3b8]" />
                <h4 className="font-black text-sm text-white">
                  {editingItem 
                    ? (language === 'UZ' ? 'Каталог бандини таҳрирлаш' : 'Редактировать пункт каталога') 
                    : (language === 'UZ' ? 'Каталогга янги камчилик тури қўшиш' : 'Добавить новый пункт')}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#E9EDF2]/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">
                    {language === 'UZ' ? 'Камчилик коди:' : 'Код дефекта:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">
                    {language === 'UZ' ? 'Тоифа:' : 'Категория:'}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ChecklistCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-bold"
                  >
                    {CATALOG_CATEGORIES.map((cat) => (
                      <option key={cat.code} value={cat.code}>
                        {cat.labelUz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">
                  {language === 'UZ' ? 'Камчилик тўлиқ номи: *' : 'Наименование замечания: *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Масалан: Ўт ўчиргичнинг босим манометри кўрсаткичи қизил зонада..."
                  className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">
                  {language === 'UZ' ? 'Тавсифи ва хавф сабаби:' : 'Описание и опасность:'}
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Аниқланган ҳолатдаги хавф ва унинг оқибатлари..."
                  className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">
                    {language === 'UZ' ? 'Меъёрий асос:' : 'Норматив:'}
                  </label>
                  <input
                    type="text"
                    value={formData.standardNorm}
                    onChange={(e) => setFormData({ ...formData, standardNorm: e.target.value })}
                    placeholder="ГОСТ 12.4.009-83"
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">
                    {language === 'UZ' ? 'Хавф даражаси:' : 'Приоритет:'}
                  </label>
                  <select
                    value={formData.defaultSeverity}
                    onChange={(e) => setFormData({ ...formData, defaultSeverity: e.target.value as Severity })}
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-bold"
                  >
                    <option value="YUQORI">Юқори (Критик)</option>
                    <option value="ORTA">Ўртача</option>
                    <option value="PAST">Паст хавф</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">
                    {language === 'UZ' ? 'Муддат (кун):' : 'Срок (дней):'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formData.deadlineDays}
                    onChange={(e) => setFormData({ ...formData, deadlineDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b535c]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#082428] text-[#E9EDF2] hover:text-white border border-[#1b535c] font-bold"
                >
                  {language === 'UZ' ? 'Бекор қилиш' : 'Отмена'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  {language === 'UZ' ? 'Сақлаш' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
