import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  MapPin, 
  User, 
  Send, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  UploadCloud, 
  Eye, 
  Video, 
  Lock,
  Search,
  Filter,
  X
} from 'lucide-react';
import { DefectItem, DefectStatus, EmployeeUser, Language } from '../../types';
import { SAMPLE_DEFECT_PHOTOS } from '../../data/mockData';

interface MyTasksViewProps {
  defects: DefectItem[];
  currentUser: EmployeeUser;
  onSubmitResolution: (defectId: string, note: string, photo?: string, videoUrl?: string) => void;
  onSelectDefect: (defect: DefectItem) => void;
  language: Language;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  defects,
  currentUser,
  onSubmitResolution,
  onSelectDefect,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'IN_REVIEW' | 'COMPLETED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Remediation modal state
  const [selectedTask, setSelectedTask] = useState<DefectItem | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [resolutionPhoto, setResolutionPhoto] = useState<string>(SAMPLE_DEFECT_PHOTOS.fixedStation);
  const [videoUrl, setVideoUrl] = useState<string>('');

  // Filter defects for current user
  // If responsible employee, only show their assignments!
  const myDefects = defects.filter((d) => {
    if (currentUser.role === 'RESPONSIBLE_EMPLOYEE') {
      return d.responsibleEmployeeId === currentUser.id || d.responsiblePerson.includes(currentUser.fullName);
    }
    if (currentUser.role === 'WORKSHOP_HEAD') {
      return d.workshopCode === currentUser.workshopCode;
    }
    // Admin sees all
    return true;
  });

  const pendingTasks = myDefects.filter(
    (d) => d.status === 'YANGI' || d.status === 'BIRIKTIRILGAN' || d.status === 'BAJARILMOQDA' || d.status === 'QAYTA_ISHLASHGA_QAYTARILGAN' || d.status === 'MUDDATI_OTGAN'
  );
  const inReviewTasks = myDefects.filter((d) => d.status === 'TEKSHIRUVGA_YUBORILGAN');
  const completedTasks = myDefects.filter((d) => d.status === 'YOPILGAN');

  const currentList = activeTab === 'PENDING' ? pendingTasks : activeTab === 'IN_REVIEW' ? inReviewTasks : completedTasks;

