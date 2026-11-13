import { DefectStatus, Severity } from '../types';

export const STATUS_CONFIG: Record<DefectStatus, { 
  label: string; 
  labelRu: string;
  textClass: string; 
  bgClass: string; 
  borderClass: string; 
  dotClass: string;
  badgeStyle: string;
}> = {
  YANGI: {
    label: 'Янги',
    labelRu: 'Новый',
    textClass: 'text-[#E9EDF2]',
    bgClass: 'bg-[#16424a]',
    borderClass: 'border-[#225761]',
    dotClass: 'bg-[#94a3b8]',
    badgeStyle: 'bg-[#16424a] text-[#E9EDF2] border border-[#225761]',
  },
  BIRIKTIRILGAN: {
    label: 'Масъулга бириктирилган',
    labelRu: 'Назначен',
    textClass: 'text-[#E9EDF2]/90',
    bgClass: 'bg-[#16424a]',
    borderClass: 'border-[#225761]',
    dotClass: 'bg-[#94a3b8]',
    badgeStyle: 'bg-[#16424a] text-[#E9EDF2]/90 border border-[#225761]',
  },
  BAJARILMOQDA: {
    label: 'Бажарилмоқда',
    labelRu: 'В работе',
    textClass: 'text-[#cbd5e1]',
    bgClass: 'bg-[#334155]/40',
    borderClass: 'border-[#64748b]/40',
    dotClass: 'bg-[#94a3b8]',
    badgeStyle: 'bg-[#334155]/60 text-[#e2e8f0] border border-[#64748b]/50',
  },
  TEKSHIRUVGA_YUBORILGAN: {
    label: 'Текширувга юборилган',
    labelRu: 'На проверке',
    textClass: 'text-[#e2e8f0]',
    bgClass: 'bg-[#334155]/40',
    borderClass: 'border-[#64748b]/40',
    dotClass: 'bg-[#cbd5e1]',
    badgeStyle: 'bg-[#334155]/60 text-[#e2e8f0] border border-[#64748b]/50',
  },
  QAYTA_ISHLASHGA_QAYTARILGAN: {
    label: 'Қайта ишлашга қайтарилган',
    labelRu: 'На доработке',
    textClass: 'text-[#f87171]',
    bgClass: 'bg-[#ef4444]/10',
    borderClass: 'border-[#ef4444]/30',
    dotClass: 'bg-[#f87171]',
    badgeStyle: 'bg-[#ef4444]/10 text-[#f87171] border border-[#ef4444]/30',
  },
  YOPILGAN: {
    label: 'Ёпилган',
    labelRu: 'Закрыт',
    textClass: 'text-[#34d399]',
    bgClass: 'bg-[#10b981]/10',
    borderClass: 'border-[#10b981]/30',
    dotClass: 'bg-[#34d399]',
    badgeStyle: 'bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/30',
  },
  MUDDATI_OTGAN: {
    label: 'Муддати ўтган',
    labelRu: 'Просрочен',
    textClass: 'text-[#f87171]',
    bgClass: 'bg-[#ef4444]/15',
    borderClass: 'border-[#ef4444]/35',
    dotClass: 'bg-[#f87171]',
    badgeStyle: 'bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/35 font-bold',
  },
  IJRODA: {
    label: 'Ижрода',
    labelRu: 'В работе',
    textClass: 'text-[#cbd5e1]',
    bgClass: 'bg-[#334155]/40',
    borderClass: 'border-[#64748b]/40',
    dotClass: 'bg-[#94a3b8]',
    badgeStyle: 'bg-[#334155]/60 text-[#e2e8f0] border border-[#64748b]/50',
  },
  TEKSHIRUVDA: {
    label: 'Текширувда',
    labelRu: 'На проверке',
    textClass: 'text-[#e2e8f0]',
    bgClass: 'bg-[#334155]/40',
    borderClass: 'border-[#64748b]/40',
    dotClass: 'bg-[#cbd5e1]',
    badgeStyle: 'bg-[#334155]/60 text-[#e2e8f0] border border-[#64748b]/50',
  },
};

export const SEVERITY_CONFIG: Record<Severity, { label: string; textClass: string; badgeClass: string }> = {
  YUQORI: {
    label: 'Юқори (Критик)',
    textClass: 'text-[#f87171]',
    badgeClass: 'bg-[#ef4444]/10 text-[#f87171] border border-[#ef4444]/30',
  },
  ORTA: {
    label: 'Ўртача',
    textClass: 'text-[#cbd5e1]',
    badgeClass: 'bg-[#334155]/70 text-[#e2e8f0] border border-[#64748b]/50',
  },
  PAST: {
    label: 'Паст хавф',
    textClass: 'text-[#94a3b8]',
    badgeClass: 'bg-[#16424a] text-[#c7d2de] border border-[#225761]',
  },
};

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return dateString;
}

export function isOverdue(deadlineStr: string, currentStatus: DefectStatus): boolean {
  if (currentStatus === 'YOPILGAN') return false;
  const today = new Date().toISOString().split('T')[0];
  return deadlineStr < today;
}

export function getDaysLeft(deadlineStr: string): number {
  const deadline = new Date(deadlineStr).getTime();
  const now = new Date().getTime();
  const diffTime = deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
