import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Plus, 
  Edit3, 
  Power, 
  X, 
  Search, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  UserCheck,
  Crown,
  UserCog,
  Wrench,
  Eye,
  Info
} from 'lucide-react';
import { Workshop, EmployeeUser, SystemRole, Language } from '../../types';
import { ROLE_INFO } from '../../data/initialUsers';

interface WorkshopsEmployeesViewProps {
  workshops: Workshop[];
  employees: EmployeeUser[];
  onAddWorkshop: (workshop: Workshop) => void;
  onUpdateWorkshop: (code: string, updates: Partial<Workshop>) => void;
  onAddEmployee: (employee: EmployeeUser) => void;
  onUpdateEmployee: (id: string, updates: Partial<EmployeeUser>) => void;
  language: Language;
}

export const WorkshopsEmployeesView: React.FC<WorkshopsEmployeesViewProps> = ({
  workshops,
  employees,
  onAddWorkshop,
  onUpdateWorkshop,
  onAddEmployee,
  onUpdateEmployee,
  language,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'WORKSHOPS' | 'EMPLOYEES'>('WORKSHOPS');
  const [workshopSearch, setWorkshopSearch] = useState<string>('');
  const [employeeSearch, setEmployeeSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Workshop Modal
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState<boolean>(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [workshopForm, setWorkshopForm] = useState<{
    code: string;
    name: string;
    fullName: string;
    managerName: string;
    phone: string;
    dangerClass: 'A' | 'B' | 'V';
    dangerDescription: string;
    employeeCount: number;
    isActive: boolean;
  }>({
    code: '',
    name: '',
    fullName: '',
    managerName: '',
    phone: '+998 70 214-',
    dangerClass: 'B',
    dangerDescription: '',
    employeeCount: 150,
    isActive: true,
  });

  // Employee Modal
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeUser | null>(null);
  const [employeeForm, setEmployeeForm] = useState<{
    fullName: string;
    badgeNumber: string;
    workshopCode: string;
    role: SystemRole;
    phone: string;
    assignedZone: string;
    status: 'ACTIVE' | 'ON_DUTY' | 'VACATION' | 'INACTIVE';
  }>({
    fullName: '',
    badgeNumber: '',
    workshopCode: 'СПЦ',
    role: 'RESPONSIBLE_EMPLOYEE',
    phone: '+998 70 214-',
    assignedZone: '',
    status: 'ACTIVE',
  });

  // Filtered lists
  const filteredWorkshops = workshops.filter((w) => {
    if (workshopSearch.trim()) {
      const q = workshopSearch.toLowerCase();
      return w.code.toLowerCase().includes(q) || w.name.toLowerCase().includes(q) || (w.managerName || w.manager || '').toLowerCase().includes(q);
    }
    return true;
  });

  const filteredEmployees = employees.filter((e) => {
    if (roleFilter !== 'ALL' && e.role !== roleFilter) return false;
    if (employeeSearch.trim()) {
      const q = employeeSearch.toLowerCase();
      return e.fullName.toLowerCase().includes(q) || e.badgeNumber.toLowerCase().includes(q) || e.workshopCode.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAddWorkshop = () => {
    setEditingWorkshop(null);
    setWorkshopForm({
      code: '',
      name: '',
      fullName: '',
      managerName: '',
      phone: '+998 70 214-',
      dangerClass: 'B',
      dangerDescription: '',
      employeeCount: 150,
      isActive: true,
    });
    setIsWorkshopModalOpen(true);
  };

  const handleOpenEditWorkshop = (w: Workshop) => {
    setEditingWorkshop(w);
    setWorkshopForm({
      code: w.code,
      name: w.name,
      fullName: w.fullName,
      managerName: w.managerName || w.manager || '',
      phone: w.phone,
      dangerClass: w.dangerClass,
      dangerDescription: w.dangerDescription,
      employeeCount: w.employeeCount,
      isActive: w.isActive ?? true,
    });
    setIsWorkshopModalOpen(true);
  };

  const handleSaveWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopForm.code.trim() || !workshopForm.name.trim()) return;

    if (editingWorkshop) {
      onUpdateWorkshop(editingWorkshop.code, {
        name: workshopForm.name,
        fullName: workshopForm.fullName,
        managerName: workshopForm.managerName,
        phone: workshopForm.phone,
        dangerClass: workshopForm.dangerClass,
        dangerDescription: workshopForm.dangerDescription,
        employeeCount: workshopForm.employeeCount,
        isActive: workshopForm.isActive,
      });
    } else {
      onAddWorkshop({
        code: workshopForm.code.toUpperCase().trim(),
        name: workshopForm.name.trim(),
        fullName: workshopForm.fullName.trim() || workshopForm.name.trim(),
        managerName: workshopForm.managerName.trim() || 'Белгиланмаган',
        phone: workshopForm.phone.trim(),
        dangerClass: workshopForm.dangerClass,
        dangerDescription: workshopForm.dangerDescription.trim(),
        employeeCount: workshopForm.employeeCount,
        isActive: true,
      });
    }

    setIsWorkshopModalOpen(false);
  };

  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm({
      fullName: '',
      badgeNumber: `T-${Math.floor(10000 + Math.random() * 90000)}`,
      workshopCode: workshops[0]?.code || 'СПЦ',
      role: 'RESPONSIBLE_EMPLOYEE',
      phone: '+998 70 214-',
      assignedZone: '',
      status: 'ACTIVE',
    });
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: EmployeeUser) => {
    setEditingEmployee(emp);
    setEmployeeForm({
      fullName: emp.fullName,
      badgeNumber: emp.badgeNumber,
      workshopCode: emp.workshopCode,
      role: emp.role,
      phone: emp.phone,
      assignedZone: emp.assignedZone,
      status: emp.status,
    });
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.fullName.trim() || !employeeForm.badgeNumber.trim()) return;

    const workshop = workshops.find((w) => w.code === employeeForm.workshopCode);

    if (editingEmployee) {
      onUpdateEmployee(editingEmployee.id, {
        fullName: employeeForm.fullName,
        badgeNumber: employeeForm.badgeNumber,
        workshopCode: employeeForm.workshopCode,
        workshopName: workshop?.name || employeeForm.workshopCode,
        role: employeeForm.role,
        phone: employeeForm.phone,
        assignedZone: employeeForm.assignedZone,
        status: employeeForm.status,
      });
    } else {
      const newEmp: EmployeeUser = {
        id: `USR-${Date.now().toString().slice(-4)}`,
        username: `user_${Date.now().toString().slice(-4)}`,
        fullName: employeeForm.fullName,
        badgeNumber: employeeForm.badgeNumber,
        workshopCode: employeeForm.workshopCode,
        workshopName: workshop?.name || employeeForm.workshopCode,
        role: employeeForm.role,
        phone: employeeForm.phone,
        assignedZone: employeeForm.assignedZone,
        status: employeeForm.status,
        permissions: {
          canManageWorkshops: employeeForm.role === 'ADMIN',
          canManageUsers: employeeForm.role === 'ADMIN',
          canManageCatalog: employeeForm.role === 'ADMIN',
          canCreateInspection: employeeForm.role === 'INSPECTOR' || employeeForm.role === 'ADMIN',
          canAddDefect: employeeForm.role === 'INSPECTOR' || employeeForm.role === 'ADMIN' || employeeForm.role === 'WORKSHOP_HEAD',
          canSubmitResolution: employeeForm.role === 'RESPONSIBLE_EMPLOYEE' || employeeForm.role === 'WORKSHOP_HEAD',
          canCloseDefect: employeeForm.role === 'INSPECTOR' || employeeForm.role === 'ADMIN',
          canReturnDefect: employeeForm.role === 'INSPECTOR' || employeeForm.role === 'ADMIN',
          canViewAllWorkshops: employeeForm.role === 'ADMIN' || employeeForm.role === 'EXECUTIVE' || employeeForm.role === 'INSPECTOR' || employeeForm.role === 'OBSERVER',
          canExportReports: true,
          canViewAuditLogs: employeeForm.role === 'ADMIN' || employeeForm.role === 'EXECUTIVE' || employeeForm.role === 'INSPECTOR',
        },
        addedDate: new Date().toISOString().split('T')[0],
      };
      onAddEmployee(newEmp);
    }

    setIsEmployeeModalOpen(false);
  };

  const getRoleIcon = (role: SystemRole) => {
    switch (role) {
      case 'ADMIN': return UserCog;
      case 'EXECUTIVE': return Crown;
      case 'INSPECTOR': return ShieldCheck;
      case 'WORKSHOP_HEAD': return Building2;
      case 'RESPONSIBLE_EMPLOYEE': return Wrench;
      case 'OBSERVER': return Eye;
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Banner */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 sm:p-8 shadow-industrial">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-[#082428] border border-[#1b535c] text-[#94a3b8] shadow-inner shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-black text-[#94a3b8] uppercase tracking-wider mb-1">
                <span>{language === 'UZ' ? 'Администратор бошқарув маркази' : 'Панель администратора'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {language === 'UZ' ? 'Цехлар ва ходимлар бошқарув модули' : 'Управление цехами и персоналом'}
              </h2>
              <p className="text-xs sm:text-sm text-[#E9EDF2]/80 mt-1 max-w-2xl">
                {language === 'UZ' 
                  ? 'Янги цех қўшиш, бошлиқларни бириктириш, ходимларнинг 6 та роллари ва ваколатларини бошқариш'
                  : 'Создание цехов, закрепление начальников цехов и управление ролями сотрудников'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {activeSubTab === 'WORKSHOPS' ? (
              <button
                type="button"
                onClick={handleOpenAddWorkshop}
                className="px-5 py-2.5 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{language === 'UZ' ? 'Янги цех қўшиш' : 'Добавить цех'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddEmployee}
                className="px-5 py-2.5 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{language === 'UZ' ? 'Янги ходим қўшиш' : 'Добавить сотрудника'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#1b535c] pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('WORKSHOPS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'WORKSHOPS'
              ? 'bg-[#475569] text-white border border-[#64748b] font-black shadow-md'
              : 'bg-[#0f3b42] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{language === 'UZ' ? 'Корхона цехлари' : 'Цеха предприятия'} ({workshops.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('EMPLOYEES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'EMPLOYEES'
              ? 'bg-[#475569] text-white border border-[#64748b] font-black shadow-md'
              : 'bg-[#0f3b42] text-[#E9EDF2]/80 hover:text-white border border-[#1b535c]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'UZ' ? 'Ходимлар ва 6 та роль' : 'Сотрудники и роли'} ({employees.length})</span>
        </button>
      </div>

      {/* WORKSHOPS TAB */}
      {activeSubTab === 'WORKSHOPS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-[#0f3b42] border border-[#1b535c] p-3 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E9EDF2]/40" />
              <input
                type="text"
                value={workshopSearch}
                onChange={(e) => setWorkshopSearch(e.target.value)}
                placeholder={language === 'UZ' ? 'Цех номи, коди бўйича қидириш...' : 'Поиск по коду или названию...'}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs focus:outline-none focus:border-[#64748b]"
              />
            </div>
            <div className="text-xs text-[#E9EDF2]/60 font-mono">
              {language === 'UZ' ? 'Жами:' : 'Всего:'} <strong className="text-white font-bold">{filteredWorkshops.length}</strong> та цех
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkshops.map((w) => {
              const assignedCount = employees.filter((e) => e.workshopCode === w.code).length;

              return (
                <div
                  key={w.code}
                  className={`p-5 rounded-3xl bg-[#0f3b42] border transition-all space-y-3 shadow-industrial ${
                    w.isActive ? 'border-[#1b535c] hover:border-[#64748b]' : 'border-[#1b535c]/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#cbd5e1] bg-[#475569]/30 px-2.5 py-1 rounded-lg border border-[#64748b]/40">
                        {w.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        w.dangerClass === 'A' ? 'bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30' : 'bg-[#475569]/30 text-[#cbd5e1] border-[#64748b]/30'
                      }`}>
                        {w.dangerClass}-тоифа
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditWorkshop(w)}
                        className="p-1.5 rounded-lg bg-[#082428] text-[#E9EDF2] hover:text-[#cbd5e1] border border-[#1b535c] transition-colors cursor-pointer"
                        title="Таҳрирлаш"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateWorkshop(w.code, { isActive: !w.isActive })}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          w.isActive ? 'bg-[#082428] text-[#10b981] border-[#1b535c]' : 'bg-[#082428] text-[#E9EDF2]/40 border-[#1b535c]'
                        }`}
                        title={w.isActive ? 'Нофаол қилиш (Тарих сақланади)' : 'Фаоллаштириш'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-sm text-white">{w.name}</h3>
                    <p className="text-[11px] text-[#E9EDF2]/75 mt-0.5 leading-relaxed truncate" title={w.fullName}>
                      {w.fullName}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#082428] border border-[#1b535c] space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[#E9EDF2]/80">
                      <span>{language === 'UZ' ? 'Цех бошлиғи:' : 'Начальник:'}</span>
                      <strong className="text-white font-bold">{w.managerName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[#E9EDF2]/80">
                      <span>{language === 'UZ' ? 'Телефон:' : 'Телефон:'}</span>
                      <span className="font-mono text-[#cbd5e1]">{w.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#E9EDF2]/80">
                      <span>{language === 'UZ' ? 'Ходимлар сони:' : 'Персонал:'}</span>
                      <span className="font-mono font-bold text-white">{w.employeeCount} нафар</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#E9EDF2]/60 pt-1 border-t border-[#1b535c]/40 font-mono">
                    <span>{assignedCount} {language === 'UZ' ? 'тизим ходими' : 'пользователей'}</span>
                    <span className={w.isActive ? 'text-[#10b981] font-bold' : 'text-[#E9EDF2]/40'}>
                      {w.isActive ? 'ФАОЛ' : 'НОФАОЛ'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EMPLOYEES TAB */}
      {activeSubTab === 'EMPLOYEES' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0f3b42] border border-[#1b535c] p-3 rounded-2xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E9EDF2]/40" />
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder={language === 'UZ' ? 'Исм, табел №, цех бўйича...' : 'Поиск по ФИО или табелю...'}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs focus:outline-none focus:border-[#64748b]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs font-bold"
              >
                <option value="ALL">{language === 'UZ' ? 'Барча роллар (6 та)' : 'Все роли (6)'}</option>
                <option value="ADMIN">Администратор</option>
                <option value="EXECUTIVE">Корхона раҳбари</option>
                <option value="INSPECTOR">Ёнғин назоратчиси</option>
                <option value="WORKSHOP_HEAD">Цех бошлиғи</option>
                <option value="RESPONSIBLE_EMPLOYEE">Масъул ходим</option>
                <option value="OBSERVER">Кузатувчи</option>
              </select>

              <span className="text-xs text-[#E9EDF2]/60 font-mono">
                {filteredEmployees.length} {language === 'UZ' ? 'та ходим' : 'сотрудников'}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl overflow-hidden shadow-industrial">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#082428] border-b border-[#1b535c] text-[#E9EDF2]/80 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">{language === 'UZ' ? 'Ф.И.Ш. ва Табел' : 'ФИО и Табель'}</th>
                    <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Тизимдаги роли' : 'Роль в системе'}</th>
                    <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Цех ва Зона' : 'Цех и Участок'}</th>
                    <th className="py-3.5 px-3 font-bold">{language === 'UZ' ? 'Телефон' : 'Телефон'}</th>
                    <th className="py-3.5 px-3 font-bold text-center">{language === 'UZ' ? 'Ҳолат' : 'Статус'}</th>
                    <th className="py-3.5 px-4 font-bold text-right">{language === 'UZ' ? 'Амаллар' : 'Действия'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b535c]/60 text-white">
                  {filteredEmployees.map((emp) => {
                    const RoleIcon = getRoleIcon(emp.role);
                    const rInfo = ROLE_INFO[emp.role];

                    return (
                      <tr key={emp.id} className="hover:bg-[#12454d] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-sm text-white">{emp.fullName}</div>
                          <div className="text-[11px] font-mono text-[#E9EDF2]/60 mt-0.5">
                            Табел: <span className="text-[#cbd5e1] font-bold">{emp.badgeNumber}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black font-mono ${rInfo.badgeClass}`}>
                            <RoleIcon className="w-3.5 h-3.5" />
                            {language === 'UZ' ? rInfo.nameUz : rInfo.nameRu}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-extrabold text-xs text-[#E9EDF2] font-mono bg-[#082428] px-1.5 py-0.5 rounded border border-[#1b535c] inline-block">
                            {emp.workshopCode}
                          </div>
                          <div className="text-[11px] text-[#E9EDF2]/80 truncate max-w-xs" title={emp.assignedZone}>
                            {emp.assignedZone || 'Умумий ҳудуд'}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-xs text-[#E9EDF2]/90 whitespace-nowrap">
                          {emp.phone}
                        </td>

                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            emp.status === 'ON_DUTY' 
                              ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30' 
                              : emp.status === 'ACTIVE' 
                              ? 'bg-[#082428] text-[#E9EDF2] border-[#1b535c]' 
                              : 'bg-[#082428] text-[#E9EDF2]/50 border-[#1b535c]'
                          }`}>
                            {emp.status === 'ON_DUTY' ? 'Сменада' : emp.status === 'ACTIVE' ? 'Фаол' : 'Таътилда'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditEmployee(emp)}
                              className="p-1.5 rounded-lg bg-[#082428] text-[#E9EDF2] hover:text-[#cbd5e1] border border-[#1b535c] transition-colors cursor-pointer"
                              title="Таҳрирлаш"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateEmployee(emp.id, { status: emp.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE' })}
                              className="p-1.5 rounded-lg bg-[#082428] text-[#E9EDF2]/70 hover:text-[#ef4444] border border-[#1b535c] transition-colors cursor-pointer"
                              title={emp.status === 'INACTIVE' ? 'Фаоллаштириш' : 'Нофаол қилиш'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Workshop Modal */}
      {isWorkshopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 shadow-2xl text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b535c]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#94a3b8]" />
                <h4 className="font-black text-sm text-white">
                  {editingWorkshop ? 'Цех маълумотларини таҳрирлаш' : 'Янги цех қўшиш'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsWorkshopModalOpen(false)}
                className="p-1 rounded-lg text-[#E9EDF2]/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkshop} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Цех коди: *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingWorkshop)}
                    value={workshopForm.code}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, code: e.target.value })}
                    placeholder="Масалан: СПЦ"
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Хавф тоифаси:</label>
                  <select
                    value={workshopForm.dangerClass}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, dangerClass: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-bold"
                  >
                    <option value="A">А тоифа (Ўта юқори хавфли)</option>
                    <option value="B">B тоифа (Юқори хавфли)</option>
                    <option value="V">V тоифа (Ўрта хавфли)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Цех қисқа номи: *</label>
                <input
                  type="text"
                  required
                  value={workshopForm.name}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, name: e.target.value })}
                  placeholder="Сортопрокат цехи"
                  className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Цех тўлиқ номи:</label>
                <input
                  type="text"
                  value={workshopForm.fullName}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, fullName: e.target.value })}
                  placeholder="Навли прокатлаш ва тайёр маҳсулотлар цехи (СПЦ)"
                  className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Цех бошлиғи Ф.И.Ш.:</label>
                  <input
                    type="text"
                    value={workshopForm.managerName}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, managerName: e.target.value })}
                    placeholder="Раҳимов А. К."
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Алоқа телефони:</label>
                  <input
                    type="text"
                    value={workshopForm.phone}
                    onChange={(e) => setWorkshopForm({ ...workshopForm, phone: e.target.value })}
                    placeholder="+998 70 214-XX-XX"
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Хавф тавсифи:</label>
                <input
                  type="text"
                  value={workshopForm.dangerDescription}
                  onChange={(e) => setWorkshopForm({ ...workshopForm, dangerDescription: e.target.value })}
                  placeholder="Иссиқ прокатлаш станлари ва мойлаш тизимлари ҳудуди"
                  className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b535c]">
                <button
                  type="button"
                  onClick={() => setIsWorkshopModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#082428] text-[#E9EDF2] hover:text-white border border-[#1b535c] font-bold"
                >
                  Бекор қилиш
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Сақлаш
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 shadow-2xl text-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#1b535c]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#94a3b8]" />
                <h4 className="font-black text-sm text-white">
                  {editingEmployee ? 'Ходим маълумотлари ва ролини таҳрирлаш' : 'Янги ходим қўшиш ва роль бериш'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-1 rounded-lg text-[#E9EDF2]/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Ф.И.Ш.: *</label>
                  <input
                    type="text"
                    required
                    value={employeeForm.fullName}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, fullName: e.target.value })}
                    placeholder="Норматов Санжар Б."
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Табел рақами: *</label>
                  <input
                    type="text"
                    required
                    value={employeeForm.badgeNumber}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, badgeNumber: e.target.value })}
                    placeholder="T-12345"
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Бириктирилган цех:</label>
                  <select
                    value={employeeForm.workshopCode}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, workshopCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-bold"
                  >
                    <option value="ALL">Барча цехлар (Корхона бўйича)</option>
                    {workshops.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} — {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Тизимдаги роли: *</label>
                  <select
                    value={employeeForm.role}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value as SystemRole })}
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-bold"
                  >
                    <option value="ADMIN">1. Администратор (Тўлиқ ҳуқуқ)</option>
                    <option value="EXECUTIVE">2. Корхона раҳбари (Dashboard ва мониторинг)</option>
                    <option value="INSPECTOR">3. Ёнғин назоратчиси (Текширув ва қабул қилиш)</option>
                    <option value="WORKSHOP_HEAD">4. Цех бошлиғи (Цех ижроси)</option>
                    <option value="RESPONSIBLE_EMPLOYEE">5. Масъул ходим (Ижро ва фото топшириш)</option>
                    <option value="OBSERVER">6. Кузатувчи (Фақат кўриш)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Алоқа телефони:</label>
                  <input
                    type="text"
                    value={employeeForm.phone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    placeholder="+998 70 214-XX-XX"
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#E9EDF2] mb-1">Масъулият зонаси:</label>
                  <input
                    type="text"
                    value={employeeForm.assignedZone}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, assignedZone: e.target.value })}
                    placeholder="Масалан: 1-сонли печ ва кран йўллари"
                    className="w-full px-3 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b535c]">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#082428] text-[#E9EDF2] hover:text-white border border-[#1b535c] font-bold"
                >
                  Бекор қилиш
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Сақлаш
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