  const filteredTasks = currentList.filter((d) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        (d.catalogTitleSnapshot || d.title || '').toLowerCase().includes(q) ||
        d.zone.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenRemediate = (defect: DefectItem) => {
    setSelectedTask(defect);
    setResolutionNote('');
    setResolutionPhoto(SAMPLE_DEFECT_PHOTOS.fixedStation);
    setVideoUrl('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResolutionPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !resolutionNote.trim()) {
      alert(language === 'UZ' ? 'Илтимос, бажарилган иш ҳақида изоҳ ёзинг' : 'Напишите комментарий о выполненной работе');
      return;
    }

    onSubmitResolution(selectedTask.id, resolutionNote.trim(), resolutionPhoto, videoUrl.trim() || undefined);
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Banner */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 sm:p-8 shadow-industrial">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#082428] border border-[#1b535c] text-[#cbd5e1] shadow-inner shrink-0">
              <CheckSquare className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E9EDF2]/80 uppercase tracking-wider mb-1">
                <span>{language === 'UZ' ? 'Ижрочи иш столи' : 'Рабочий стол исполнителя'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#0b2e34] text-[#E9EDF2] border border-[#1b535c]">
                  {currentUser.fullName} ({currentUser.badgeNumber})
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {language === 'UZ' ? 'Бириктирилган камчиликлар ва ижро назорати' : 'Мои задачи по устранению замечаний'}
              </h2>
              <p className="text-xs sm:text-sm text-[#E9EDF2]/80 mt-1 max-w-2xl">
                {language === 'UZ' 
                  ? 'Сизга бириктирилган камчиликларни бартараф этиб, фото далил юкланг ва назоратчига текширувга юборинг.'
                  : 'Устраните замечания, прикрепите фотоотчет и отправьте на проверку пожарному инспектору.'}
              </p>
            </div>
          </div>

          {/* Strict Role Guard Notice */}
          <div className="p-3 rounded-xl bg-[#082428] border border-[#1b535c] flex items-center gap-2.5 text-xs text-[#E9EDF2] self-start sm:self-auto">
            <Lock className="w-4 h-4 text-[#cbd5e1] shrink-0" />
            <div>
              <div className="font-bold text-[#cbd5e1]">
                {language === 'UZ' ? 'ТЗ Талаби: Ёпиш ҳуқуқи йўқ' : 'Закрытие запрещено'}
              </div>
              <div className="text-[10px] text-[#E9EDF2]/70">
                {language === 'UZ' ? 'Камчилик фақат назоратчи томонидан қабул қилиниб ёпилади' : 'Замечание закрывает только инспектор'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-3 shadow-industrial">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'PENDING'
                ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            <span>{language === 'UZ' ? 'Ижродаги вазифалар' : 'В работе'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
              activeTab === 'PENDING' ? 'bg-[#1e293b] text-white' : 'bg-[#154c55] text-white'
            }`}>
              {pendingTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('IN_REVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'IN_REVIEW'
                ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            <span>{language === 'UZ' ? 'Текширувда' : 'На проверке'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
              activeTab === 'IN_REVIEW' ? 'bg-[#1e293b] text-white' : 'bg-[#154c55] text-white'
            }`}>
              {inReviewTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'COMPLETED'
                ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
            }`}
          >
            <span>{language === 'UZ' ? 'Ёпилганлар' : 'Закрытые'}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-black ${
              activeTab === 'COMPLETED' ? 'bg-[#1e293b] text-white' : 'bg-[#154c55] text-white'
            }`}>
              {completedTasks.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E9EDF2]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'UZ' ? 'Вазифалар ичидан қидириш...' : 'Поиск по задачам...'}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs focus:outline-none focus:border-[#64748b]"
          />
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0f3b42] border border-[#1b535c] text-center text-white">
          <CheckCircle2 className="w-10 h-10 text-[#10b981] mx-auto mb-2 opacity-80" />
          <h3 className="font-bold text-base">
            {language === 'UZ' ? 'Ушбу бўлимда вазифалар мавжуд эмас' : 'В этом разделе задач нет'}
          </h3>
          <p className="text-xs text-[#E9EDF2]/60 mt-1">
            {language === 'UZ' ? 'Барча бириктирилган камчиликлар бартараф этилган' : 'Все назначенные замечания выполнены'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isOverdue = task.isOverdue || task.status === 'MUDDATI_OTGAN';
            const isReturned = task.status === 'QAYTA_ISHLASHGA_QAYTARILGAN';

            return (
              <div
                key={task.id}
                className={`p-5 rounded-3xl bg-[#0f3b42] border transition-all space-y-4 shadow-industrial ${
                  isOverdue
                    ? 'border-[#ef4444] ring-1 ring-[#ef4444]/40'
                    : isReturned
                      ? 'border-[#64748b] ring-1 ring-[#64748b]/40'
                      : 'border-[#1b535c] hover:border-[#64748b]'
                }`}
              >
                {/* Header of card */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-white bg-[#334155]/60 px-2 py-0.5 rounded border border-[#64748b]/50">
                        {task.id}
                      </span>
                      <span className="text-[10px] font-mono text-[#E9EDF2]/60">
                        {task.inspectionId}
                      </span>
                      {isOverdue && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#ef4444] text-white">
                          МУДДАТИ ЎТГАН
                        </span>
                      )}
                      {isReturned && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#334155] text-white border border-[#64748b]/50">
                          ҚАЙТАРИЛГАН
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-sm text-white mt-1.5 leading-snug">
                      {task.catalogTitleSnapshot}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                    task.priority === 'YUQORI'
                      ? 'bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30'
                      : 'bg-[#334155]/60 text-[#cbd5e1] border border-[#64748b]/50'
                  }`}>
                    {task.priority === 'YUQORI' ? 'Юқори хавф' : 'Ўрта хавф'}
                  </span>
                </div>

                {/* Location & Details */}
                <div className="p-3 rounded-xl bg-[#082428] border border-[#1b535c] space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[#E9EDF2]/90">
                    <MapPin className="w-3.5 h-3.5 text-[#cbd5e1] shrink-0" />
                    <span className="font-bold text-white">{task.workshopCode}:</span>
                    <span className="truncate">{task.zone}</span>
                  </div>
                  <p className="text-[11px] text-[#E9EDF2]/75 leading-relaxed pt-1">
                    {task.description}
                  </p>
                </div>

                {/* Returned Rejection Reason Alert if any */}
                {isReturned && task.rejectionReason && (
                  <div className="p-3 rounded-xl bg-[#ef4444]/15 border border-[#ef4444]/30 text-xs text-white">
                    <div className="font-black text-[#f87171] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{language === 'UZ' ? 'Назоратчи қайтариш сабаби:' : 'Причина возврата инспектора:'}</span>
                    </div>
                    <p className="text-[11px] text-white/90 mt-1">
                      {task.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Photo Previews */}
                <div className="flex items-center gap-3">
                  {task.photoBefore && (
                    <div className="flex-1">
                      <div className="text-[10px] text-[#E9EDF2]/60 font-mono mb-1">
                        {language === 'UZ' ? 'Аниқланган ҳолат:' : 'Выявлено:'}
                      </div>
                      <img
                        src={task.photoBefore}
                        alt="Before"
                        className="w-full h-24 object-cover rounded-xl border border-[#1b535c]"
                      />
                    </div>
                  )}

                  {task.photoAfter && (
                    <div className="flex-1">
                      <div className="text-[10px] text-[#10b981] font-mono mb-1 font-bold">
                        {language === 'UZ' ? 'Бартараф этилган:' : 'Устранено:'}
                      </div>
                      <img
                        src={task.photoAfter}
                        alt="After"
                        className="w-full h-24 object-cover rounded-xl border border-[#10b981]/50"
                      />
                    </div>
                  )}
                </div>

                {/* Footer with Deadlines & Actions */}
                <div className="pt-2 border-t border-[#1b535c] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#E9EDF2]/70">
                    <Calendar className="w-3.5 h-3.5 text-[#cbd5e1]" />
                    <span>{language === 'UZ' ? 'Муддат:' : 'Срок:'} <strong className="text-white">{task.deadline}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectDefect(task)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#082428] hover:bg-[#154c55] text-[#E9EDF2] border border-[#1b535c] font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'UZ' ? 'Кўриш' : 'Просмотр'}</span>
                    </button>

                    {activeTab === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleOpenRemediate(task)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#475569] hover:bg-[#334155] text-white border border-[#64748b] font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{language === 'UZ' ? 'Ижро ҳисоботи' : 'Отчет'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remediation Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 shadow-2xl text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b535c]">
              <div>
                <span className="font-mono text-xs font-black text-[#cbd5e1]">
                  {selectedTask.id}
                </span>
                <h4 className="font-black text-sm text-white mt-0.5">
                  {language === 'UZ' ? 'Камчиликни бартараф этиш ҳисоботи' : 'Отчет об устранении замечания'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-[#E9EDF2]/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
              <div className="p-3 rounded-xl bg-[#082428] border border-[#1b535c]">
                <div className="font-bold text-white">{selectedTask.catalogTitleSnapshot}</div>
                <div className="text-[11px] text-[#E9EDF2]/70 mt-1">{selectedTask.zone}</div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">
                  {language === 'UZ' ? 'Бажарилган ишлар ҳақида батафсил маълумот: *' : 'Описание выполненных работ: *'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Масалан: Янги ОП-10 ўт ўчиргич ўрнатилди, манометр яшил зонада..."
                  className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white focus:outline-none focus:border-[#64748b]"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">
                  {language === 'UZ' ? 'Натижа фотосурати (Бажарилгандан кейинги ҳолат): *' : 'Фотография результата: *'}
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={resolutionPhoto}
                    alt="Preview"
                    className="w-20 h-16 object-cover rounded-xl border border-[#10b981]/60"
                  />
                  <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#082428] hover:bg-[#154c55] border border-[#1b535c] text-white font-bold cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-[#cbd5e1]" />
                    <span>{language === 'UZ' ? 'Янги фото юклаш' : 'Загрузить фото'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Optional Video URL or Upload */}
              <div>
                <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">
                  {language === 'UZ' ? 'Видео далил (3 дақиқагача, ихтиёрий):' : 'Видеозапись (до 3 минут, опционально):'}
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E9EDF2]/40" />
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Видео ҳаволаси ёки файли..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Reminder banner */}
              <div className="p-2.5 rounded-xl bg-[#082428] border border-[#1b535c] text-[11px] text-[#E9EDF2]/80 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#cbd5e1] shrink-0" />
                <span>
                  {language === 'UZ' 
                    ? 'Ҳисобот юборилгандан сўнг назоратчининг текширув навбатига ўтади.'
                    : 'После отправки замечание поступит инспектору на проверку.'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b535c]">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl bg-[#082428] text-[#E9EDF2] hover:text-white border border-[#1b535c] font-bold"
                >
                  {language === 'UZ' ? 'Бекор қилиш' : 'Отмена'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#475569] hover:bg-[#334155] text-white border border-[#64748b] font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'UZ' ? 'Текширувга юбориш' : 'Отправить на проверку'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
