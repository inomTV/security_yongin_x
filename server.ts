import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'firesafety.db');
const db = new Database(DB_PATH);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS workshops (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    manager_id TEXT,
    manager_name TEXT NOT NULL,
    phone TEXT,
    danger_class TEXT DEFAULT 'B',
    danger_description TEXT,
    employee_count INTEGER DEFAULT 100,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL,
    badge_number TEXT NOT NULL,
    workshop_code TEXT NOT NULL,
    workshop_name TEXT,
    role TEXT NOT NULL,
    phone TEXT,
    assigned_zone TEXT,
    status TEXT DEFAULT 'ACTIVE',
    permissions_json TEXT,
    added_date TEXT
  );

  CREATE TABLE IF NOT EXISTS defect_catalog (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    category TEXT NOT NULL,
    category_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    default_severity TEXT DEFAULT 'YUQORI',
    standard_norm TEXT,
    deadline_days INTEGER DEFAULT 3,
    is_active INTEGER DEFAULT 1,
    times_detected INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    workshop_code TEXT NOT NULL,
    workshop_name TEXT NOT NULL,
    location TEXT NOT NULL,
    inspector_id TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'JARAYONDA',
    defects_count INTEGER DEFAULT 0,
    resolved_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS defects (
    id TEXT PRIMARY KEY,
    inspection_id TEXT NOT NULL,
    catalog_item_id TEXT NOT NULL,
    catalog_title_snapshot TEXT NOT NULL,
    catalog_category_snapshot TEXT NOT NULL,
    category_name_snapshot TEXT NOT NULL,
    workshop_code TEXT NOT NULL,
    workshop_name TEXT NOT NULL,
    zone TEXT NOT NULL,
    detected_date TEXT NOT NULL,
    deadline TEXT NOT NULL,
    is_overdue INTEGER DEFAULT 0,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    inspector_id TEXT,
    inspector_name TEXT NOT NULL,
    responsible_employee_id TEXT NOT NULL,
    responsible_person TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_before TEXT,
    photo_after TEXT,
    video_url TEXT,
    resolution_notes TEXT,
    resolved_date TEXT,
    verified_date TEXT,
    verified_by_inspector_name TEXT,
    rejection_reason TEXT,
    is_recurring INTEGER DEFAULT 0,
    recurring_count INTEGER DEFAULT 1,
    history_json TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    recipient_id TEXT,
    recipient_role TEXT DEFAULT 'ALL',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    defect_id TEXT,
    inspection_id TEXT
  );
`);

// Import initial data structures for seeding
import { WORKSHOPS } from './src/data/mockData';
import { INITIAL_SYSTEM_USERS } from './src/data/initialUsers';
import { INITIAL_DEFECT_CATALOG } from './src/data/catalog100';

function seedInitialData() {
  const workshopCount = db.prepare('SELECT count(*) as count FROM workshops').get() as { count: number };
  if (workshopCount.count === 0) {
    console.log('Seeding initial workshops...');
    const insertWorkshop = db.prepare(`
      INSERT INTO workshops (code, name, full_name, manager_id, manager_name, phone, danger_class, danger_description, employee_count, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    for (const w of WORKSHOPS) {
      insertWorkshop.run(w.code, w.name, w.fullName, 'T-001', w.manager, w.phone, w.dangerClass, w.dangerDescription, w.employeeCount);
    }
  }

  const employeeCount = db.prepare('SELECT count(*) as count FROM employees').get() as { count: number };
  if (employeeCount.count === 0) {
    console.log('Seeding initial system users & employees...');
    const insertEmployee = db.prepare(`
      INSERT INTO employees (id, username, full_name, badge_number, workshop_code, workshop_name, role, phone, assigned_zone, status, permissions_json, added_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of INITIAL_SYSTEM_USERS) {
      insertEmployee.run(u.id, u.username, u.fullName, u.badgeNumber, u.workshopCode, u.workshopName, u.role, u.phone, u.assignedZone, u.status, JSON.stringify(u.permissions), u.addedDate);
    }
  }

  const catalogCount = db.prepare('SELECT count(*) as count FROM defect_catalog').get() as { count: number };
  if (catalogCount.count === 0) {
    console.log(`Seeding 115 defect catalog items...`);
    const insertCatalog = db.prepare(`
      INSERT INTO defect_catalog (id, code, category, category_name, title, description, default_severity, standard_norm, deadline_days, is_active, times_detected)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    for (const item of INITIAL_DEFECT_CATALOG) {
      insertCatalog.run(item.id, item.code, item.category, item.categoryName, item.title, item.description, item.defaultSeverity, item.standardNorm, item.deadlineDays, item.timesDetected || 0);
    }
  }

  const inspectionCount = db.prepare('SELECT count(*) as count FROM inspections').get() as { count: number };
  if (inspectionCount.count === 0) {
    console.log('Seeding initial inspections and defects...');
    const insertInsp = db.prepare(`
      INSERT INTO inspections (id, date, workshop_code, workshop_name, location, inspector_id, inspector_name, notes, status, defects_count, resolved_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertInsp.run(
      'FS-000125',
      '2026-03-01',
      'СПЦ',
      'Сортопрокат цехи',
      '1-сонли Иситиш печи ва тегирмон линияси',
      'USR-003',
      'Алиев Улуғбек Нодирович',
      'Навли прокатлаш линиясида комплекс чораклик кўрик далолатномаси',
      'JARAYONDA',
      3,
      1,
      '2026-03-01 09:30'
    );
    insertInsp.run(
      'FS-000124',
      '2026-02-24',
      'ККЦ',
      'Кислород-конвертер цехи',
      'Гидравлик қайчи ва металл кесиш майдони',
      'USR-003',
      'Алиев Улуғбек Нодирович',
      'Оловли ишлар ва газ балонлари хавфсизлиги текшируви',
      'JARAYONDA',
      2,
      0,
      '2026-02-24 14:15'
    );
    insertInsp.run(
      'FS-000123',
      '2026-02-20',
      'ТЭЦ',
      'Иссиқлик электр маркази',
      'Буғ қозонхонаси ва 2-сонли турбина блоки',
      'USR-003',
      'Алиев Улуғбек Нодирович',
      'Режали профилактик ёнғин хавфсизлиги текшируви. Қоидабузарликлар аниқланмади.',
      'KAMCHILIK_ANIQLANMADI',
      0,
      0,
      '2026-02-20 11:00'
    );

    const insertDefect = db.prepare(`
      INSERT INTO defects (
        id, inspection_id, catalog_item_id, catalog_title_snapshot, catalog_category_snapshot,
        category_name_snapshot, workshop_code, workshop_name, zone, detected_date,
        deadline, is_overdue, status, priority, inspector_id, inspector_name,
        responsible_employee_id, responsible_person, description, photo_before,
        photo_after, video_url, resolution_notes, resolved_date, verified_date,
        verified_by_inspector_name, rejection_reason, is_recurring, recurring_count, history_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Sample defects with full fields
    insertDefect.run(
      'FS-D-000001',
      'FS-000125',
      'CAT-001',
      'Ўт ўчиргичнинг босим манометри кўрсаткичи қизил зонада (босим тушган)',
      'YONGIN_OCHIRISH',
      'Бирламчи ёнғин ўчириш воситалари',
      'СПЦ',
      'Сортопрокат цехи',
      '1-сонли печ операторлик хонаси олди',
      '2026-03-01',
      '2026-03-04',
      0,
      'BIRIKTIRILGAN',
      'YUQORI',
      'USR-003',
      'Алиев Улуғбек Нодирович',
      'USR-005',
      'Тўхтамишев Олим Саидович',
      'ОП-10 кукунли ўт ўчиргич манометри кўрсаткичи қизил секторга тушган. Қайта зарядлаш талаб этилади.',
      '/src/assets/images/defect_blocked_hydrant_1793944759545.jpg',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      1,
      JSON.stringify([
        { id: 'h-1', date: '2026-03-01 09:45', author: 'Алиев Улуғбек Нодирович', role: 'Ёнғин назоратчиси', action: 'Камчилик расмий қайд этилди ва далолатномага киритилди' },
        { id: 'h-2', date: '2026-03-01 10:00', author: 'Раҳимов Алишер Каримович', role: 'Цех бошлиғи', action: 'Ижрочи Тўхтамишев Олим Саидовичга бириктирилди' }
      ])
    );

    insertDefect.run(
      'FS-D-000002',
      'FS-000125',
      'CAT-061',
      'Ташқи ёнғин гидранти қопқоғи (люк) устига оғир бетон ёки металл буюмлар тахланган',
      'SUV_TARMOGI',
      'Ёнғин сув тармоғи, гидрантлар ва насослар',
      'СПЦ',
      'Сортопрокат цехи',
      'Тайёр маҳсулот омбори жанубий дарвозаси',
      '2026-03-01',
      '2026-03-02',
      0,
      'TEKSHIRUVGA_YUBORILGAN',
      'YUQORI',
      'USR-003',
      'Алиев Улуғбек Нодирович',
      'USR-005',
      'Тўхтамишев Олим Саидович',
      '№4-сонли ёнғин гидранти люки металл чиқиндилар ва профиллар билан тўсиб қўйилган. Ёнғин машинаси улана олмайди.',
      '/src/assets/images/defect_blocked_hydrant_1793944759545.jpg',
      '/src/assets/images/repaired_fire_station_1793944760239.jpg',
      null,
      'Металл профиллар кран ёрдамида омбор ичига олиб кирилди, гидрант атрофи 2 метр радиусда тозаланди ва қизил чизиқ билан белгиланди.',
      '2026-03-02',
      null,
      null,
      null,
      1,
      2,
      JSON.stringify([
        { id: 'h-3', date: '2026-03-01 10:15', author: 'Алиев Улуғбек Нодирович', role: 'Ёнғин назоратчиси', action: 'Камчилик расмий қайд этилди' },
        { id: 'h-4', date: '2026-03-02 11:30', author: 'Тўхтамишев Олим Саидович', role: 'Масъул ходим', action: 'Камчилик бартараф этилди ва натижа фотоси текширувга юборилди' }
      ])
    );

    insertDefect.run(
      'FS-D-000003',
      'FS-000125',
      'CAT-031',
      'Электр кабель галереясида кабеллар устида қалин кўмир ва металлургия чанги тўпланган',
      'ELEKTR_TIZIMI',
      'Электр хўжалиги ва кабель эстакадалари',
      'СПЦ',
      'Сортопрокат цехи',
      'Асосий кабель эстакадаси 14-устун',
      '2026-03-01',
      '2026-03-02',
      1,
      'MUDDATI_OTGAN',
      'YUQORI',
      'USR-003',
      'Алиев Улуғбек Нодирович',
      'USR-005',
      'Тўхтамишев Олим Саидович',
      'Кабель боғламлари устида 7-8 мм чанг қатлами тўпланган. Тезкор ҳаво компрессори ва саноат чангютгичи билан тозалаш лозим.',
      '/src/assets/images/defect_damaged_cables_1793944759246.jpg',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0,
      1,
      JSON.stringify([
        { id: 'h-5', date: '2026-03-01 11:00', author: 'Алиев Улуғбек Нодирович', role: 'Ёнғин назоратчиси', action: 'Камчилик қайд этилди. Муддат 24 соат белгиланди' }
      ])
    );

    insertDefect.run(
      'FS-D-000004',
      'FS-000124',
      'CAT-091',
      'Кислород ва пропан газ баллонлари бир жойда аралаш сақланмоқда',
      'YONUVCHI_MOYLAR',
      'Ёнувчи мойлаш тизимлари ва газ балонлари',
      'ККЦ',
      'Кислород-конвертер цехи',
      'Пайвандлаш ва газ кесиш пости №2',
      '2026-02-24',
      '2026-02-25',
      0,
      'YOPILGAN',
      'YUQORI',
      'USR-003',
      'Алиев Улуғбек Нодирович',
      'USR-005',
      'Тўхтамишев Олим Саидович',
      'Кислород ва пропан баллонлари бирга аралаш сақланмоқда. Алоҳида оралиқ масофа 5 метрдан кам.',
      '/src/assets/images/defect_blocked_hydrant_1793944759545.jpg',
      '/src/assets/images/repaired_fire_station_1793944760239.jpg',
      null,
      'Баллонлар махсус аравачаларга ажратилди ва занжир билан мустаҳкамланди.',
      '2026-02-25',
      '2026-02-25',
      'Алиев Улуғбек Нодирович',
      null,
      0,
      1,
      JSON.stringify([
        { id: 'h-6', date: '2026-02-24 14:30', author: 'Алиев Улуғбек Нодирович', role: 'Ёнғин назоратчиси', action: 'Камчилик қайд этилди' },
        { id: 'h-7', date: '2026-02-25 10:00', author: 'Тўхтамишев Олим Саидович', role: 'Масъул ходим', action: 'Бартараф этилди ва фото юборилди' },
        { id: 'h-8', date: '2026-02-25 12:00', author: 'Алиев Улуғбек Нодирович', role: 'Ёнғин назоратчиси', action: 'Назоратчи текшириб, камчиликни расман ёпди' }
      ])
    );
  }

  const logCount = db.prepare('SELECT count(*) as count FROM audit_logs').get() as { count: number };
  if (logCount.count === 0) {
    console.log('Seeding initial audit logs...');
    const insertLog = db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, role, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertLog.run('LOG-001', '2026-03-01 09:30:15', 'USR-003', 'Алиев Улуғбек Нодирович', 'INSPECTOR', 'Янги текширув яратилди', 'INSPECTION', 'FS-000125', 'СПЦ бўйича режали текширув далолатномаси очилди');
    insertLog.run('LOG-002', '2026-03-01 09:45:20', 'USR-003', 'Алиев Улуғбек Нодирович', 'INSPECTOR', 'Камчилик қайд этилди', 'DEFECT', 'FS-D-000001', 'Ўт ўчиргич босими тушганлиги аниқланди');
    insertLog.run('LOG-003', '2026-03-02 11:30:44', 'USR-005', 'Тўхтамишев Олим Саидович', 'RESPONSIBLE_EMPLOYEE', 'Натижа текширувга юборилди', 'DEFECT', 'FS-D-000002', 'Гидрант йўлаги очилди ва фото далил юкланди');
  }

  const notifCount = db.prepare('SELECT count(*) as count FROM notifications').get() as { count: number };
  if (notifCount.count === 0) {
    console.log('Seeding initial notifications...');
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, recipient_id, recipient_role, title, message, type, is_read, created_at, defect_id, inspection_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertNotif.run('NOTIF-1', 'USR-005', 'RESPONSIBLE_EMPLOYEE', 'Янги камчилик бириктирилди', 'СПЦ 1-сонли печ олдида ўт ўчиргич босими тушган. Муддат: 3 кун.', 'DEFECT_ASSIGNED', 0, '2026-03-01 10:05', 'FS-D-000001', 'FS-000125');
    insertNotif.run('NOTIF-2', 'USR-003', 'INSPECTOR', 'Текширувга янги ҳисобот юборилди', 'Тўхтамишев О. FS-D-000002 камчиликни бартараф этди ва фото ҳисобот юборди.', 'RESOLUTION_SUBMITTED', 0, '2026-03-02 11:31', 'FS-D-000002', 'FS-000125');
    insertNotif.run('NOTIF-3', 'ALL', 'ALL', 'Муддати ўтган камчилик!', 'СПЦ кабель эстакадасидаги FS-D-000003 камчилик муддати ўтди. Раҳбарият назоратида.', 'OVERDUE', 0, '2026-03-02 18:00', 'FS-D-000003', 'FS-000125');
  }
}

seedInitialData();

// ===================== REST API ROUTES =====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: 'SQLite (firesafety.db)', timestamp: new Date().toISOString() });
});

// Workshops
app.get('/api/workshops', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM workshops ORDER BY code ASC').all();
    const result = rows.map((r: any) => ({
      code: r.code,
      name: r.name,
      fullName: r.full_name,
      managerId: r.manager_id,
      manager: r.manager_name,
      managerName: r.manager_name,
      phone: r.phone,
      dangerClass: r.danger_class,
      dangerDescription: r.danger_description,
      employeeCount: r.employee_count,
      isActive: Boolean(r.is_active)
    }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/workshops', (req, res) => {
  try {
    const { code, name, fullName, managerName, phone, dangerClass, dangerDescription, employeeCount } = req.body;
    db.prepare(`
      INSERT INTO workshops (code, name, full_name, manager_id, manager_name, phone, danger_class, danger_description, employee_count, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(code, name, fullName || name, 'T-NEW', managerName || 'Белгиланмаган', phone || '', dangerClass || 'B', dangerDescription || '', employeeCount || 50);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, role, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`LOG-${Date.now()}`, new Date().toISOString().replace('T', ' ').slice(0, 19), req.body.userId || 'ADM-001', req.body.userName || 'Администратор', 'ADMIN', 'Янги цех қўшилди', 'WORKSHOP', code, `Цех: ${code} - ${name}`);

    res.json({ success: true, code });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/workshops/:code', (req, res) => {
  try {
    const { code } = req.params;
    const { name, fullName, managerName, phone, dangerClass, dangerDescription, employeeCount, isActive } = req.body;
    db.prepare(`
      UPDATE workshops SET 
        name = COALESCE(?, name),
        full_name = COALESCE(?, full_name),
        manager_name = COALESCE(?, manager_name),
        phone = COALESCE(?, phone),
        danger_class = COALESCE(?, danger_class),
        danger_description = COALESCE(?, danger_description),
        employee_count = COALESCE(?, employee_count),
        is_active = COALESCE(?, is_active)
      WHERE code = ?
    `).run(name, fullName, managerName, phone, dangerClass, dangerDescription, employeeCount, isActive !== undefined ? (isActive ? 1 : 0) : null, code);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Employees & Users
app.get('/api/employees', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM employees ORDER BY added_date DESC').all();
    const result = rows.map((r: any) => ({
      id: r.id,
      username: r.username,
      fullName: r.full_name,
      badgeNumber: r.badge_number,
      workshopCode: r.workshop_code,
      workshopName: r.workshop_name,
      role: r.role,
      phone: r.phone,
      assignedZone: r.assigned_zone,
      status: r.status,
      permissions: JSON.parse(r.permissions_json || '{}'),
      addedDate: r.added_date
    }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', (req, res) => {
  try {
    const emp = req.body;
    const id = emp.id || `USR-${Date.now().toString().slice(-4)}`;
    db.prepare(`
      INSERT INTO employees (id, username, full_name, badge_number, workshop_code, workshop_name, role, phone, assigned_zone, status, permissions_json, added_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      emp.username || `user_${Date.now().toString().slice(-4)}`,
      emp.fullName,
      emp.badgeNumber,
      emp.workshopCode,
      emp.workshopName || emp.workshopCode,
      emp.role,
      emp.phone,
      emp.assignedZone || '',
      emp.status || 'ACTIVE',
      JSON.stringify(emp.permissions || {}),
      new Date().toISOString().split('T')[0]
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, role, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`LOG-${Date.now()}`, new Date().toISOString().replace('T', ' ').slice(0, 19), req.body.adminId || 'ADM-001', req.body.adminName || 'Администратор', 'ADMIN', 'Янги ходим қўшилди / роль берилди', 'EMPLOYEE', id, `Ходим: ${emp.fullName}, Роль: ${emp.role}, Цех: ${emp.workshopCode}`);

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', (req, res) => {
  try {
    const { id } = req.params;
    const emp = req.body;
    db.prepare(`
      UPDATE employees SET
        full_name = COALESCE(?, full_name),
        badge_number = COALESCE(?, badge_number),
        workshop_code = COALESCE(?, workshop_code),
        workshop_name = COALESCE(?, workshop_name),
        role = COALESCE(?, role),
        phone = COALESCE(?, phone),
        assigned_zone = COALESCE(?, assigned_zone),
        status = COALESCE(?, status),
        permissions_json = COALESCE(?, permissions_json)
      WHERE id = ?
    `).run(
      emp.fullName,
      emp.badgeNumber,
      emp.workshopCode,
      emp.workshopName,
      emp.role,
      emp.phone,
      emp.assignedZone,
      emp.status,
      emp.permissions ? JSON.stringify(emp.permissions) : null,
      id
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Defect Catalog
app.get('/api/catalog', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM defect_catalog ORDER BY category ASC, code ASC').all();
    const result = rows.map((r: any) => ({
      id: r.id,
      code: r.code,
      category: r.category,
      categoryName: r.category_name,
      title: r.title,
      description: r.description,
      defaultSeverity: r.default_severity,
      standardNorm: r.standard_norm,
      deadlineDays: r.deadline_days,
      isActive: Boolean(r.is_active),
      timesDetected: r.times_detected
    }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/catalog', (req, res) => {
  try {
    const item = req.body;
    const count = (db.prepare('SELECT count(*) as count FROM defect_catalog').get() as any).count + 1;
    const id = item.id || `CAT-${String(count).padStart(3, '0')}`;
    db.prepare(`
      INSERT INTO defect_catalog (id, code, category, category_name, title, description, default_severity, standard_norm, deadline_days, is_active, times_detected)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `).run(id, item.code || `DEF-${count}`, item.category, item.categoryName, item.title, item.description || '', item.defaultSeverity || 'YUQORI', item.standardNorm || '', item.deadlineDays || 3);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, role, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`LOG-${Date.now()}`, new Date().toISOString().replace('T', ' ').slice(0, 19), item.adminId || 'ADM-001', item.adminName || 'Администратор', 'ADMIN', 'Каталогга янги камчилик тури қўшилди', 'CATALOG', id, `Номи: ${item.title}`);

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/catalog/:id', (req, res) => {
  try {
    const { id } = req.params;
    const item = req.body;
    db.prepare(`
      UPDATE defect_catalog SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        default_severity = COALESCE(?, default_severity),
        standard_norm = COALESCE(?, standard_norm),
        deadline_days = COALESCE(?, deadline_days),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(item.title, item.description, item.defaultSeverity, item.standardNorm, item.deadlineDays, item.isActive !== undefined ? (item.isActive ? 1 : 0) : null, id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Inspections
app.get('/api/inspections', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM inspections ORDER BY date DESC, created_at DESC').all();
    const result = rows.map((r: any) => ({
      id: r.id,
      date: r.date,
      workshopCode: r.workshop_code,
      workshopName: r.workshop_name,
      location: r.location,
      inspectorId: r.inspector_id,
      inspectorName: r.inspector_name,
      notes: r.notes,
      status: r.status,
      defectsCount: r.defects_count,
      resolvedCount: r.resolved_count,
      createdAt: r.created_at
    }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inspections', (req, res) => {
  try {
    const insp = req.body;
    const count = (db.prepare('SELECT count(*) as count FROM inspections').get() as any).count + 126;
    const id = insp.id || `FS-${String(count).padStart(6, '0')}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const dateOnly = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO inspections (id, date, workshop_code, workshop_name, location, inspector_id, inspector_name, notes, status, defects_count, resolved_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      insp.date || dateOnly,
      insp.workshopCode,
      insp.workshopName,
      insp.location,
      insp.inspectorId || 'USR-003',
      insp.inspectorName || 'Алиев Улуғбек Нодирович',
      insp.notes || '',
      insp.status || 'JARAYONDA',
      insp.defectsCount || 0,
      0,
      nowStr
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, role, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`LOG-${Date.now()}`, nowStr, insp.inspectorId || 'USR-003', insp.inspectorName || 'Алиев Улуғбек Нодирович', 'INSPECTOR', 'Янги текширув карточкаси яратилди', 'INSPECTION', id, `Цех: ${insp.workshopCode}, Жой: ${insp.location}`);

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Defects
app.get('/api/defects', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const rows = db.prepare('SELECT * FROM defects ORDER BY detected_date DESC, id DESC').all();
    const result = rows.map((r: any) => {
      const isOverdue = r.status !== 'YOPILGAN' && r.deadline < today;
      return {
        id: r.id,
        inspectionId: r.inspection_id,
        catalogItemId: r.catalog_item_id,
        catalogTitleSnapshot: r.catalog_title_snapshot,
        title: r.catalog_title_snapshot, // for backwards compat
        catalogCategorySnapshot: r.catalog_category_snapshot,
        category: r.catalog_category_snapshot, // for backwards compat
        categoryNameSnapshot: r.category_name_snapshot,
        categoryName: r.category_name_snapshot, // for backwards compat
        workshopCode: r.workshop_code,
        workshopName: r.workshop_name,
        zone: r.zone,
        detectedDate: r.detected_date,
        deadline: r.deadline,
        isOverdue: Boolean(isOverdue),
        status: isOverdue && r.status === 'BAJARILMOQDA' ? 'MUDDATI_OTGAN' : r.status,
        priority: r.priority,
        severity: r.priority, // for backwards compat
        inspectorId: r.inspector_id,
        inspectorName: r.inspector_name,
        responsibleEmployeeId: r.responsible_employee_id,
        responsiblePerson: r.responsible_person,
        description: r.description,
        photoBefore: r.photo_before,
        defectPhoto: r.photo_before, // for backwards compat
        photoAfter: r.photo_after,
        resolutionPhoto: r.photo_after, // for backwards compat
        videoUrl: r.video_url,
        resolutionNotes: r.resolution_notes,
        resolvedDate: r.resolved_date,
        verifiedDate: r.verified_date,
        verifiedByInspectorName: r.verified_by_inspector_name,
        rejectionReason: r.rejection_reason,
        isRecurring: Boolean(r.is_recurring),
        recurringCount: r.recurring_count,
        history: JSON.parse(r.history_json || '[]')
      };
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/defects', (req, res) => {
  try {
    const d = req.body;
    const totalDefects = (db.prepare('SELECT count(*) as count FROM defects').get() as any).count + 1;
    const id = d.id || `FS-D-${String(totalDefects).padStart(6, '0')}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const dateOnly = new Date().toISOString().split('T')[0];

    const initialHistory = [
      {
        id: `h-${Date.now()}`,
        date: nowStr,
        author: d.inspectorName || 'Алиев Улуғбек Нодирович',
        role: 'Ёнғин назоратчиси',
        action: 'Камчилик расмий қайд этилди ва далолатномага киритилди'
      }
    ];

    db.prepare(`
      INSERT INTO defects (
        id, inspection_id, catalog_item_id, catalog_title_snapshot, catalog_category_snapshot,
        category_name_snapshot, workshop_code, workshop_name, zone, detected_date,
        deadline, is_overdue, status, priority, inspector_id, inspector_name,
        responsible_employee_id, responsible_person, description, photo_before,
        photo_after, video_url, resolution_notes, resolved_date, verified_date,
        verified_by_inspector_name, rejection_reason, is_recurring, recurring_count, history_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      d.inspectionId || 'FS-000125',
      d.catalogItemId || 'CAT-001',
      d.catalogTitleSnapshot || d.title,
      d.catalogCategorySnapshot || d.category || 'YONGIN_OCHIRISH',
      d.categoryNameSnapshot || d.categoryName || 'Бирламчи ёнғин ўчириш воситалари',
      d.workshopCode,
      d.workshopName,
      d.zone,
      d.detectedDate || dateOnly,
      d.deadline,
      0,
      d.status || 'BIRIKTIRILGAN',
      d.priority || d.severity || 'YUQORI',
      d.inspectorId || 'USR-003',
      d.inspectorName || 'Алиев Улуғбек Нодирович',
      d.responsibleEmployeeId || 'USR-005',
      d.responsiblePerson,
      d.description,
      d.photoBefore || d.defectPhoto || '/src/assets/images/defect_blocked_hydrant_1793944759545.jpg',
      null,
      d.videoUrl || null,
      null,
      null,
      null,
      null,
      null,
      d.isRecurring ? 1 : 0,
      d.recurringCount || 1,
      JSON.stringify(initialHistory)
    );

    // Update inspection counter
    if (d.inspectionId) {
      db.prepare('UPDATE inspections SET defects_count = defects_count + 1 WHERE id = ?').run(d.inspectionId);
    }

    // Increment catalog times_detected
    if (d.catalogItemId) {
      db.prepare('UPDATE defect_catalog SET times_detected = times_detected + 1 WHERE id = ?').run(d.catalogItemId);
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, role, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`LOG-${Date.now()}`, nowStr, d.inspectorId || 'USR-003', d.inspectorName || 'Алиев Улуғбек Нодирович', 'INSPECTOR', 'Янги камчилик киритилди', 'DEFECT', id, `Текширув: ${d.inspectionId}, Камчилик: ${d.catalogTitleSnapshot || d.title}`);

    // Create notification for responsible employee
    db.prepare(`
      INSERT INTO notifications (id, recipient_id, recipient_role, title, message, type, is_read, created_at, defect_id, inspection_id)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(
      `NOTIF-${Date.now()}`,
      d.responsibleEmployeeId || 'USR-005',
      'RESPONSIBLE_EMPLOYEE',
      'Янги камчилик бириктирилди',
      `${d.workshopCode} бўйича «${d.catalogTitleSnapshot || d.title}» камчилиги сизга бириктирилди. Муддат: ${d.deadline}`,
      'DEFECT_ASSIGNED',
      nowStr,
      id,
      d.inspectionId
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update defect status (Remediate / Accept / Reject)
app.put('/api/defects/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, photo, videoUrl, authorId, authorName, authorRole, rejectionReason } = req.body;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const dateOnly = new Date().toISOString().split('T')[0];

    const currentDefect = db.prepare('SELECT * FROM defects WHERE id = ?').get(id) as any;
    if (!currentDefect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    let history = JSON.parse(currentDefect.history_json || '[]');

    let actionLabel = `Мақом «${status}» ҳолатига ўзгартирилди`;
    if (status === 'TEKSHIRUVGA_YUBORILGAN') {
      actionLabel = 'Камчилик бартараф этилганлиги ҳақида фото далил билан ҳисобот топширилди';
    } else if (status === 'YOPILGAN') {
      actionLabel = 'Назоратчи текшириб, камчиликни расман ёпди ва далолатномани тасдиқлади';
    } else if (status === 'QAYTA_ISHLASHGA_QAYTARILGAN') {
      actionLabel = `Камчилик сифатсиз бартараф этилган: қайта ишлашга қайтарилди. Сабаб: ${rejectionReason || note}`;
    }

    history.push({
      id: `h-${Date.now()}`,
      date: nowStr,
      authorId: authorId,
      author: authorName || 'Оператор',
      role: authorRole || 'Фойдаланувчи',
      action: actionLabel,
      comment: note || rejectionReason,
      photoUrl: photo
    });

    const isClosed = status === 'YOPILGAN';
    const isSubmitted = status === 'TEKSHIRUVGA_YUBORILGAN';

    db.prepare(`
      UPDATE defects SET
        status = ?,
        photo_after = COALESCE(?, photo_after),
        video_url = COALESCE(?, video_url),
        resolution_notes = COALESCE(?, resolution_notes),
        resolved_date = CASE WHEN ? = 1 THEN ? ELSE resolved_date END,
        verified_date = CASE WHEN ? = 1 THEN ? ELSE verified_date END,
        verified_by_inspector_name = CASE WHEN ? = 1 THEN ? ELSE verified_by_inspector_name END,
        rejection_reason = ?,
        history_json = ?
      WHERE id = ?
    `).run(
      status,
      photo || null,
      videoUrl || null,
      note || null,
      isSubmitted ? 1 : 0,
      dateOnly,
      isClosed ? 1 : 0,
      dateOnly,
      isClosed ? 1 : 0,
      authorName || 'Алиев Улуғбек Нодирович',
      rejectionReason || null,
      JSON.stringify(history),
      id
    );

    // If defect closed, update inspection resolved counter
    if (isClosed && currentDefect.inspection_id) {
      db.prepare('UPDATE inspections SET resolved_count = resolved_count + 1 WHERE id = ?').run(currentDefect.inspection_id);
    }

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, role, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(`LOG-${Date.now()}`, nowStr, authorId || 'USR-001', authorName || 'Оператор', authorRole || 'USER', actionLabel, 'DEFECT', id, `Камчилик: ${id}, Янги статус: ${status}`);

    // Create notification
    if (status === 'TEKSHIRUVGA_YUBORILGAN') {
      db.prepare(`
        INSERT INTO notifications (id, recipient_id, recipient_role, title, message, type, is_read, created_at, defect_id, inspection_id)
        VALUES (?, ?, 'INSPECTOR', 'Текширувга янги ҳисобот келиб тушди', ?, 'RESOLUTION_SUBMITTED', 0, ?, ?, ?)
      `).run(`NOTIF-${Date.now()}`, currentDefect.inspector_id, `${authorName} томонидан ${id} камчилик бартараф этилди ва текширувга топширилди.`, nowStr, id, currentDefect.inspection_id);
    } else if (status === 'QAYTA_ISHLASHGA_QAYTARILGAN') {
      db.prepare(`
        INSERT INTO notifications (id, recipient_id, recipient_role, title, message, type, is_read, created_at, defect_id, inspection_id)
        VALUES (?, ?, 'RESPONSIBLE_EMPLOYEE', 'Камчилик қайта ишлашга қайтарилди!', ?, 'RETURNED_FOR_REWORK', 0, ?, ?, ?)
      `).run(`NOTIF-${Date.now()}`, currentDefect.responsible_employee_id, `Назоратчи ${id} камчиликни қабул қилмади. Сабаб: ${rejectionReason || note}`, nowStr, id, currentDefect.inspection_id);
    } else if (status === 'YOPILGAN') {
      db.prepare(`
        INSERT INTO notifications (id, recipient_id, recipient_role, title, message, type, is_read, created_at, defect_id, inspection_id)
        VALUES (?, ?, 'RESPONSIBLE_EMPLOYEE', 'Камчилик муваффақиятли ёпилди', ?, 'DEFECT_CLOSED', 0, ?, ?, ?)
      `).run(`NOTIF-${Date.now()}`, currentDefect.responsible_employee_id, `Назоратчи ${authorName} томонидан ${id} камчилик ёпилганлиги тасдиқланди.`, nowStr, id, currentDefect.inspection_id);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Audit logs
app.get('/api/audit-logs', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 200').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Notifications
app.get('/api/notifications', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all();
    const result = rows.map((r: any) => ({
      id: r.id,
      recipientId: r.recipient_id,
      recipientRole: r.recipient_role,
      title: r.title,
      message: r.message,
      type: r.type,
      isRead: Boolean(r.is_read),
      createdAt: r.created_at,
      defectId: r.defect_id,
      inspectionId: r.inspection_id
    }));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/read-all', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1').run();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Media upload endpoint (supports base64 image or video data)
app.post('/api/upload', (req, res) => {
  try {
    const { data, filename, fileType } = req.body;
    // In our hermetic/browser environment, returning base64 or stored preview path is instant and 100% offline-ready
    res.json({
      success: true,
      url: data || '/src/assets/images/repaired_fire_station_1793944760239.jpg',
      filename: filename || 'uploaded_media',
      type: fileType || 'image/jpeg'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset database endpoint
app.post('/api/reset', (req, res) => {
  try {
    db.exec(`
      DELETE FROM defects;
      DELETE FROM inspections;
      DELETE FROM audit_logs;
      DELETE FROM notifications;
    `);
    seedInitialData();
    res.json({ success: true, message: 'Database reset to initial metallurgical demo state.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ===================== VITE MIDDLEWARE / STATIC FILES =====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ATD FireSafety Control running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
