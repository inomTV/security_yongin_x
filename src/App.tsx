import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { TopRoleSwitcher } from './components/layout/TopRoleSwitcher';
import { NotificationsCenter } from './components/layout/NotificationsCenter';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { InspectionsView } from './components/inspections/InspectionsView';
import { DefectsRegistry } from './components/registry/DefectsRegistry';
import { MyTasksView } from './components/supervisor/MyTasksView';
import { DefectCatalogView } from './components/catalog/DefectCatalogView';
import { WorkshopsEmployeesView } from './components/admin/WorkshopsEmployeesView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { ReportsView } from './components/reports/ReportsView';
import { DefectModal } from './components/common/DefectModal';
import { NewInspectionModal } from './components/inspections/NewInspectionModal';

import { 
  DefectItem, 
  DefectStatus, 
  ActiveTab, 
  Language, 
  SystemRole, 
  EmployeeUser,
  InspectionSession,
  Workshop,
  DefectCatalogItem,
  AuditLogEntry,
  SystemNotification
} from './types';

import { WORKSHOPS, INITIAL_DEFECTS } from './data/mockData';
import { INITIAL_SYSTEM_USERS } from './data/initialUsers';
import { CATALOG_100_ITEMS } from './data/catalog100';
import { TRANSLATIONS } from './utils/translations';
import { RotateCcw } from 'lucide-react';

const STORAGE_KEY_DEFECTS = 'firesafety_control_defects_v2';
const STORAGE_KEY_INSPECTIONS = 'firesafety_control_inspections_v2';
const STORAGE_KEY_WORKSHOPS = 'firesafety_control_workshops_v2';
const STORAGE_KEY_EMPLOYEES = 'firesafety_control_employees_v2';
const STORAGE_KEY_CATALOG = 'firesafety_control_catalog_v2';
const STORAGE_KEY_LOGS = 'firesafety_control_logs_v2';
const STORAGE_KEY_NOTIFICATIONS = 'firesafety_control_notifications_v2';
const LANG_STORAGE_KEY = 'firesafety_control_language_v1';
const ROLE_STORAGE_KEY = 'firesafety_control_role_v1';

// Initial Mock Inspection Sessions
const INITIAL_INSPECTIONS: InspectionSession[] = [
  {
    id: 'FS-000125',
    date: '2026-11-01',
    workshopCode: 'СПЦ',
    workshopName: 'Сортопрокат цехи',
    location: '2-сонли прокат стани ва тайёр маҳсулотлар майдони',
    inspectorId: 'USR-003',
    inspectorName: 'Алиев Улуғбек Нодирович',
    notes: 'Режали йиллик ёнғин хавфсизлиги кўриги',
    status: 'JARAYONDA',
    defectsCount: 2,
    resolvedCount: 0,
    createdAt: '2026-11-01 10:00',
  },
  {
    id: 'FS-000124',
    date: '2026-11-03',
    workshopCode: 'ККЦ',
    workshopName: 'Кислород-конвертер цехи',
    location: 'Конвертер №2 озиқлантирувчи кабел туннели',
    inspectorId: 'USR-003',
    inspectorName: 'Алиев Улуғбек Нодирович',
    notes: 'Кабель йўлларининг оловга қарши ҳолати текширилди',
    status: 'JARAYONDA',
    defectsCount: 1,
    resolvedCount: 0,
    createdAt: '2026-11-03 14:00',
  },
  {
    id: 'FS-000123',
    date: '2026-11-05',
    workshopCode: 'ТЭЦ',
    workshopName: 'Иссиқлик электр маркази',
    location: 'Турбина №1 ва автоматик ўчириш насос станцияси',
    inspectorId: 'USR-003',
    inspectorName: 'Алиев Улуғбек Нодирович',
    notes: 'Профилактик кўрикда камчиликлар аниқланмади. Барча тизимлар соз.',
    status: 'KAMCHILIK_ANIQLANMADI',
    defectsCount: 0,
    resolvedCount: 0,
    createdAt: '2026-11-05 11:30',
  },
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-11-01 10:15',
    userId: 'USR-003',
    userName: 'Алиев Улуғбек Нодирович',
    role: 'INSPECTOR',
    action: 'Янги текширув яратилди ва камчилик қайд этилди',
    entityType: 'INSPECTION',
    entityId: 'FS-000125',
    details: 'СПЦ цехи бўйича FS-D-000001 рақамли камчилик бириктирилди',
  },
  {
    id: 'LOG-002',
    timestamp: '2026-11-03 14:30',
    userId: 'USR-003',
    userName: 'Алиев Улуғбек Нодирович',
    role: 'INSPECTOR',
    action: 'Текширув далолатномаси расмийлаштирилди',
    entityType: 'INSPECTION',
    entityId: 'FS-000124',
    details: 'ККЦ цехи кабель эстакадаси бўйича камчилик киритилди',
  },
  {
    id: 'LOG-003',
    timestamp: '2026-11-05 11:30',
    userId: 'USR-003',
    userName: 'Алиев Улуғбек Нодирович',
    role: 'INSPECTOR',
    action: 'Камчилик аниқланмаган далолатнома якунланди',
    entityType: 'INSPECTION',
    entityId: 'FS-000123',
    details: 'ТЭЦ цехида кўрик натижасида камчиликлар аниқланмади',
  },
];

