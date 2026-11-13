import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Wrench, 
  HardHat, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Building2, 
  Phone, 
  AlertCircle,
  Sliders,
  CheckCircle2,
  FileCheck,
  Camera,
  Flame
} from 'lucide-react';
import { EmployeeRoleAssignment, UserRole, Language } from '../../types';
import { WORKSHOPS } from '../../data/mockData';
import { INITIAL_EMPLOYEES } from '../../data/mockRolesData';
import { TRANSLATIONS } from '../../utils/translations';

const ROLES_STORAGE_KEY = 'firesafety_control_roles_v1';

interface SettingsViewProps {
  language: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  // Persistent employee list
  const [employees, setEmployees] = useState<EmployeeRoleAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(ROLES_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved roles', e);
    }
    return INITIAL_EMPLOYEES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(employees));
    } catch (e) {
      console.error('Failed to save roles', e);
    }
  }, [employees]);

  // Filters
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRoleAssignment | null>(null);

  // Form State for Adding / Editing Role
  const [formData, setFormData] = useState<{
    fullName: string;
    badgeNumber: string;
    workshopCode: string;
    role: EmployeeRoleAssignment['role'];
    phone: string;
    assignedZone: string;
    status: 'ACTIVE' | 'ON_DUTY' | 'VACATION';
    canReportDefect: boolean;
    canUploadResolution: boolean;
    canCloseDefect: boolean;
    canAuditChecklist: boolean;
  }>({
    fullName: '',
    badgeNumber: '',
    workshopCode: 'SPZ',
    role: 'MASTER',
    phone: '+998 70 ',
    assignedZone: '',
    status: 'ON_DUTY',
    canReportDefect: true,
    canUploadResolution: true,
    canCloseDefect: false,
    canAuditChecklist: true,
  });

  // Filtered list
  const filteredEmployees = employees.filter((emp) => {
    if (selectedWorkshop !== 'ALL' && emp.workshopCode !== selectedWorkshop) return false;
    if (selectedRole !== 'ALL' && emp.role !== selectedRole) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = emp.fullName.toLowerCase().includes(query);
      const matchBadge = emp.badgeNumber.toLowerCase().includes(query);
      const matchZone = emp.assignedZone.toLowerCase().includes(query);
      if (!matchName && !matchBadge && !matchZone) return false;
    }
    return true;
  });

  // Role counters
  const totalCount = employees.length;
  const masterCount = employees.filter((e) => e.role === 'MASTER').length;
  const executorCount = employees.filter((e) => e.role === 'EXECUTOR').length;
  const supervisorCount = employees.filter((e) => e.role === 'SUPERVISOR').length;
  const inspectorCount = employees.filter((e) => e.role === 'INSPECTOR').length;

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      fullName: '',
      badgeNumber: `T-${Math.floor(10000 + Math.random() * 90000)}`,
      workshopCode: selectedWorkshop !== 'ALL' ? selectedWorkshop : 'SPZ',
      role: 'MASTER',
      phone: '+998 70 214-',
      assignedZone: '',
      status: 'ON_DUTY',
      canReportDefect: true,
      canUploadResolution: true,
      canCloseDefect: false,
      canAuditChecklist: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: EmployeeRoleAssignment) => {
    setEditingEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      badgeNumber: emp.badgeNumber,
      workshopCode: emp.workshopCode,
      role: emp.role,
      phone: emp.phone,
      assignedZone: emp.assignedZone,
      status: emp.status,
      canReportDefect: emp.permissions.canReportDefect,
      canUploadResolution: emp.permissions.canUploadResolution,
      canCloseDefect: emp.permissions.canCloseDefect,
      canAuditChecklist: emp.permissions.canAuditChecklist,
    });
    setIsModalOpen(true);
  };

  // Adjust default permissions when role is changed in form
  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === 'EXECUTOR') {
      setFormData((prev) => ({
        ...prev,
        role: newRole,
        canReportDefect: true,
        canUploadResolution: true,
        canCloseDefect: false,
        canAuditChecklist: false,
      }));
    } else if (newRole === 'MASTER') {
      setFormData((prev) => ({
        ...prev,
        role: newRole,
        canReportDefect: true,
        canUploadResolution: true,
        canCloseDefect: false,
        canAuditChecklist: true,
      }));
    } else if (newRole === 'SUPERVISOR') {
      setFormData((prev) => ({
        ...prev,
        role: newRole,
        canReportDefect: true,
        canUploadResolution: true,
        canCloseDefect: false,
        canAuditChecklist: true,
      }));
    } else if (newRole === 'INSPECTOR') {
      setFormData((prev) => ({
        ...prev,
        role: newRole,
        canReportDefect: true,
        canUploadResolution: true,
        canCloseDefect: true,
        canAuditChecklist: true,
      }));
    }
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.badgeNumber.trim()) {
      alert(language === 'UZ' ? 'Илтимос, исм ва табел рақамини киритинг' : 'Пожалуйста, введите ФИО и табельный номер');
      return;
    }

    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployee.id
            ? {
                ...emp,
                fullName: formData.fullName,
                badgeNumber: formData.badgeNumber,
                workshopCode: formData.workshopCode,
                role: formData.role,
                phone: formData.phone,
                assignedZone: formData.assignedZone || `${formData.workshopCode} асосий блоки`,
                status: formData.status,
                permissions: {
                  canReportDefect: formData.canReportDefect,
                  canUploadResolution: formData.canUploadResolution,
                  canCloseDefect: formData.canCloseDefect,
                  canAuditChecklist: formData.canAuditChecklist,
                },
              }
            : emp
        )
      );
    } else {
      const newEmp: EmployeeRoleAssignment = {
        id: `EMP-${Date.now().toString().slice(-4)}`,
        fullName: formData.fullName,
        badgeNumber: formData.badgeNumber,
        workshopCode: formData.workshopCode,
        role: formData.role,
        phone: formData.phone,
        assignedZone: formData.assignedZone || `${formData.workshopCode} участкаси`,
        status: formData.status,
        permissions: {
          canReportDefect: formData.canReportDefect,
          canUploadResolution: formData.canUploadResolution,
          canCloseDefect: formData.canCloseDefect,
          canAuditChecklist: formData.canAuditChecklist,
        },
        addedDate: new Date().toISOString().split('T')[0],
      };
      setEmployees((prev) => [newEmp, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    const confirmMsg = language === 'UZ'
      ? `«${name}» ходимнинг тизимдаги ролини бекор қилмоқчимисиз?`
      : `Вы действительно хотите снять роль с сотрудника «${name}»?`;
    if (window.confirm(confirmMsg)) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const togglePermissionInline = (empId: string, permKey: keyof EmployeeRoleAssignment['permissions']) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== empId) return emp;
        return {
          ...emp,
          permissions: {
            ...emp.permissions,
            [permKey]: !emp.permissions[permKey],
          },
        };
      })
    );
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'MASTER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-[#15464f] text-[#cbd5e1] border border-[#225761]">
            <HardHat className="w-3.5 h-3.5" />
            {language === 'UZ' ? 'Катта уста (Мастер)' : 'Старший мастер'}
          </span>
        );
      case 'EXECUTOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-[#15464f] text-[#E9EDF2] border border-[#225761]">
            <Wrench className="w-3.5 h-3.5 text-[#94a3b8]" />
            {language === 'UZ' ? 'Ижрочи (Чилангар)' : 'Исполнитель (Слесарь)'}
          </span>
        );
      case 'SUPERVISOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-[#15464f] text-[#E9EDF2] border border-[#225761]">
            <UserCheck className="w-3.5 h-3.5 text-[#94a3b8]" />
            {language === 'UZ' ? 'Цех бошлиғи' : 'Начальник цеха'}
          </span>
        );
      case 'INSPECTOR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-[#15464f] text-[#E9EDF2] border border-[#225761]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#94a3b8]" />
            {language === 'UZ' ? 'ЁХХ Инспектори' : 'Инспектор ГПС'}
          </span>
        );
    }
  };

  const getStatusBadge = (status: EmployeeRoleAssignment['status']) => {
    switch (status) {
      case 'ON_DUTY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10b981] bg-[#10b981]/10 px-2.5 py-0.5 rounded-full border border-[#10b981]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            {t.statusOnDuty}
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E9EDF2] bg-[#0b2e34] px-2.5 py-0.5 rounded-full border border-[#1b535c]">
            {t.statusActive}
          </span>
        );
      case 'VACATION':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E9EDF2]/60 bg-[#082428] px-2.5 py-0.5 rounded-full border border-[#1b535c]">
            {t.statusVacation}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 sm:p-8 shadow-industrial">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="p-3.5 rounded-2xl bg-[#082428] border border-[#1b535c] text-[#94a3b8] shadow-inner shrink-0">
              <Sliders className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-black text-[#94a3b8] uppercase tracking-wider mb-1">
                <Users className="w-3.5 h-3.5" />
                {language === 'UZ' ? 'Масъул ходимлар ва роллар тизими' : 'Штатное расписание и роли'}
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {t.settingsTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#E9EDF2]/80 mt-1.5 max-w-3xl leading-relaxed">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="self-start lg:self-center px-5 py-3 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.addRoleBtn}</span>
          </button>
        </div>
      </div>

      {/* Role Counts Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Masters */}
        <div 
          onClick={() => setSelectedRole(selectedRole === 'MASTER' ? 'ALL' : 'MASTER')}
          className={`p-5 rounded-2xl bg-[#0f3b42] border transition-all cursor-pointer ${
            selectedRole === 'MASTER'
              ? 'border-[#64748b] ring-2 ring-[#64748b]/40 shadow-lg'
              : 'border-[#1b535c] hover:border-[#64748b]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E9EDF2]/75">
              {t.roleMasters}
            </span>
            <div className="p-2 rounded-xl bg-[#475569]/30 text-[#cbd5e1]">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-3">
            {masterCount} <span className="text-xs font-normal text-[#E9EDF2]/70 font-sans">{language === 'UZ' ? 'нафар' : 'чел.'}</span>
          </div>
          <p className="text-[11px] text-[#E9EDF2]/60 mt-1 truncate">
            {language === 'UZ' ? 'Кунлик кўрик ва назорат' : 'Ежедневный осмотр'}
          </p>
        </div>

        {/* Card 2: Executors */}
        <div 
          onClick={() => setSelectedRole(selectedRole === 'EXECUTOR' ? 'ALL' : 'EXECUTOR')}
          className={`p-5 rounded-2xl bg-[#0f3b42] border transition-all cursor-pointer ${
            selectedRole === 'EXECUTOR'
              ? 'border-[#64748b] ring-2 ring-[#64748b]/30 shadow-lg'
              : 'border-[#1b535c] hover:border-[#64748b]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E9EDF2]/75">
              {t.roleExecutors}
            </span>
            <div className="p-2 rounded-xl bg-[#082428] text-[#94a3b8] border border-[#1b535c]">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-3">
            {executorCount} <span className="text-xs font-normal text-[#E9EDF2]/70 font-sans">{language === 'UZ' ? 'нафар' : 'чел.'}</span>
          </div>
          <p className="text-[11px] text-[#E9EDF2]/60 mt-1 truncate">
            {language === 'UZ' ? 'Таъмирлаш ва фото далил' : 'Ремонт и фотоотчет'}
          </p>
        </div>

        {/* Card 3: Shop Supervisors */}
        <div 
          onClick={() => setSelectedRole(selectedRole === 'SUPERVISOR' ? 'ALL' : 'SUPERVISOR')}
          className={`p-5 rounded-2xl bg-[#0f3b42] border transition-all cursor-pointer ${
            selectedRole === 'SUPERVISOR'
              ? 'border-[#64748b] ring-2 ring-[#64748b]/30 shadow-lg'
              : 'border-[#1b535c] hover:border-[#64748b]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E9EDF2]/75">
              {t.roleSupervisors}
            </span>
            <div className="p-2 rounded-xl bg-[#082428] text-[#94a3b8] border border-[#1b535c]">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-3">
            {supervisorCount} <span className="text-xs font-normal text-[#E9EDF2]/70 font-sans">{language === 'UZ' ? 'нафар' : 'чел.'}</span>
          </div>
          <p className="text-[11px] text-[#E9EDF2]/60 mt-1 truncate">
            {language === 'UZ' ? 'Далолатнома имзолаш' : 'Подписание актов'}
          </p>
        </div>

        {/* Card 4: Inspectors */}
        <div 
          onClick={() => setSelectedRole(selectedRole === 'INSPECTOR' ? 'ALL' : 'INSPECTOR')}
          className={`p-5 rounded-2xl bg-[#0f3b42] border transition-all cursor-pointer ${
            selectedRole === 'INSPECTOR'
              ? 'border-[#64748b] ring-2 ring-[#64748b]/30 shadow-lg'
              : 'border-[#1b535c] hover:border-[#64748b]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E9EDF2]/75">
              {t.roleInspectors}
            </span>
            <div className="p-2 rounded-xl bg-[#082428] text-[#94a3b8] border border-[#1b535c]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono mt-3">
            {inspectorCount} <span className="text-xs font-normal text-[#E9EDF2]/70 font-sans">{language === 'UZ' ? 'нафар' : 'чел.'}</span>
          </div>
          <p className="text-[11px] text-[#E9EDF2]/60 mt-1 truncate">
            {language === 'UZ' ? 'Чек-лист ва қабул қилиш' : 'Чек-листы и приемка'}
          </p>
        </div>
      </div>

      {/* Workshop Navigation Filters */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl p-4 shadow-industrial space-y-4">
        {/* Workshop Pill Tabs */}
        <div>
          <div className="text-xs font-bold text-[#E9EDF2]/70 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#94a3b8]" />
            <span>{language === 'UZ' ? 'Цехлар кесимида филтр' : 'Фильтр по цехам'}:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedWorkshop('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedWorkshop === 'ALL'
                  ? 'bg-[#475569] text-white font-black shadow-md'
                  : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white hover:bg-[#154c55] border border-[#1b535c]'
              }`}
            >
              {t.allWorkshops} ({totalCount})
            </button>

            {WORKSHOPS.map((ws) => {
              const count = employees.filter((e) => e.workshopCode === ws.code).length;
              return (
                <button
                  key={ws.code}
                  type="button"
                  onClick={() => setSelectedWorkshop(ws.code)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    selectedWorkshop === ws.code
                      ? 'bg-[#475569] text-white font-black shadow-md'
                      : 'bg-[#082428] text-[#E9EDF2]/80 hover:text-white hover:bg-[#154c55] border border-[#1b535c]'
                  }`}
                >
                  <span>{ws.code}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    selectedWorkshop === ws.code ? 'bg-[#334155] text-white' : 'bg-[#154c55] text-white'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Role Quick filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1b535c]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#E9EDF2]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#082428] border border-[#1b535c] text-white text-xs placeholder:text-[#E9EDF2]/40 focus:outline-none focus:border-[#64748b] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-[#E9EDF2]/60">
              {language === 'UZ' ? 'Топилди:' : 'Найдено:'} <strong className="text-white font-mono">{filteredEmployees.length}</strong> {language === 'UZ' ? 'та ходим' : 'сотрудников'}
            </span>

            {(selectedWorkshop !== 'ALL' || selectedRole !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedWorkshop('ALL');
                  setSelectedRole('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-[#cbd5e1] hover:underline font-bold ml-2 cursor-pointer"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Role Assignment Main Table */}
      <div className="bg-[#0f3b42] border border-[#1b535c] rounded-2xl overflow-hidden shadow-industrial">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082428] border-b border-[#1b535c] text-[#E9EDF2]/80 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">{t.tableFullName}</th>
                <th className="py-3.5 px-3 font-bold">{t.tableRole}</th>
                <th className="py-3.5 px-3 font-bold">{t.tableWorkshop} / {t.zone}</th>
                <th className="py-3.5 px-3 font-bold">{t.tablePhone}</th>
                <th className="py-3.5 px-4 font-bold">{t.tablePermissions}</th>
                <th className="py-3.5 px-3 font-bold text-center">{t.tableStatus}</th>
                <th className="py-3.5 px-4 font-bold text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b535c]/60 text-white">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#E9EDF2]/60">
                    <AlertCircle className="w-8 h-8 text-[#94a3b8] mx-auto mb-2 opacity-80" />
                    <p className="text-sm font-bold text-white">
                      {language === 'UZ' ? 'Белгиланган талаб бўйича ходимлар топилмади' : 'Сотрудники по заданным параметрам не найдены'}
                    </p>
                    <p className="text-xs text-[#E9EDF2]/60 mt-1">
                      {language === 'UZ' ? 'Филтрларни тозаланг ёки янги ходим қўшинг' : 'Сбросьте фильтры или добавьте новую запись'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  return (
                    <tr key={emp.id} className="hover:bg-[#12454d] transition-colors">
                      {/* Name & Badge */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#082428] border border-[#1b535c] flex items-center justify-center font-bold text-[#cbd5e1] text-xs font-mono shrink-0">
                            {emp.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-white">
                              {emp.fullName}
                            </div>
                            <div className="text-[11px] font-mono text-[#E9EDF2]/60 mt-0.5">
                              {t.tableBadge}: <span className="text-[#cbd5e1] font-bold">{emp.badgeNumber}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="py-4 px-3 whitespace-nowrap">
                        {getRoleBadge(emp.role)}
                      </td>

                      {/* Workshop & Zone */}
                      <td className="py-4 px-3">
                        <div className="font-extrabold text-xs text-[#E9EDF2] font-mono bg-[#082428] px-1.5 py-0.5 rounded border border-[#1b535c] inline-block">
                          {emp.workshopCode}
                        </div>
                        <div className="text-[11px] text-[#E9EDF2]/80 mt-0.5 max-w-xs truncate" title={emp.assignedZone}>
                          {emp.assignedZone}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-3 font-mono text-xs text-[#E9EDF2]/90 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#94a3b8]" />
                          <span>{emp.phone}</span>
                        </div>
                      </td>

                      {/* Permissions Matrix */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => togglePermissionInline(emp.id, 'canReportDefect')}
                            title={`${t.permReport} (${emp.permissions.canReportDefect ? 'БОР' : 'ЙЎҚ'})`}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              emp.permissions.canReportDefect
                                ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30'
                                : 'bg-[#082428] text-[#E9EDF2]/30 border border-[#1b535c]'
                            }`}
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>{t.permReport}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => togglePermissionInline(emp.id, 'canUploadResolution')}
                            title={`${t.permUpload} (${emp.permissions.canUploadResolution ? 'БОР' : 'ЙЎҚ'})`}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              emp.permissions.canUploadResolution
                                ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30'
                                : 'bg-[#082428] text-[#E9EDF2]/30 border border-[#1b535c]'
                            }`}
                          >
                            <Camera className="w-3 h-3" />
                            <span>{t.permUpload}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => togglePermissionInline(emp.id, 'canAuditChecklist')}
                            title={`${t.permAudit} (${emp.permissions.canAuditChecklist ? 'БОР' : 'ЙЎҚ'})`}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              emp.permissions.canAuditChecklist
                                ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30'
                                : 'bg-[#082428] text-[#E9EDF2]/30 border border-[#1b535c]'
                            }`}
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>{t.permAudit}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => togglePermissionInline(emp.id, 'canCloseDefect')}
                            title={`${t.permClose} (${emp.permissions.canCloseDefect ? 'БОР' : 'ЙЎҚ'})`}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              emp.permissions.canCloseDefect
                                ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30'
                                : 'bg-[#082428] text-[#E9EDF2]/30 border border-[#1b535c]'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{t.permClose}</span>
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 text-center whitespace-nowrap">
                        {getStatusBadge(emp.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-1.5 rounded-lg bg-[#082428] text-[#E9EDF2] hover:text-[#cbd5e1] hover:bg-[#154c55] border border-[#1b535c] transition-colors cursor-pointer"
                            title={t.edit}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmployee(emp.id, emp.fullName)}
                            className="p-1.5 rounded-lg bg-[#082428] text-[#E9EDF2] hover:text-[#ef4444] hover:bg-[#154c55] border border-[#1b535c] transition-colors cursor-pointer"
                            title={t.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Hierarchy & Responsibilities Guide */}
      <div className="p-6 rounded-2xl bg-[#0f3b42] border border-[#1b535c] shadow-industrial">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
          <ShieldCheck className="w-4 h-4 text-[#94a3b8]" />
          <span>{language === 'UZ' ? 'Металлургия мажмуасида роллар ва ваколатлар тақсимоти' : 'Распределение обязанностей и ролей по цехам'}</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#082428] border border-[#1b535c] space-y-1.5">
            <div className="flex items-center gap-2 font-black text-[#cbd5e1]">
              <HardHat className="w-4 h-4" />
              <span>{t.roleMasterName}</span>
            </div>
            <p className="text-[11px] text-[#E9EDF2]/80 leading-relaxed">
              {t.roleMasterDesc}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#082428] border border-[#1b535c] space-y-1.5">
            <div className="flex items-center gap-2 font-black text-[#cbd5e1]">
              <Wrench className="w-4 h-4" />
              <span>{t.roleExecutorName}</span>
            </div>
            <p className="text-[11px] text-[#E9EDF2]/80 leading-relaxed">
              {t.roleExecutorDesc}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#082428] border border-[#1b535c] space-y-1.5">
            <div className="flex items-center gap-2 font-black text-[#cbd5e1]">
              <UserCheck className="w-4 h-4" />
              <span>{t.roleSupervisorName}</span>
            </div>
            <p className="text-[11px] text-[#E9EDF2]/80 leading-relaxed">
              {t.roleSupervisorDesc}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#082428] border border-[#1b535c] space-y-1.5">
            <div className="flex items-center gap-2 font-black text-[#cbd5e1]">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.roleInspectorName}</span>
            </div>
            <p className="text-[11px] text-[#E9EDF2]/80 leading-relaxed">
              {t.roleInspectorDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Add or Edit Role Assignment */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#0f3b42] border border-[#1b535c] rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1b535c]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#475569]/30 text-[#cbd5e1]">
                  <HardHat className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {editingEmployee ? (language === 'UZ' ? 'Рол маълумотларини таҳрирлаш' : 'Редактирование роли сотрудника') : t.modalAddRoleTitle}
                  </h3>
                  <p className="text-xs text-[#E9EDF2]/70 mt-0.5">
                    {language === 'UZ' ? '«Ўзметкомбинат» АЖ цехлари кесимида масъулият зонасини белгилаш' : 'Закрепление зоны ответственности в цехах АО «Узметкомбинат»'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#E9EDF2]/60 hover:text-white hover:bg-[#154c55] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveRole} className="space-y-4 pt-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                    {t.fieldFullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Масалан: Норматов Санжар Бахтиёрович"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white focus:outline-none focus:border-[#64748b] transition-colors"
                  />
                </div>

                {/* Badge Number */}
                <div>
                  <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                    {t.fieldBadge}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.badgeNumber}
                    onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    placeholder="T-12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white focus:outline-none focus:border-[#64748b] transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Workshop */}
                <div>
                  <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                    {t.fieldWorkshop}
                  </label>
                  <select
                    value={formData.workshopCode}
                    onChange={(e) => setFormData({ ...formData, workshopCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white focus:outline-none focus:border-[#64748b] transition-colors"
                  >
                    {WORKSHOPS.map((ws) => (
                      <option key={ws.code} value={ws.code}>
                        {ws.code} — {ws.name} ({ws.fullName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                    {t.fieldRole}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white focus:outline-none focus:border-[#64748b] transition-colors font-bold"
                  >
                    <option value="MASTER">{language === 'UZ' ? 'Катта уста (Мастер) — Кунлик кўрик ва назорат' : 'Старший мастер — Осмотр и наряды'}</option>
                    <option value="EXECUTOR">{language === 'UZ' ? 'Ижрочи (Чилангар/Электрик) — Таъмир ва фото ҳисобот' : 'Исполнитель (Слесарь) — Ремонт и фото'}</option>
                    <option value="SUPERVISOR">{language === 'UZ' ? 'Цех бошлиғи — Далолатномалар ва муддатлар' : 'Начальник цеха — Координация'}</option>
                    <option value="INSPECTOR">{language === 'UZ' ? 'ЁХХ Инспектори — Аудит ва камчиликларни ёпиш' : 'Инспектор ГПС — Чек-листы и приемка'}</option>
                  </select>
                </div>
              </div>

              {/* Zone and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                    {t.fieldZone}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.assignedZone}
                    onChange={(e) => setFormData({ ...formData, assignedZone: e.target.value })}
                    placeholder="Масалан: 1-сонли печ ва гидравлика станцияси"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white focus:outline-none focus:border-[#64748b] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                    {t.fieldPhone}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998 70 214-XX-XX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white focus:outline-none focus:border-[#64748b] transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-[#E9EDF2] mb-1.5">
                  {t.tableStatus}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'ON_DUTY'}
                      onChange={() => setFormData({ ...formData, status: 'ON_DUTY' })}
                      className="accent-[#475569]"
                    />
                    <span className="font-bold">{t.statusOnDuty}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'ACTIVE'}
                      onChange={() => setFormData({ ...formData, status: 'ACTIVE' })}
                      className="accent-[#475569]"
                    />
                    <span className="font-bold">{t.statusActive}</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[#082428] border border-[#1b535c] text-white cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={formData.status === 'VACATION'}
                      onChange={() => setFormData({ ...formData, status: 'VACATION' })}
                      className="accent-[#475569]"
                    />
                    <span className="font-bold">{t.statusVacation}</span>
                  </label>
                </div>
              </div>

              {/* Permissions Checkboxes */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#E9EDF2] mb-2">
                  {t.fieldPermissions}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#082428] border border-[#1b535c] text-white cursor-pointer hover:bg-[#12454d] transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.canReportDefect}
                      onChange={(e) => setFormData({ ...formData, canReportDefect: e.target.checked })}
                      className="w-4 h-4 accent-[#475569] rounded"
                    />
                    <div>
                      <div className="font-bold">{t.permReport}</div>
                      <div className="text-[10px] text-[#E9EDF2]/60">{language === 'UZ' ? 'Аниқланган камчиликни тизимга қайд этиш' : 'Ввод нарушений в систему'}</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#082428] border border-[#1b535c] text-white cursor-pointer hover:bg-[#12454d] transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.canUploadResolution}
                      onChange={(e) => setFormData({ ...formData, canUploadResolution: e.target.checked })}
                      className="w-4 h-4 accent-[#475569] rounded"
                    />
                    <div>
                      <div className="font-bold">{t.permUpload}</div>
                      <div className="text-[10px] text-[#E9EDF2]/60">{language === 'UZ' ? 'Таъмирлашдан сўнг фото ҳисобот юклаш' : 'Загрузка фотоотчета об устранении'}</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#082428] border border-[#1b535c] text-white cursor-pointer hover:bg-[#12454d] transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.canAuditChecklist}
                      onChange={(e) => setFormData({ ...formData, canAuditChecklist: e.target.checked })}
                      className="w-4 h-4 accent-[#475569] rounded"
                    />
                    <div>
                      <div className="font-bold">{t.permAudit}</div>
                      <div className="text-[10px] text-[#E9EDF2]/60">{language === 'UZ' ? 'Норматив чек-лист кўригини ўтказиш' : 'Проведение нормативного чек-листа'}</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#082428] border border-[#1b535c] text-white cursor-pointer hover:bg-[#12454d] transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.canCloseDefect}
                      onChange={(e) => setFormData({ ...formData, canCloseDefect: e.target.checked })}
                      className="w-4 h-4 accent-[#475569] rounded"
                    />
                    <div>
                      <div className="font-bold">{t.permClose}</div>
                      <div className="text-[10px] text-[#E9EDF2]/60">{language === 'UZ' ? 'Камчиликни батамом ёпиш (Инспектор)' : 'Окончательное закрытие замечания'}</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1b535c]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#082428] text-[#E9EDF2] hover:text-white border border-[#1b535c] font-bold text-xs cursor-pointer"
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#475569] hover:bg-[#334155] border border-[#64748b] text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  {editingEmployee ? t.save : t.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
