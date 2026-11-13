import React from 'react';
import { SystemRole, EmployeeUser, Language } from '../../types';
import { ROLE_INFO } from '../../data/initialUsers';
import { 
  ShieldCheck, 
  UserCog, 
  Crown, 
  Building2, 
  Wrench, 
  Eye, 
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface TopRoleSwitcherProps {
  currentUser: EmployeeUser;
  onSwitchRole: (role: SystemRole) => void;
  language: Language;
}

export const TopRoleSwitcher: React.FC<TopRoleSwitcherProps> = ({
  currentUser,
  onSwitchRole,
  language,
}) => {
  const currentRoleInfo = ROLE_INFO[currentUser.role];

  const rolesList: { role: SystemRole; icon: React.ElementType }[] = [
    { role: 'ADMIN', icon: UserCog },
    { role: 'EXECUTIVE', icon: Crown },
    { role: 'INSPECTOR', icon: ShieldCheck },
    { role: 'WORKSHOP_HEAD', icon: Building2 },
    { role: 'RESPONSIBLE_EMPLOYEE', icon: Wrench },
    { role: 'OBSERVER', icon: Eye },
  ];

  return (
    <div className="bg-[#071f23] border-b border-[#1b535c] px-3 sm:px-6 py-2 select-none shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Active Role Details */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-[#E9EDF2]/60 uppercase tracking-widest hidden sm:inline">
              {language === 'UZ' ? 'Тизимдаги роль:' : 'Текущая роль:'}
            </span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black font-mono ${currentRoleInfo.badgeClass}`}>
              {language === 'UZ' ? currentRoleInfo.nameUz : currentRoleInfo.nameRu}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[#E9EDF2]/80 text-[11px]">
            <span className="font-extrabold text-white">{currentUser.fullName}</span>
            <span className="text-[#cbd5e1] font-bold">({currentUser.badgeNumber})</span>
            {currentUser.workshopCode !== 'ALL' && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#0b2e34] text-[#E9EDF2] font-bold border border-[#1b535c]">
                {currentUser.workshopCode}
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Role Switcher Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar justify-start md:justify-end">
          <span className="text-[10px] text-[#E9EDF2]/50 font-mono font-bold mr-1 shrink-0 uppercase hidden xl:inline">
            {language === 'UZ' ? 'Ролни танлаш:' : 'Переключить роль:'}
          </span>

          {rolesList.map(({ role, icon: Icon }) => {
            const isCurrent = currentUser.role === role;
            const rInfo = ROLE_INFO[role];

            return (
              <button
                key={role}
                type="button"
                onClick={() => onSwitchRole(role)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#475569] text-white font-black shadow-md border border-[#64748b]'
                    : 'bg-[#0b2e34] hover:bg-[#154c55] text-[#E9EDF2]/75 hover:text-white border border-[#1b535c]'
                }`}
                title={language === 'UZ' ? rInfo.descriptionUz : rInfo.descriptionRu}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>{language === 'UZ' ? rInfo.nameUz : rInfo.nameRu}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Notice Banner */}
      <div className="max-w-7xl mx-auto mt-1 pt-1 border-t border-[#1b535c]/40 flex items-center justify-between text-[10px] text-[#E9EDF2]/70">
        <div className="flex items-center gap-1.5 truncate">
          <Info className="w-3 h-3 text-[#cbd5e1] shrink-0" />
          <span className="truncate">
            {language === 'UZ' ? currentRoleInfo.descriptionUz : currentRoleInfo.descriptionRu}
          </span>
        </div>

        {currentUser.role === 'RESPONSIBLE_EMPLOYEE' && (
          <div className="flex items-center gap-1 text-[#f87171] font-bold shrink-0 ml-2">
            <Lock className="w-3 h-3" />
            <span>{language === 'UZ' ? 'Камчиликни ёпиш ҳуқуқи йўқ' : 'Закрытие запрещено'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