// Initial System Notifications
const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    recipientRole: 'RESPONSIBLE_EMPLOYEE',
    title: 'Янги камчилик бириктирилди',
    message: 'СПЦ цехи: 2-сонли прокат станида ёнғин гидранти йўлаги тўсиб қўйилган. Ижро муддати: 3 кун.',
    type: 'DEFECT_ASSIGNED',
    isRead: false,
    createdAt: '2026-11-01 10:20',
    defectId: 'FS-D-000001',
    inspectionId: 'FS-000125',
  },
  {
    id: 'notif-2',
    recipientRole: 'ALL',
    title: 'Муддати ўтган камчилик хабарномаси!',
    message: 'FS-D-000001 рақамли камчиликнинг бартараф этиш муддати тугади. Раҳбарият назоратига олинди.',
    type: 'OVERDUE',
    isRead: false,
    createdAt: '2026-11-04 18:00',
    defectId: 'FS-D-000001',
  },
];

// Normalized Initial Defects with all required ТЗ fields
const NORMALIZED_INITIAL_DEFECTS: DefectItem[] = INITIAL_DEFECTS.map((d, index) => {
  const codeNum = String(index + 1).padStart(6, '0');
  const dId = `FS-D-${codeNum}`;
  const inspId = index === 0 ? 'FS-000125' : index === 1 ? 'FS-000124' : 'FS-000125';
  const catItem = CATALOG_100_ITEMS[index] || CATALOG_100_ITEMS[0];

  return {
    ...d,
    id: dId,
    inspectionId: inspId,
    catalogItemId: catItem.id,
    catalogTitleSnapshot: d.title || catItem.title,
    catalogCategorySnapshot: d.category || catItem.category,
    categoryNameSnapshot: d.categoryName || catItem.categoryName,
    responsibleEmployeeId: 'USR-005',
    photoBefore: d.defectPhoto || d.photoBefore || '',
    photoAfter: d.resolutionPhoto || d.photoAfter,
    priority: d.severity || 'YUQORI',
    isOverdue: d.status === 'MUDDATI_OTGAN',
  };
});

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('DASHBOARD');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Modals & Panels State
  const [selectedDefect, setSelectedDefect] = useState<DefectItem | null>(null);
  const [isNewInspectionOpen, setIsNewInspectionOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // Language state (default UZ, stored in localStorage)
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
      if (savedLang === 'UZ' || savedLang === 'RU') return savedLang;
    } catch (e) {
      console.error('Failed to load language', e);
    }
    return 'UZ';
  });

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  const t = TRANSLATIONS[language];

  // Current User & Role Switcher State
  const [currentUser, setCurrentUser] = useState<EmployeeUser>(() => {
    try {
      const savedRole = localStorage.getItem(ROLE_STORAGE_KEY) as SystemRole;
      if (savedRole) {
        const found = INITIAL_SYSTEM_USERS.find((u) => u.role === savedRole);
        if (found) return found;
      }
    } catch (e) {
      console.error('Failed to load user role', e);
    }
    // Default to Inspector as requested in evaluation scenarios
    return INITIAL_SYSTEM_USERS[2]; // Inspector: Алиев Улуғбек Нодирович
  });

  const handleSwitchRole = (role: SystemRole) => {
    const userForRole = INITIAL_SYSTEM_USERS.find((u) => u.role === role) || INITIAL_SYSTEM_USERS[0];
    setCurrentUser(userForRole);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    } catch (e) {
      console.error('Failed to save user role', e);
    }

    // Role-tailored view routing for best UX
    if (role === 'RESPONSIBLE_EMPLOYEE') {
      setActiveTab('MY_TASKS');
    } else if (role === 'INSPECTOR') {
      setActiveTab('INSPECTIONS');
    } else if (role === 'EXECUTIVE') {
      setActiveTab('DASHBOARD');
    } else if (role === 'ADMIN') {
      setActiveTab('WORKSHOPS_EMPLOYEES');
    }
  };

  // State Collections
  const [defects, setDefects] = useState<DefectItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEFECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load defects', e);
    }
    return NORMALIZED_INITIAL_DEFECTS;
  });

  const [inspections, setInspections] = useState<InspectionSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INSPECTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load inspections', e);
    }
    return INITIAL_INSPECTIONS;
  });

  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKSHOPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load workshops', e);
    }
    return WORKSHOPS.map((w) => ({ ...w, isActive: true, managerName: w.manager || w.managerName || 'Масъул раҳбар' }));
  });

  const [employees, setEmployees] = useState<EmployeeUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load employees', e);
    }
    return INITIAL_SYSTEM_USERS;
  });

  const [catalog, setCatalog] = useState<DefectCatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATALOG);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load catalog', e);
    }
    return CATALOG_100_ITEMS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load logs', e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Fetch from SQLite Backend on Mount
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [resDefects, resInspections, resWorkshops, resEmployees, resCatalog, resLogs, resNotifs] = await Promise.all([
          fetch('/api/defects').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/inspections').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/workshops').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/employees').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/catalog').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/audit-logs').then((r) => (r.ok ? r.json() : null)),
          fetch('/api/notifications').then((r) => (r.ok ? r.json() : null)),
        ]);

        if (resDefects && resDefects.length > 0) setDefects(resDefects);
        if (resInspections && resInspections.length > 0) setInspections(resInspections);
        if (resWorkshops && resWorkshops.length > 0) setWorkshops(resWorkshops);
        if (resEmployees && resEmployees.length > 0) setEmployees(resEmployees);
        if (resCatalog && resCatalog.length > 0) setCatalog(resCatalog);
        if (resLogs && resLogs.length > 0) setAuditLogs(resLogs);
        if (resNotifs && resNotifs.length > 0) setNotifications(resNotifs);
      } catch (err) {
        console.warn('SQLite backend offline or initializing; using local state storage', err);
      }
    };

    fetchBackendData();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEFECTS, JSON.stringify(defects));
      localStorage.setItem(STORAGE_KEY_INSPECTIONS, JSON.stringify(inspections));
      localStorage.setItem(STORAGE_KEY_WORKSHOPS, JSON.stringify(workshops));
      localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
      localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(catalog));
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to sync to localStorage', e);
    }
  }, [defects, inspections, workshops, employees, catalog, auditLogs, notifications]);

  // Dark Mode Sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Record Audit Log helper
  const addAuditLog = useCallback(
    (action: string, entityType: AuditLogEntry['entityType'], entityId: string, details: string) => {
      const newLog: AuditLogEntry = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        userId: currentUser.id,
        userName: currentUser.fullName,
        role: currentUser.role,
        action,
        entityType,
        entityId,
        details,
      };

      setAuditLogs((prev) => [newLog, ...prev]);

      // Post to backend asynchronously
      fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      }).catch((e) => console.warn('Backend log sync error', e));
    },
    [currentUser]
  );

  // Submit Inspection with multiple defects or clean act
  const handleSubmitInspection = (
    inspection: InspectionSession,
    newDefectsData: Omit<DefectItem, 'id' | 'history'>[]
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Generate individual defect cards (FS-D-000001 format)
    const generatedDefects: DefectItem[] = newDefectsData.map((draft, idx) => {
      const nextNum = defects.length + idx + 1;
      const defectId = `FS-D-${String(nextNum).padStart(6, '0')}`;

      return {
        ...draft,
        id: defectId,
        history: [
          {
            id: `h-${Date.now()}-${idx}`,
            date: nowStr,
            author: currentUser.fullName,
            role: currentUser.role === 'ADMIN' ? 'Администратор' : 'Ёнғин назоратчиси',
            action: `Текширувда расмий қайд этилди (${inspection.id})`,
            comment: draft.description,
          },
        ],
      };
    });

    // Update local state
    setInspections((prev) => [inspection, ...prev]);
    if (generatedDefects.length > 0) {
      setDefects((prev) => [...generatedDefects, ...prev]);
    }

    // Backend sync
    fetch('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspection, defects: generatedDefects }),
    }).catch((e) => console.warn('Backend inspection submit error', e));

    // Audit Log
    addAuditLog(
      inspection.status === 'KAMCHILIK_ANIQLANMADI' ? 'Тоза далолатнома тузилди' : 'Янги текширув ва камчиликлар расмийлаштирилди',
      'INSPECTION',
      inspection.id,
      `${inspection.workshopCode}: ${inspection.location}. Аниқланган камчиликлар: ${generatedDefects.length} та`
    );

    // Notifications for responsible employees
    generatedDefects.forEach((d) => {
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}-${d.id}`,
        recipientId: d.responsibleEmployeeId,
        recipientRole: 'RESPONSIBLE_EMPLOYEE',
        title: 'Янги камчилик бириктирилди',
        message: `${d.workshopCode} — ${d.zone}: ${d.catalogTitleSnapshot}. Ижро муддати: ${d.deadline}`,
        type: 'DEFECT_ASSIGNED',
        isRead: false,
        createdAt: nowStr,
        defectId: d.id,
        inspectionId: inspection.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });
  };

  // Update Defect Status with ТЗ state transitions and role enforcement
  const handleUpdateStatus = (
    defectId: string,
    newStatus: DefectStatus,
    note?: string,
    photo?: string,
    videoUrl?: string,
    rejectionReason?: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const dateOnly = new Date().toISOString().split('T')[0];

    // Find defect
    const target = defects.find((d) => d.id === defectId);
    if (!target) return;

    // Strict ТЗ Rule: Responsible Employee CANNOT close defects!
    if (newStatus === 'YOPILGAN' && currentUser.role === 'RESPONSIBLE_EMPLOYEE') {
      alert(language === 'UZ' ? 'Хатолик: Масъул ходим камчиликни ёпиш ҳуқуқига эга эмас!' : 'Ошибка: Ответственный не имеет права закрывать замечание!');
      return;
    }

    let roleName = currentUser.role;
    let authorName = currentUser.fullName;
    let actionDesc = `Мақом "${newStatus}" ҳолатига ўзгартирилди`;

    if (newStatus === 'TEKSHIRUVGA_YUBORILGAN') {
      actionDesc = language === 'UZ' ? 'Камчилик бартараф этилиб, назоратчига текширувга топширилди' : 'Отчет об устранении передан на проверку';
    } else if (newStatus === 'QAYTA_ISHLASHGA_QAYTARILGAN') {
      actionDesc = language === 'UZ' ? `Қайта ишлашга қайтарилди: ${rejectionReason || note || ''}` : `Возвращено на доработку: ${rejectionReason || ''}`;
    } else if (newStatus === 'YOPILGAN') {
      actionDesc = language === 'UZ' ? 'Назоратчи жойида текшириб, камчиликни ёпди' : 'Инспектор подтвердил фактическое устранение и закрыл замечание';
    }

    const newHistoryEntry = {
      id: `h-${Date.now()}`,
      date: nowStr,
      author: authorName,
      role: roleName,
      action: actionDesc,
      comment: note || rejectionReason,
    };

    setDefects((prev) =>
      prev.map((d) => {
        if (d.id !== defectId) return d;
        return {
          ...d,
          status: newStatus,
          photoAfter: photo || d.photoAfter,
          resolutionPhoto: photo || d.resolutionPhoto,
          videoUrl: videoUrl || d.videoUrl,
          resolutionNotes: note || d.resolutionNotes,
          rejectionReason: rejectionReason || d.rejectionReason,
          resolvedDate: newStatus === 'TEKSHIRUVGA_YUBORILGAN' ? dateOnly : d.resolvedDate,
          verifiedDate: newStatus === 'YOPILGAN' ? dateOnly : d.verifiedDate,
          verifiedByInspectorName: newStatus === 'YOPILGAN' ? currentUser.fullName : d.verifiedByInspectorName,
          isOverdue: newStatus === 'MUDDATI_OTGAN' ? true : d.isOverdue,
          history: [...d.history, newHistoryEntry],
        };
      })
    );

    // Update modal if open
    if (selectedDefect && selectedDefect.id === defectId) {
      setSelectedDefect((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: newStatus,
          photoAfter: photo || prev.photoAfter,
          resolutionPhoto: photo || prev.resolutionPhoto,
          videoUrl: videoUrl || prev.videoUrl,
          resolutionNotes: note || prev.resolutionNotes,
          rejectionReason: rejectionReason || prev.rejectionReason,
          history: [...prev.history, newHistoryEntry],
        };
      });
    }

    // Backend sync
    fetch(`/api/defects/${defectId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        resolutionNotes: note,
        photoAfter: photo,
        videoUrl,
        rejectionReason,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
      }),
    }).catch((e) => console.warn('Backend status update error', e));

    // Audit Log
    addAuditLog(actionDesc, 'DEFECT', defectId, `Ҳолати: ${newStatus}. Ижрочи: ${authorName}`);

    // Notification on status changes
    const notifType =
      newStatus === 'TEKSHIRUVGA_YUBORILGAN'
        ? 'RESOLUTION_SUBMITTED'
        : newStatus === 'QAYTA_ISHLASHGA_QAYTARILGAN'
        ? 'RETURNED_FOR_REWORK'
        : newStatus === 'YOPILGAN'
        ? 'DEFECT_CLOSED'
        : 'INFO';

    const notifMessage =
      newStatus === 'TEKSHIRUVGA_YUBORILGAN'
        ? `${target.id} — ${target.catalogTitleSnapshot} бўйича ижро ҳисоботи топширилди`
        : newStatus === 'QAYTA_ISHLASHGA_QAYTARILGAN'
        ? `${target.id} қайта ишлашга қайтарилди: ${rejectionReason || note}`
        : `${target.id} камчилиги муваффақиятли ёпилди`;

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        recipientRole: newStatus === 'TEKSHIRUVGA_YUBORILGAN' ? 'INSPECTOR' : 'RESPONSIBLE_EMPLOYEE',
        title: `Камчилик мақоми янгиланди: ${newStatus}`,
        message: notifMessage,
        type: notifType,
        isRead: false,
        createdAt: nowStr,
        defectId,
      },
      ...prev,
    ]);
  };

  // Responsible Employee submitting resolution
  const handleSubmitResolution = (defectId: string, note: string, photo?: string, videoUrl?: string) => {
    handleUpdateStatus(defectId, 'TEKSHIRUVGA_YUBORILGAN', note, photo, videoUrl);
  };

  // Catalog item handlers (Admin)
  const handleAddCatalogItem = (itemData: Omit<DefectCatalogItem, 'id' | 'timesDetected'>) => {
    const newItem: DefectCatalogItem = {
      ...itemData,
      id: `CAT-${String(catalog.length + 1).padStart(3, '0')}`,
      timesDetected: 0,
    };
    setCatalog((prev) => [...prev, newItem]);
    addAuditLog('Каталогга янги камчилик тури қўшилди', 'CATALOG', newItem.id, newItem.title);
  };

  const handleUpdateCatalogItem = (id: string, updates: Partial<DefectCatalogItem>) => {
    setCatalog((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    addAuditLog('Каталог маълумоти янгиланди', 'CATALOG', id, JSON.stringify(updates));
  };

  // Workshop & Employee Management (Admin)
  const handleAddWorkshop = (ws: Workshop) => {
    setWorkshops((prev) => [...prev, ws]);
    addAuditLog('Янги цех тизимга қўшилди', 'WORKSHOP', ws.code, ws.name);
  };

  const handleUpdateWorkshop = (code: string, updates: Partial<Workshop>) => {
    setWorkshops((prev) => prev.map((w) => (w.code === code ? { ...w, ...updates } : w)));
    addAuditLog('Цех параметрлари ўзгартирилди', 'WORKSHOP', code, JSON.stringify(updates));
  };

  const handleAddEmployee = (emp: EmployeeUser) => {
    setEmployees((prev) => [...prev, emp]);
    addAuditLog('Янги ходим рўйхатдан ўтказилди', 'EMPLOYEE', emp.id, `${emp.fullName} (${emp.role})`);
  };

  const handleUpdateEmployee = (id: string, updates: Partial<EmployeeUser>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    addAuditLog('Ходим маълумоти янгиланди', 'EMPLOYEE', id, JSON.stringify(updates));
  };

  // Notification handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Reset to initial demo mock data
  const handleResetData = () => {
    if (window.confirm(t.confirmResetData)) {
      localStorage.removeItem(STORAGE_KEY_DEFECTS);
      localStorage.removeItem(STORAGE_KEY_INSPECTIONS);
      localStorage.removeItem(STORAGE_KEY_WORKSHOPS);
      localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
      localStorage.removeItem(STORAGE_KEY_CATALOG);
      localStorage.removeItem(STORAGE_KEY_LOGS);
      localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);

      setDefects(NORMALIZED_INITIAL_DEFECTS);
      setInspections(INITIAL_INSPECTIONS);
      setWorkshops(WORKSHOPS.map((w) => ({ ...w, isActive: true, managerName: w.manager || w.managerName || 'Масъул раҳбар' })));
      setEmployees(INITIAL_SYSTEM_USERS);
      setCatalog(CATALOG_100_ITEMS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setSelectedDefect(null);
    }
  };

  // Counters for badges
  const openIssuesCount = useMemo(() => {
    return defects.filter(
      (d) => d.status === 'YANGI' || d.status === 'BIRIKTIRILGAN' || d.status === 'BAJARILMOQDA' || d.status === 'QAYTA_ISHLASHGA_QAYTARILGAN' || d.status === 'MUDDATI_OTGAN'
    ).length;
  }, [defects]);

  const myAssignedCount = useMemo(() => {
    if (currentUser.role === 'RESPONSIBLE_EMPLOYEE') {
      return defects.filter(
        (d) => (d.responsibleEmployeeId === currentUser.id || d.responsiblePerson.includes(currentUser.fullName)) && d.status !== 'YOPILGAN'
      ).length;
    }
    if (currentUser.role === 'WORKSHOP_HEAD') {
      return defects.filter((d) => d.workshopCode === currentUser.workshopCode && d.status !== 'YOPILGAN').length;
    }
    return openIssuesCount;
  }, [defects, currentUser, openIssuesCount]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <div className="min-h-screen bg-[#d7d9e4] flex flex-col selection:bg-[#475569]/30 selection:text-white">
      {/* 1. Global Role Switcher Bar at Very Top */}
      <TopRoleSwitcher
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        language={language}
      />

      {/* 2. Main Layout Body (Sidebar + Content) */}
      <div className="flex-1 flex flex-row min-w-0">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenNewInspection={() => setIsNewInspectionOpen(true)}
          openIssuesCount={openIssuesCount}
          myAssignedCount={myAssignedCount}
          currentUser={currentUser}
          language={language}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TopBar with [ ЎЗБ | РУС ] on Top Right */}
          <TopBar
            activeTab={activeTab}
            language={language}
            onLanguageChange={handleLanguageChange}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
            onResetData={handleResetData}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            unreadNotificationsCount={unreadNotificationsCount}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />

          {/* Main Applet Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Metallurgical Complex Plant Header Banner */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5 p-5 rounded-2xl bg-[#0f3b42] border border-[#1b535c] shadow-industrial">
              <div className="flex flex-wrap items-center gap-5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-black tracking-wider text-white uppercase font-mono">
                      {t.companyName}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#0b2e34] text-[#E9EDF2]/80 border border-[#1b535c] font-mono">
                      {t.industrialComplex}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#E9EDF2]/75 font-medium mt-1">
                    {t.companySub}
                  </p>
                </div>

                <span className="text-[#1b535c] hidden lg:inline">|</span>

                <div className="flex items-center gap-2">
                  <span className="inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                  <span className="text-xs font-semibold text-[#E9EDF2]/75">
                    {t.systemActive}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleResetData}
                  className="text-xs sm:text-sm font-bold text-[#E9EDF2] hover:text-[#cbd5e1] transition-all flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b2e34] hover:bg-[#154c55] border border-[#1b535c] shadow-sm active:scale-95 cursor-pointer"
                  title={t.refreshData}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#94a3b8]" />
                  <span>{t.refreshData}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: EXECUTIVE DASHBOARD */}
            {activeTab === 'DASHBOARD' && (
              <ExecutiveDashboard
                defects={defects}
                onFilterByWorkshop={(_code) => setActiveTab('REGISTRY')}
              />
            )}

            {/* TAB 2: INSPECTIONS (INDEPENDENT CARDS & ACTS) */}
            {activeTab === 'INSPECTIONS' && (
              <InspectionsView
                inspections={inspections}
                defects={defects}
                workshops={workshops}
                currentUser={currentUser}
                onOpenNewInspection={() => setIsNewInspectionOpen(true)}
                onSelectInspection={(_insp) => {}}
                onPrintInspectionAct={(_insp) => setActiveTab('REPORTS')}
                language={language}
              />
            )}

            {/* TAB 3: DEFECTS REGISTRY */}
            {activeTab === 'REGISTRY' && (
              <DefectsRegistry
                defects={defects}
                workshops={workshops}
                currentUser={currentUser}
                onSelectDefect={(d) => setSelectedDefect(d)}
                onOpenNewInspection={() => setIsNewInspectionOpen(true)}
                language={language}
              />
            )}

            {/* TAB 4: MY TASKS (RESPONSIBLE EMPLOYEE & SHOP SUPERVISOR) */}
            {activeTab === 'MY_TASKS' && (
              <MyTasksView
                defects={defects}
                currentUser={currentUser}
                onSubmitResolution={handleSubmitResolution}
                onSelectDefect={(d) => setSelectedDefect(d)}
                language={language}
              />
            )}

            {/* TAB 5: 115+ DEFECTS CATALOG */}
            {activeTab === 'CATALOG' && (
              <DefectCatalogView
                catalog={catalog}
                currentUser={currentUser}
                onAddCatalogItem={handleAddCatalogItem}
                onUpdateCatalogItem={handleUpdateCatalogItem}
                language={language}
              />
            )}

            {/* TAB 6: WORKSHOPS & EMPLOYEES MANAGEMENT (ADMIN) */}
            {activeTab === 'WORKSHOPS_EMPLOYEES' && (
              <WorkshopsEmployeesView
                workshops={workshops}
                employees={employees}
                onAddWorkshop={handleAddWorkshop}
                onUpdateWorkshop={handleUpdateWorkshop}
                onAddEmployee={handleAddEmployee}
                onUpdateEmployee={handleUpdateEmployee}
                language={language}
              />
            )}

            {/* TAB 7: AUDIT LOGS */}
            {activeTab === 'AUDIT_LOGS' && (
              <AuditLogsView
                logs={auditLogs}
                language={language}
              />
            )}

            {/* TAB 8: REPORTS & EXCEL / PDF EXPORT */}
            {activeTab === 'REPORTS' && (
              <ReportsView
                inspections={inspections}
                defects={defects}
                workshops={workshops}
                employees={employees}
                language={language}
              />
            )}
          </main>

          {/* New Inspection Modal */}
          <NewInspectionModal
            isOpen={isNewInspectionOpen}
            onClose={() => setIsNewInspectionOpen(false)}
            workshops={workshops}
            employees={employees}
            catalog={catalog}
            currentUser={currentUser}
            nextInspectionId={`FS-${String(inspections.length + 125).padStart(6, '0')}`}
            nextDefectNumber={defects.length + 1}
            onSubmitInspection={handleSubmitInspection}
            language={language}
          />

          {/* Defect Modal (Detail, Rejection, Approval & Resolution) */}
          <DefectModal
            defect={selectedDefect}
            currentUser={currentUser}
            onClose={() => setSelectedDefect(null)}
            onUpdateStatus={handleUpdateStatus}
            language={language}
          />

          {/* Notification Center Slide-Out Drawer */}
          <NotificationsCenter
            notifications={notifications}
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onSelectDefect={(defectId) => {
              const item = defects.find((d) => d.id === defectId);
              if (item) setSelectedDefect(item);
            }}
            language={language}
          />

          {/* Industrial Footer */}
          <footer className="mt-auto border-t border-[#1b535c] bg-[#09262b]/95 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#E9EDF2]/60">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/Logo_UMK_5145ab7c.png"
                  alt="Ўзметкомбинат"
                  className="h-9 w-auto object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(255,121,0,0.35)]"
                />
                <div>
                  <div className="text-white font-extrabold text-sm">{t.companyName}</div>
                  <div className="text-[11px] text-[#E9EDF2]/70 font-medium">
                    {language === 'UZ' 
                      ? 'Ёнғин хавфсизлиги ва фавқулодда ҳолатларнинг олдини олиш рақамли тизими' 
                      : 'Цифровая система профилактики чрезвычайных ситуаций и пожарной безопасности'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-5 font-mono text-[11px] text-[#E9EDF2]/70 font-semibold">
                <span>ГОСТ 12.4.009-83</span>
                <span>·</span>
                <span>ШНК 2.01.02-04</span>
                <span>·</span>
                <span className="text-[#cbd5e1] font-black text-xs">2026</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
