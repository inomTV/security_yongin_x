import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Calendar, 
  User, 
  Clock, 
  Filter, 
  FileText,
  Building2,
  Lock,
  ArrowUpDown
} from 'lucide-react';
import { AuditLogEntry, Language } from '../../types';

interface AuditLogsViewProps {
  logs: AuditLogEntry[];
  language: Language;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs, language }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (entityFilter !== 'ALL' && log.entityType !== entityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Banner */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 sm:p-8 shadow-industrial">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-[#082428] border border-[#1b535c] text-[#94a3b8] shadow-inner shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-black text-[#94a3b8] uppercase tracking-wider mb-1">
              <span>{language === 'UZ' ? 'Хавфсизлик ва назорат журнали' : 'Журнал безопасности и аудита'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#475569]/30 border border-[#64748b]/40 text-[#cbd5e1] flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {language === 'UZ' ? 'Ўзгартириб бўлмайди' : 'Неизменяемый'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              {language === 'UZ' ? 'Тизим ҳаракатлари аудити журнали' : 'Системный журнал аудита действий'}
            </h2>
            <p className="text-xs sm:text-sm text-[#E9EDF2]/80 mt-1 max-w-2xl">
              {language === 'UZ' 
                ? 'Барча муҳим ҳаракатлар: ким, қачон, қайси текширув ёки камчилик карточкасида қандай ўзгариш киритгани аниқ қайд этилади.'
                : 'Фиксация всех ключевых действий пользователей: создание проверок, изменение статусов, прикрепление фотоотчетов.'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-4 shadow-industrial flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E9EDF2]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'UZ' ? 'Ходим, амал ёки ID бўйича қидириш...' : 'Поиск по пользователю или действию...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs placeholder:text-[#E9EDF2]/40 focus:outline-none focus:border-[#64748b]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs font-bold"
          >
            <option value="ALL">{language === 'UZ' ? 'Барча объектлар' : 'Все типы объектов'}</option>
            <option value="INSPECTION">Текширувлар (FS)</option>
            <option value="DEFECT">Камчиликлар (FS-D)</option>
            <option value="WORKSHOP">Цехлар</option>
            <option value="EMPLOYEE">Ходимлар ва роллар</option>
            <option value="CATALOG">Каталог</option>
          </select>

          <span className="text-xs text-[#E9EDF2]/60 font-mono">
            {filteredLogs.length} {language === 'UZ' ? 'та ёзув' : 'записей'}
          </span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl overflow-hidden shadow-industrial">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082428] border-b border-[#1b535c] text-[#E9EDF2]/80 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">{language === 'UZ' ? 'Сана ва Вақт' : 'Дата и Время'}</th>
                <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Фойдаланувчи' : 'Пользователь'}</th>
                <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Роли' : 'Роль'}</th>
                <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Бажарилган амал' : 'Действие'}</th>
                <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Объект ID' : 'Объект'}</th>
                <th className="py-3.5 px-4 font-bold">{language === 'UZ' ? 'Тафсилотлар' : 'Детали'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b535c]/60 text-white">
              {filteredLogs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-[#12454d] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-[#cbd5e1] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#94a3b8]" />
                        <span>{log.userName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#082428] border border-[#1b535c] text-[#E9EDF2]">
                        {log.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-xs text-[#cbd5e1] whitespace-nowrap">
                      {log.entityId}
                    </td>

                    <td className="py-3.5 px-4 text-[#E9EDF2]/80 max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
