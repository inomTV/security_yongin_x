export type SystemRole = 
  | 'ADMIN'                 // 1. Администратор
  | 'EXECUTIVE'             // 2. Корхона раҳбари
  | 'INSPECTOR'             // 3. Ёнғин хавфсизлиги назоратчиси
  | 'WORKSHOP_HEAD'         // 4. Цех бошлиғи
  | 'RESPONSIBLE_EMPLOYEE'  // 5. Масъул ходим
  | 'OBSERVER';             // 6. Кузатувчи

export type UserRole = SystemRole | 'SUPERVISOR' | 'MASTER' | 'EXECUTOR';

export type DefectStatus = 
  | 'YANGI'                       // 1. Янги
  | 'BIRIKTIRILGAN'               // 2. Масъулга бириктирилган
  | 'BAJARILMOQDA'                // 3. Бажарилмоқда
  | 'TEKSHIRUVGA_YUBORILGAN'      // 4. Текширувга юборилган
  | 'QAYTA_ISHLASHGA_QAYTARILGAN' // 5. Қайта ишлашга қайтарилган
  | 'YOPILGAN'                    // 6. Ёпилган
  | 'MUDDATI_OTGAN'               // 7. Муддати ўтган
  | 'IJRODA'                      // Backwards compatibility alias for BAJARILMOQDA
  | 'TEKSHIRUVDA';                // Backwards compatibility alias for TEKSHIRUVGA_YUBORILGAN

export type Severity = 'YUQORI' | 'ORTA' | 'PAST';

export type ChecklistCategory = 
  | 'YONGIN_OCHIRISH'      // Бирламчи ёнғин ўчириш воситалари
  | 'EVAKUATSIYA'          // Эвакуация йўллари ва чиқиш эшиклари
  | 'ELEKTR_TIZIMI'        // Электр хўжалиги ва кабель трассалари
  | 'AVTOMATIKA'           // Автоматик хабар бериш ва ўчириш тизими
  | 'SUV_TARMOGI'          // Ёнғин сув тармоғи, гидрантлар ва насослар
  | 'ISSIQLIK_GAZ'         // Иссиқлик агрегатлари, печлар ва газ ускуналари
  | 'YONUVCHI_MOYLAR'      // Ёнувчи ва мойлаш тизимлари, газ балонлари
  | 'XAVFSIZLIK_BELGILARI'; // Ёнғин хавфсизлиги белгилари ва йўриқномалар

export interface Workshop {
  id?: string;
  code: string;
  name: string;
  fullName: string;
  managerId?: string;
  managerName?: string;
  manager?: string;
  phone: string;
  dangerClass: 'A' | 'B' | 'V';
  dangerDescription: string;
  employeeCount: number;
  isActive?: boolean;
}

export interface EmployeeUser {
  id: string;
  username: string;
  fullName: string;
  badgeNumber: string;
  workshopCode: string;
  workshopName?: string;
  role: SystemRole;
  phone: string;
  assignedZone: string;
  status: 'ACTIVE' | 'ON_DUTY' | 'VACATION' | 'INACTIVE';
  permissions: {
    canManageWorkshops: boolean;
    canManageUsers: boolean;
    canManageCatalog: boolean;
    canCreateInspection: boolean;
    canAddDefect: boolean;
    canSubmitResolution: boolean;
    canCloseDefect: boolean;
    canReturnDefect: boolean;
    canViewAllWorkshops: boolean;
    canExportReports: boolean;
    canViewAuditLogs: boolean;
  };
  addedDate: string;
}

export interface DefectCatalogItem {
  id: string;
  code: string;
  category: ChecklistCategory;
  categoryName: string;
  title: string;
  description: string;
  defaultSeverity: Severity;
  standardNorm: string;
  deadlineDays: number;
  isActive: boolean;
  timesDetected?: number;
}

export interface DefectHistoryEntry {
  id: string;
  date: string;
  authorId?: string;
  author: string;
  role: string;
  action: string;
  comment?: string;
  photoUrl?: string;
}

