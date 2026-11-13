import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Send, 
  UploadCloud, 
  Check, 
  ShieldCheck
} from 'lucide-react';
import { DefectItem, DefectStatus, Workshop } from '../../types';
import { WORKSHOPS, SAMPLE_DEFECT_PHOTOS } from '../../data/mockData';
import { STATUS_CONFIG, SEVERITY_CONFIG, formatDate, getDaysLeft } from '../../utils/helpers';

interface ShopSupervisorViewProps {
  defects: DefectItem[];
  onUpdateStatus: (defectId: string, newStatus: DefectStatus, note?: string, photo?: string) => void;
  onSelectDefect: (defect: DefectItem) => void;
}

export const ShopSupervisorView: React.FC<ShopSupervisorViewProps> = ({
  defects,
  onUpdateStatus,
  onSelectDefect,
}) => {
  const [selectedWorkshopCode, setSelectedWorkshopCode] = useState<string>('СПЦ');
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'IN_REVIEW' | 'COMPLETED'>('ACTIVE');

  // Remediation modal state
  const [remediatingDefect, setRemediatingDefect] = useState<DefectItem | null>(null);
  const [reportNote, setReportNote] = useState<string>('');
  const [resolutionPhoto, setResolutionPhoto] = useState<string>(SAMPLE_DEFECT_PHOTOS.fixedStation);
  const [customPhotoUpload, setCustomPhotoUpload] = useState<string | null>(null);

  const selectedWorkshop = WORKSHOPS.find((w) => w.code === selectedWorkshopCode) || WORKSHOPS[0];

  // Defects for this workshop
  const shopDefects = useMemo(() => {
    return defects.filter((d) => d.workshopCode === selectedWorkshopCode);
  }, [defects, selectedWorkshopCode]);

  // Subdivided categories
  const activeDefects = useMemo(() => {
    return shopDefects.filter((d) => d.status === 'YANGI' || d.status === 'IJRODA' || d.status === 'BAJARILMOQDA' || d.status === 'BIRIKTIRILGAN' || d.status === 'MUDDATI_OTGAN' || d.isOverdue);
  }, [shopDefects]);

  const inReviewDefects = useMemo(() => {
    return shopDefects.filter((d) => d.status === 'TEKSHIRUVDA' || d.status === 'TEKSHIRUVGA_YUBORILGAN');
  }, [shopDefects]);

  const completedDefects = useMemo(() => {
    return shopDefects.filter((d) => d.status === 'YOPILGAN');
  }, [shopDefects]);

  // Current display list
  const currentList = activeTab === 'ACTIVE' 
    ? activeDefects 
    : activeTab === 'IN_REVIEW' 
      ? inReviewDefects 
      : completedDefects;

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomPhotoUpload(result);
        setResolutionPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit resolution
  const handleResolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remediatingDefect || !reportNote.trim()) return;

    onUpdateStatus(
      remediatingDefect.id,
      'TEKSHIRUVGA_YUBORILGAN',
      reportNote,
      resolutionPhoto
    );

    // Reset & close
    setRemediatingDefect(null);
    setReportNote('');
    setCustomPhotoUpload(null);
    setActiveTab('IN_REVIEW');
  };

  const overdueCount = activeDefects.filter((d) => d.status === 'MUDDATI_OTGAN').length;
  const resolutionPercentage = shopDefects.length > 0 
    ? Math.round((completedDefects.length / shopDefects.length) * 100) 
    : 100;

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Workshop Profile & Selector Strip in Deep Teal #0f3b42 */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-8 lg:p-9 space-y-6 shadow-industrial">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-2">
          <div className="flex items-start gap-4">
            <img
              src="/assets/aistudio/Logo_UMK_5145ab7c.png"
              alt="UZMETKOMBINAT"
              className="h-12 w-auto object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            />
            <div>
              <div className="text-xs font-black text-[#cbd5e1] uppercase tracking-widest mb-1.5 font-mono">
                «ЎЗМЕТКОМБИНАТ» АЖ · Цех масъули шахсий иш майдони
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <User className="w-5 h-5 text-[#cbd5e1]" />
                {selectedWorkshop.manager} — {selectedWorkshop.name} ({selectedWorkshop.code})
              </h2>
            </div>
          </div>

          {/* Workshop switcher */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#E9EDF2]/70 font-semibold">Цехни танлаш:</span>
            <select
              value={selectedWorkshopCode}
              onChange={(e) => setSelectedWorkshopCode(e.target.value)}
              className="bg-[#082428] border border-[#1b535c] text-xs text-white font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#64748b] transition-colors shadow-sm"
            >
              {WORKSHOPS.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Workshop KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-4 border-t border-[#1b535c] text-xs">
          <div className="p-5 bg-[#0b2e34] rounded-xl border border-[#1b535c] shadow-sm space-y-2">
            <span className="text-[#E9EDF2]/70 font-semibold block">Ижро кўрсаткичи</span>
            <div className="text-2xl font-black font-mono text-[#10b981]">
              {resolutionPercentage}%
            </div>
            <div className="w-full bg-[#082428] h-2 rounded-full overflow-hidden border border-[#1b535c]">
              <div 
                className="bg-[#10b981] h-full rounded-full transition-all duration-500" 
                style={{ width: `${resolutionPercentage}%` }} 
              />
            </div>
          </div>

          <div className="p-5 bg-[#0b2e34] rounded-xl border border-[#1b535c] shadow-sm space-y-2">
            <span className="text-[#E9EDF2]/70 font-semibold block">Ижро этилиши керак</span>
            <div className="text-2xl font-black font-mono text-white">
              {activeDefects.length} та
            </div>
            <span className="text-[11px] text-[#E9EDF2]/60 block font-medium">Янги ва ижродаги топшириқлар</span>
          </div>

          <div className="p-5 bg-[#0b2e34] rounded-xl border border-[#1b535c] shadow-sm space-y-2">
            <span className="text-[#E9EDF2]/70 font-semibold block">Муддати ўтган</span>
            <div className={`text-2xl font-black font-mono ${overdueCount > 0 ? 'text-[#ef4444]' : 'text-white'}`}>
              {overdueCount} та
            </div>
            <span className={`text-[11px] font-bold block ${overdueCount > 0 ? 'text-[#ef4444]' : 'text-[#E9EDF2]/60'}`}>
              {overdueCount > 0 ? 'Критик кечикиш бор!' : 'Барқарор ҳолат'}
            </span>
          </div>

          <div className="p-5 bg-[#0b2e34] rounded-xl border border-[#1b535c] shadow-sm space-y-2">
            <span className="text-[#E9EDF2]/70 font-semibold block">Инспектор текширувида</span>
            <div className="text-2xl font-black font-mono text-white">
              {inReviewDefects.length} та
            </div>
            <span className="text-[11px] text-[#E9EDF2]/60 block font-medium">Ҳисобот юборилган</span>
          </div>
        </div>
      </div>

      {/* Tabs: Active / In Review / Completed */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[#1b535c] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'ACTIVE'
              ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
              : 'text-[#E9EDF2]/80 hover:text-white bg-[#0f3b42] border border-[#1b535c]'
          }`}
        >
          <Clock className="w-4 h-4 stroke-[2.5]" />
          Ижро этилиши лозим ({activeDefects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('IN_REVIEW')}
          className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'IN_REVIEW'
              ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
              : 'text-[#E9EDF2]/80 hover:text-white bg-[#0f3b42] border border-[#1b535c]'
          }`}
        >
          <Send className="w-4 h-4" />
          Текширувда турганлар ({inReviewDefects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'COMPLETED'
              ? 'bg-[#10b981] text-white font-black shadow-md'
              : 'text-[#E9EDF2]/80 hover:text-white bg-[#0f3b42] border border-[#1b535c]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Ёпилган ва қабул қилинган ({completedDefects.length})
        </button>
      </div>

      {/* Defects List */}
      <div className="space-y-4">
        {currentList.length === 0 ? (
          <div className="p-12 text-center bg-[#0f3b42] border border-[#1b535c] rounded-2xl shadow-industrial">
            <CheckCircle2 className="w-10 h-10 text-[#10b981] mx-auto mb-2 opacity-90" />
            <h3 className="text-base font-bold text-white mb-1">
              Бу бўлимда камчиликлар йўқ!
            </h3>
            <p className="text-xs text-[#E9EDF2]/70">
              {activeTab === 'ACTIVE' 
                ? `${selectedWorkshop.name} бўйича барча камчиликлар бартараф этилган ёки текширувга топширилган.` 
                : 'Ҳозирда кўрсатилган мақомдаги топшириқлар мавжуд эмас.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentList.map((defect) => {
              const statusInfo = STATUS_CONFIG[defect.status] || STATUS_CONFIG.YANGI;
              const severityInfo = SEVERITY_CONFIG[defect.priority || defect.severity || 'YUQORI'];
              const daysLeft = getDaysLeft(defect.deadline);

              return (
                <div
                  key={defect.id}
                  className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl overflow-hidden flex flex-col justify-between shadow-industrial"
                >
                  <div className="p-6 space-y-4">
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-white bg-[#334155]/60 px-2 py-0.5 rounded border border-[#64748b]/50">
                            {defect.id}
                          </span>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded font-bold border ${statusInfo.bgClass} ${statusInfo.textClass} ${statusInfo.borderClass}`}>
                            {statusInfo.label}
                          </span>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded font-bold border ${severityInfo.badgeClass}`}>
                            {severityInfo.label}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {defect.title}
                        </h3>
                      </div>
                    </div>

                    {/* Zone & Deadline */}
                    <div className="space-y-1 text-xs text-[#E9EDF2]/75">
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#cbd5e1] shrink-0" />
                        <span>{defect.zone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#E9EDF2]/60 shrink-0" />
                        <span>Муддат: <strong className="font-mono text-white">{formatDate(defect.deadline)}</strong></span>
                        <span className={`ml-2 px-2 py-0.2 rounded font-mono text-[10px] font-bold ${
                          daysLeft < 0 
                            ? 'bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30' 
                            : 'bg-[#082428] text-[#E9EDF2] border border-[#1b535c]'
                        }`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} кун кечикди!` : `${daysLeft} кун қолди`}
                        </span>
                      </div>
                    </div>

                    {/* Defect Photo & Description */}
                    <div className="flex gap-3.5 bg-[#082428] p-3.5 rounded-xl border border-[#1b535c]">
                      <div 
                        onClick={() => onSelectDefect(defect)}
                        className="w-24 h-20 rounded-lg overflow-hidden bg-[#0b2e34] border border-[#1b535c] shrink-0 cursor-pointer group relative"
                      >
                        <img
                          src={defect.defectPhoto}
                          alt={defect.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                          Катталаштириш
                        </div>
                      </div>
                      <div className="flex-1 text-xs text-[#E9EDF2]/80 space-y-1">
                        <p className="line-clamp-3 leading-relaxed">
                          {defect.description}
                        </p>
                        <div className="text-[11px] text-[#E9EDF2]/60 font-medium">
                          Инспектор: {defect.inspectorName}
                        </div>
                      </div>
                    </div>

                    {/* If Under Review: Show Resolution Info */}
                    {defect.resolutionNotes && (
                      <div className="p-3.5 bg-[#334155]/40 border border-[#64748b]/40 rounded-xl text-xs space-y-1">
                        <span className="font-bold text-[#cbd5e1] block">
                          Юборилган ижро ҳисоботи:
                        </span>
                        <p className="text-[#E9EDF2]/90 italic">
                          "{defect.resolutionNotes}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-6 py-3.5 bg-[#082428] border-t border-[#1b535c] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onSelectDefect(defect)}
                      className="text-xs font-bold text-[#E9EDF2]/70 hover:text-white transition-colors"
                    >
                      Тўлиқ тарихни кўриш
                    </button>

                    {/* Main supervisor action: Remediate */}
                    {(defect.status === 'YANGI' || defect.status === 'IJRODA' || defect.status === 'BAJARILMOQDA' || defect.status === 'BIRIKTIRILGAN' || defect.status === 'MUDDATI_OTGAN' || defect.status === 'QAYTA_ISHLASHGA_QAYTARILGAN') && (
                      <button
                        type="button"
                        onClick={() => {
                          setRemediatingDefect(defect);
                          setReportNote('');
                        }}
                        className="px-4 py-2 bg-[#475569] hover:bg-[#334155] text-white font-black text-xs rounded-xl border border-[#64748b] transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        Ижро этилди (Ҳисобот юклаш)
                      </button>
                    )}

                    {(defect.status === 'TEKSHIRUVDA' || defect.status === 'TEKSHIRUVGA_YUBORILGAN') && (
                      <span className="text-xs font-bold text-[#cbd5e1] flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Инспектор қабули кутилмоқда
                      </span>
                    )}

                    {defect.status === 'YOPILGAN' && (
                      <span className="text-xs font-bold text-[#10b981] flex items-center gap-1.5">
                        <Check className="w-4 h-4 stroke-[3]" />
                        Камчилик ёпилган ({formatDate(defect.verifiedDate || defect.deadline)})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REMEDIATION MODAL (Photo upload & notes) */}
      {remediatingDefect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0f3b42] border border-[#1b535c] rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b535c] bg-[#082428]">
              <div>
                <span className="text-xs font-mono text-[#cbd5e1] font-black">
                  {remediatingDefect.id}
                </span>
                <h3 className="text-base font-black text-white">
                  Камчиликни бартараф этиш ва фотосурат юклаш
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRemediatingDefect(null)}
                className="text-[#E9EDF2]/60 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolutionSubmit} className="p-6 space-y-5">
              <div className="p-3.5 bg-[#082428] rounded-xl border border-[#1b535c] text-xs space-y-1">
                <span className="text-[#E9EDF2]/60 font-semibold block">Бажарилган камчилик:</span>
                <span className="font-bold text-white block">{remediatingDefect.title}</span>
                <span className="text-[#E9EDF2]/75 block">{remediatingDefect.zone}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                  Бажарилган чора-тадбирлар баёни: *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  placeholder="Масалан: Янги ОП-5 ўт ўчиргич ўрнатилди, гидрант атрофидаги қувур ва чиқиндилар 100% тозаланди, сариқ чизиқлар билан чегараланди."
                  className="w-full bg-[#082428] border border-[#1b535c] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#E9EDF2]/40 focus:outline-none focus:border-[#64748b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                  Ижро этилганлигини тасдиқловчи фотосуратни юклаш: *
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="aspect-video rounded-xl overflow-hidden border border-[#1b535c] bg-[#082428] relative">
                    <img
                      src={resolutionPhoto}
                      alt="Ижро далили"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#10b981] text-white text-[10px] px-2 py-0.5 rounded font-mono font-black shadow-sm">
                      ТАЪМИРЛАНДИ
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-[#1b535c] hover:border-[#64748b] rounded-xl cursor-pointer bg-[#082428] text-center transition-colors">
                      <UploadCloud className="w-6 h-6 text-[#cbd5e1] mb-1" />
                      <span className="text-xs font-bold text-white">
                        Камерадан ёки файллардан юклаш
                      </span>
                      <span className="text-[10px] text-[#E9EDF2]/60 mt-0.5">
                        JPG, PNG, WebP (макс. 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setResolutionPhoto(SAMPLE_DEFECT_PHOTOS.fixedStation)}
                      className="w-full py-2 text-[11px] font-bold text-[#E9EDF2]/80 hover:text-white bg-[#0b2e34] rounded-xl border border-[#1b535c]"
                    >
                      Тайёр синов фотосуратини танлаш (Таъмирланган станция)
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1b535c]">
                <button
                  type="button"
                  onClick={() => setRemediatingDefect(null)}
                  className="px-4 py-2 text-xs font-bold text-[#E9EDF2]/70 hover:text-white"
                >
                  Бекор қилиш
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#475569] hover:bg-[#334155] text-white font-black text-xs rounded-xl border border-[#64748b] transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  Инспектор кўригига юбориш
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
