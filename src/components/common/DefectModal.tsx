import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle2, 
  FileText, 
  RotateCcw,
  Camera,
  Printer,
  AlertTriangle,
  Lock,
  Send,
  Video,
  ShieldCheck,
  Check
} from 'lucide-react';
import { DefectItem, DefectStatus, EmployeeUser, Language } from '../../types';
import { STATUS_CONFIG, SEVERITY_CONFIG, formatDate, getDaysLeft } from '../../utils/helpers';
import { SAMPLE_DEFECT_PHOTOS } from '../../data/mockData';

interface DefectModalProps {
  defect: DefectItem | null;
  currentUser: EmployeeUser;
  onClose: () => void;
  onUpdateStatus: (defectId: string, newStatus: DefectStatus, note?: string, photo?: string, videoUrl?: string, rejectionReason?: string) => void;
  language: Language;
}

export const DefectModal: React.FC<DefectModalProps> = ({
  defect,
  currentUser,
  onClose,
  onUpdateStatus,
  language,
}) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(SAMPLE_DEFECT_PHOTOS.fixedStation);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [activePhotoView, setActivePhotoView] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReasonText, setRejectionReasonText] = useState('');

  if (!defect) return null;

  const statusInfo = STATUS_CONFIG[defect.status] || STATUS_CONFIG.YANGI;
  const severityInfo = SEVERITY_CONFIG[defect.priority || defect.severity || 'YUQORI'];
  const daysLeft = getDaysLeft(defect.deadline);
  const isOverdue = defect.isOverdue || defect.status === 'MUDDATI_OTGAN';

  const isInspectorOrAdmin = currentUser.role === 'INSPECTOR' || currentUser.role === 'ADMIN';
  const isResponsibleEmployee = currentUser.role === 'RESPONSIBLE_EMPLOYEE' || currentUser.role === 'WORKSHOP_HEAD';

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNote.trim()) return;
    onUpdateStatus(defect.id, 'TEKSHIRUVGA_YUBORILGAN', resolutionNote.trim(), selectedPhoto, videoUrl.trim() || undefined);
    setShowResolveForm(false);
  };

  const handleApproveAndClose = () => {
    if (window.confirm(language === 'UZ' ? 'Камчилик тўлиқ ва сифатли бартараф этилганлигини тасдиқлаб, уни ёпишни хоҳлайсизми?' : 'Подтвердить устранение и закрыть замечание?')) {
      onUpdateStatus(
        defect.id, 
        'YOPILGAN', 
        `Инспектор ${currentUser.fullName} томонидан жойида текширилиб, камчилик расман ёпилди.`
      );
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReasonText.trim()) return;
    onUpdateStatus(
      defect.id,
      'QAYTA_ISHLASHGA_QAYTARILGAN',
      undefined,
      undefined,
      undefined,
      rejectionReasonText.trim()
    );
    setIsRejectModalOpen(false);
    setRejectionReasonText('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto select-none">
      <div 
        className="relative w-full max-w-4xl bg-[#0f3b42] border border-[#1b535c] rounded-3xl shadow-2xl overflow-hidden my-6 text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b535c] bg-[#082428]">
          <div className="flex flex-wrap items-center gap-3">
            <img
              src="/assets/aistudio/Logo_UMK_5145ab7c.png"
              alt="Ўзметкомбинат"
              className="h-8 w-auto object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
            />
            <span className="font-mono text-xs font-black text-white bg-[#334155]/60 px-3 py-1 rounded-lg border border-[#64748b]/50">
              {defect.id}
            </span>
            <span className="font-mono text-xs text-[#E9EDF2]/60">
              {defect.inspectionId}
            </span>
            <span className={`text-xs px-3 py-1 rounded-lg font-bold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}>
              {statusInfo.label}
            </span>
            <span className={`text-xs px-3 py-1 rounded-lg font-bold border ${severityInfo.badgeClass}`}>
              {severityInfo.label}
            </span>
            {isOverdue && (
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30 font-mono">
                МУДДАТИ ЎТГАН
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#E9EDF2]/60 hover:text-white rounded-lg hover:bg-[#0b2e34] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6 custom-scrollbar text-xs">
          {/* Title & Workshop Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-[#E9EDF2]/75 font-semibold">
              <span>[{defect.workshopCode}] {defect.workshopName}</span>
              <span>·</span>
              <span>{defect.categoryNameSnapshot || defect.categoryName}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {defect.catalogTitleSnapshot || defect.title}
            </h3>
          </div>

          {/* Location & Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#082428] border border-[#1b535c] text-xs">
            <div>
              <div className="text-[11px] text-[#E9EDF2]/60 font-bold mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#cbd5e1]" />
                <span>Аниқ ҳудуд / Зона:</span>
              </div>
              <div className="font-extrabold text-white text-xs truncate" title={defect.zone}>
                {defect.zone}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#E9EDF2]/60 font-bold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#cbd5e1]" />
                <span>Аниқланган сана:</span>
              </div>
              <div className="font-bold text-white font-mono">
                {defect.detectedDate}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#E9EDF2]/60 font-bold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#cbd5e1]" />
                <span>Бартараф этиш муддати:</span>
              </div>
              <div className={`font-mono font-bold ${isOverdue ? 'text-[#ef4444]' : 'text-white'}`}>
                {defect.deadline} {isOverdue && '(Кечиккан!)'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#E9EDF2]/60 font-bold mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#cbd5e1]" />
                <span>Ижрога масъул:</span>
              </div>
              <div className="font-bold text-white truncate" title={defect.responsiblePerson}>
                {defect.responsiblePerson}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-[#082428] border border-[#1b535c] space-y-1">
            <h4 className="font-bold text-xs text-[#cbd5e1] uppercase font-mono">
              Камчилик тавсифи ва меъёрий талаблар:
            </h4>
            <p className="text-white/90 leading-relaxed text-xs">
              {defect.description}
            </p>
          </div>

          {/* Rejection notice if returned */}
          {defect.status === 'QAYTA_ISHLASHGA_QAYTARILGAN' && defect.rejectionReason && (
            <div className="p-4 rounded-2xl bg-[#ef4444]/15 border border-[#ef4444]/30 space-y-1">
              <div className="font-black text-[#f87171] flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Назоратчи томонидан қайта ишлашга қайтарилган! Сабаби:</span>
              </div>
              <p className="text-white text-xs leading-relaxed">
                {defect.rejectionReason}
              </p>
            </div>
          )}

          {/* Photo & Video Evidence Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white uppercase font-mono flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#cbd5e1]" />
                <span>Фото ва видео далиллар</span>
              </h4>

              <div className="flex items-center gap-1 p-1 bg-[#082428] rounded-xl border border-[#1b535c]">
                <button
                  type="button"
                  onClick={() => setActivePhotoView('BEFORE')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePhotoView === 'BEFORE'
                      ? 'bg-[#475569] text-white font-black'
                      : 'text-[#E9EDF2]/70 hover:text-white'
                  }`}
                >
                  Аниқланган ҳолат
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoView('AFTER')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activePhotoView === 'AFTER'
                      ? 'bg-[#10b981] text-white font-black'
                      : 'text-[#E9EDF2]/70 hover:text-white'
                  }`}
                >
                  Бартараф этилган ҳолат {defect.photoAfter && '✓'}
                </button>
              </div>
            </div>

            {/* Photo Preview Container */}
            <div className="relative aspect-video max-h-72 w-full rounded-2xl overflow-hidden bg-[#082428] border border-[#1b535c] flex items-center justify-center">
              {activePhotoView === 'BEFORE' ? (
                defect.photoBefore ? (
                  <img
                    src={defect.photoBefore}
                    alt="Before remediation"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-[#E9EDF2]/50 p-6">
                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>Фото мавжуд эмас</span>
                  </div>
                )
              ) : (
                defect.photoAfter ? (
                  <img
                    src={defect.photoAfter}
                    alt="After remediation"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-[#E9EDF2]/60 p-6 space-y-1">
                    <Camera className="w-8 h-8 text-[#cbd5e1] mx-auto mb-2 opacity-80" />
                    <p className="font-bold text-white text-xs">Бартараф этилганлик фото далили ҳали юкланмаган</p>
                    <p className="text-[11px] text-[#E9EDF2]/60">Масъул ходим иш якунида натижа фотосини юклаши лозим</p>
                  </div>
                )
              )}

              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[11px] font-mono font-bold text-white">
                {activePhotoView === 'BEFORE' ? 'АНИҚЛАНГАН ҲОЛАТ (ОЛДИН)' : 'БАРТАРАФ ЭТИЛГАН ҲОЛАТ (КЕЙИН)'}
              </div>
            </div>

            {/* Resolution Note if any */}
            {defect.resolutionNotes && (
              <div className="p-3.5 rounded-xl bg-[#10b981]/15 border border-[#10b981]/30 text-xs">
                <div className="font-bold text-[#10b981] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ижрочининг бартараф этиш тўғрисидаги ҳисоботи ({defect.resolvedDate}):</span>
                </div>
                <p className="text-white mt-1 leading-relaxed">
                  {defect.resolutionNotes}
                </p>
              </div>
            )}
          </div>

          {/* History Timeline */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs text-white uppercase font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#cbd5e1]" />
              <span>Ҳаракатлар ва мақомлар тарихи (Timeline)</span>
            </h4>

            <div className="p-4 rounded-2xl bg-[#082428] border border-[#1b535c] space-y-3 divide-y divide-[#1b535c]/50">
              {defect.history && defect.history.length > 0 ? (
                defect.history.map((h, i) => (
                  <div key={h.id || i} className="pt-2 first:pt-0 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#64748b] mt-1.5 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-extrabold text-white">{h.author} ({h.role})</span>
                        <span className="font-mono text-[#E9EDF2]/50 text-[10px]">{h.date}</span>
                      </div>
                      <p className="text-[11px] text-[#E9EDF2]/80 mt-0.5">{h.action}</p>
                      {h.comment && (
                        <p className="text-[11px] text-[#cbd5e1] italic mt-0.5">«{h.comment}»</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[#E9EDF2]/50 text-xs text-center py-2">
                  Тарих ёзувлари мавжуд эмас
                </div>
              )}
            </div>
          </div>

          {/* Form for Responsible Employee to submit work */}
          {showResolveForm && (
            <form onSubmit={handleResolveSubmit} className="p-4 rounded-2xl bg-[#082428] border border-[#1b535c] space-y-3">
              <h4 className="font-bold text-xs text-[#cbd5e1] uppercase font-mono flex items-center gap-1.5">
                <Send className="w-4 h-4" />
                <span>Бартараф этилганлик ҳисоботини юбориш</span>
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Бажарилган иш тавсифи: *</label>
                <textarea
                  rows={2}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Масалан: Янги ўт ўчиргич қўйилди ва қайта кўрикдан ўтказилди..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0f3b42] border border-[#1b535c] text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Натижа фотосурати: *</label>
                <div className="flex items-center gap-3">
                  <img src={selectedPhoto} alt="preview" className="w-16 h-12 object-cover rounded-lg border border-[#10b981]" />
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f3b42] hover:bg-[#154c55] border border-[#1b535c] text-white font-bold cursor-pointer">
                    <Camera className="w-3.5 h-3.5 text-[#cbd5e1]" />
                    <span>Фото юклаш</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#0f3b42] text-[#E9EDF2]"
                >
                  Бекор қилиш
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#475569] hover:bg-[#334155] text-white border border-[#64748b] font-bold cursor-pointer"
                >
                  Юбориш
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Actions (Strict Role Enforced!) */}
        <div className="px-6 py-4 border-t border-[#1b535c] bg-[#071f23] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-[#082428] hover:bg-[#154c55] text-[#E9EDF2] border border-[#1b535c] font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#cbd5e1]" />
            <span>Карточкани чоп этиш</span>
          </button>

          <div className="flex items-center gap-2">
            {/* 1. Responsible Employee Actions */}
            {isResponsibleEmployee && defect.status !== 'YOPILGAN' && defect.status !== 'TEKSHIRUVGA_YUBORILGAN' && !showResolveForm && (
              <button
                type="button"
                onClick={() => setShowResolveForm(true)}
                className="px-4 py-2 rounded-xl bg-[#475569] hover:bg-[#334155] text-white border border-[#64748b] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
                <span>Ижро ҳисоботини юбориш</span>
              </button>
            )}

            {/* Strict Notice for Responsible Employee: CANNOT CLOSE! */}
            {currentUser.role === 'RESPONSIBLE_EMPLOYEE' && (
              <span className="text-[10px] text-[#f87171] font-mono font-bold flex items-center gap-1 px-2 py-1 rounded bg-[#ef4444]/15 border border-[#ef4444]/30">
                <Lock className="w-3 h-3" />
                Ёпиш ҳуқуқи йўқ
              </span>
            )}

            {/* 2. Inspector / Admin Actions */}
            {isInspectorOrAdmin && defect.status !== 'YOPILGAN' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-[#f87171] border border-[#ef4444]/30 font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Қайта ишлашга қайтариш</span>
                </button>

                <button
                  type="button"
                  onClick={handleApproveAndClose}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#10b981]/25"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Қабул қилиш (Камчиликни ёпиш)</span>
                </button>
              </>
            )}

            {defect.status === 'YOPILGAN' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-black">
                <CheckCircle2 className="w-4 h-4" />
                <span>Камчилик ёпилган ({defect.verifiedDate})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Reason Sub-Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0a272c] border border-[#ef4444] rounded-2xl p-5 shadow-2xl space-y-3 text-white">
            <h4 className="font-black text-sm text-[#ef4444] flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Камчиликни қайта ишлашга қайтариш</span>
            </h4>
            <p className="text-xs text-[#E9EDF2]/80">
              Қайтаришнинг асосли сабабини киритинг. Ушбу изоҳ масъул ходимга хабарнома сифатида юборилади:
            </p>
            <textarea
              rows={3}
              required
              value={rejectionReasonText}
              onChange={(e) => setRejectionReasonText(e.target.value)}
              placeholder="Масалан: Тақдим этилган фотосуратда ёнғин гидранти йўлаги тўлиқ тозаланмаган, кран яқинида чиқиндилар қолган..."
              className="w-full px-3 py-2 rounded-xl bg-[#0f3b42] border border-[#1b535c] text-white text-xs focus:outline-none focus:border-[#ef4444]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-[#082428] text-[#E9EDF2] text-xs font-bold"
              >
                Бекор қилиш
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white font-black text-xs"
              >
                Қайтаришни тасдиқлаш
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