export interface DefectItem {
  id: string;                        // FS-D-000001
  inspectionId?: string;             // FS-000125
  catalogItemId?: string;            // CAT-014
  catalogTitleSnapshot?: string;     // Historical snapshot of defect title
  catalogCategorySnapshot?: ChecklistCategory;
  categoryNameSnapshot?: string;
  title?: string;                    // Backwards compatibility
  category?: ChecklistCategory;      // Backwards compatibility
  categoryName?: string;             // Backwards compatibility
  workshopCode: string;
  workshopName: string;
  zone: string;
  detectedDate: string;
  deadline: string;
  isOverdue?: boolean;
  status: DefectStatus;
  priority?: Severity;
  severity?: Severity;
  inspectorId?: string;
  inspectorName: string;
  responsibleEmployeeId?: string;
  responsiblePerson: string;
  description: string;
  photoBefore?: string;
  defectPhoto?: string;              // Alias for backward compatibility
  photoAfter?: string;
  resolutionPhoto?: string;          // Alias for backward compatibility
  videoUrl?: string;
  resolutionNotes?: string;
  resolvedDate?: string;
  verifiedDate?: string;
  verifiedByInspectorName?: string;
  rejectionReason?: string;
  isRecurring: boolean;
  recurringCount?: number;
  history: DefectHistoryEntry[];
}

export interface InspectionSession {
  id: string;                        // FS-000125
  date: string;
  workshopCode: string;
  workshopName: string;
  location: string;
  inspectorId: string;
  inspectorName: string;
  notes?: string;
  status: 'TAMOMALANGAN' | 'KAMCHILIK_ANIQLANMADI' | 'JARAYONDA';
  defectsCount: number;
  resolvedCount: number;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: SystemRole;
  action: string;
  entityType: 'INSPECTION' | 'DEFECT' | 'WORKSHOP' | 'EMPLOYEE' | 'CATALOG' | 'USER_AUTH' | 'SYSTEM';
  entityId: string;
  details: string;
}

export interface SystemNotification {
  id: string;
  recipientId?: string;
  recipientRole?: SystemRole | 'ALL';
  title: string;
  message: string;
  type: 
    | 'DEFECT_ASSIGNED' 
    | 'DEADLINE_APPROACHING' 
    | 'OVERDUE' 
    | 'RESOLUTION_SUBMITTED' 
    | 'RETURNED_FOR_REWORK' 
    | 'DEFECT_CLOSED' 
    | 'INFO';
  isRead: boolean;
  createdAt: string;
  defectId?: string;
  inspectionId?: string;
}

export type ActiveTab = 
  | 'DASHBOARD'              // Раҳбарият Dashboard
  | 'INSPECTIONS'            // Текширувлар (Янги текширув яратиш)
  | 'REGISTRY'               // Камчиликлар реестри
  | 'MY_TASKS'               // Менинг вазифаларим (Масъул ходим учун)
  | 'CATALOG'                // Камчиликлар каталоги (100+)
  | 'WORKSHOPS_EMPLOYEES'    // Цехлар ва ходимлар бошқаруви (Админ)
  | 'AUDIT_LOGS'             // Аудит журнали
  | 'REPORTS'                // Ҳисоботлар ва экспорт
  | 'SUPERVISOR'             // Backwards compatibility
  | 'INSPECTOR'              // Backwards compatibility
  | 'SETTINGS';              // Backwards compatibility

export type Language = 'UZ' | 'RU';

// Checklist question type for compatibility
export interface ChecklistQuestion {
  id: string;
  category: ChecklistCategory;
  text: string;
  standardNorm: string;
  status?: 'PASS' | 'FAIL' | 'UNCHECKED';
  defectDetails?: {
    severity: Severity;
    description: string;
    zone: string;
    deadlineDays: number;
  };
}

export interface EmployeeRoleAssignment {
  id: string;
  fullName: string;
  badgeNumber: string;
  workshopCode: string;
  role: 'SUPERVISOR' | 'MASTER' | 'EXECUTOR' | 'INSPECTOR';
  phone: string;
  assignedZone: string;
  status: 'ACTIVE' | 'ON_DUTY' | 'VACATION';
  permissions: {
    canReportDefect: boolean;
    canUploadResolution: boolean;
    canCloseDefect: boolean;
    canAuditChecklist: boolean;
  };
  addedDate: string;
}
