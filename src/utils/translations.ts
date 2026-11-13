import { Language } from '../types';

export const TRANSLATIONS = {
  UZ: {
    // Brand & App
    appName: 'FireSafety Control',
    appSubtitle: 'Ёнғин хавфсизлиги маркази',
    companyName: '«ЎЗМЕТКОМБИНАТ» АЖ',
    companySub: 'Фавқулодда вазиятлар ва саноат ёнғин хавфсизлигини бошқариш тизими',
    systemActive: 'Тизим фаол · 24/7 Тезкор мониторинг',
    industrialComplex: 'САНОАТ МАЖМУАСИ',
    dispatchBadge: 'DISPATCH 24/7',
    refreshData: 'Синов маълумотларини янгилаш',
    
    // Navigation
    navDashboard: 'Раҳбарият мониторинги',
    navDashboardShort: 'Dashboard',
    navInspector: 'Инспектор саҳифаси',
    navInspectorShort: 'Инспектор',
    navRegistry: 'Камчиликлар реестри',
    navRegistryShort: 'Реестр',
    navSupervisor: 'Цех масъули',
    navSupervisorShort: 'Цех масъули',
    navSettings: 'Созламалар ва Роллар',
    navSettingsShort: 'Созламалар',
    addNewDefect: 'Камчилик киритиш',

    // Language
    langUz: "O'zbekcha",
    langRu: 'Русский',
    switchLang: 'Тилни танлаш',

    // Statuses
    statusAll: 'Барчаси',
    statusYangi: 'Янги',
    statusIjroda: 'Ижрода',
    statusTekshiruvda: 'Текширувда',
    statusYopilgan: 'Ёпилган',
    statusMuddatiOtgan: 'Муддати ўтган',

    // Severity
    severityHigh: 'Юқори (Критик)',
    severityMedium: 'Ўртача',
    severityLow: 'Паст хавф',

    // Common
    workshop: 'Цех',
    allWorkshops: 'Барча цехлар',
    zone: 'Ҳудуд / Зона',
    deadline: 'Муддат',
    responsible: 'Масъул',
    actions: 'Ҳаракатлар',
    viewDetails: 'Кўриш',
    close: 'Ёпиш',
    cancel: 'Бекор қилиш',
    save: 'Сақлаш',
    delete: 'Ўчириш',
    edit: 'Таҳрирлаш',
    confirm: 'Тасдиқлаш',
    printReport: 'Ҳисоботни чоп этиш',
    exportCsv: 'CSV Экспорт',
    searchPlaceholder: 'Код, цех, ҳудуд бўйича қидириш...',
    clearFilters: 'Филтрларни тозалаш',

    // Settings & Roles
    settingsTitle: 'Цехлар кесимида ходимлар ва ролларни бошқариш',
    settingsSubtitle: 'Усталар (мастерлар), ижрочилар (чилангарлар), цех бошлиқлари ва ёнғин инспекторларининг ваколат ва ҳуқуқларини созлаш',
    addRoleBtn: '+ Янги ходимга рол бириктириш',
    roleFilter: 'Рол бўйича саралаш',
    roleSupervisors: 'Цех бошлиқлари',
    roleMasters: 'Катта усталар (Мастерлар)',
    roleExecutors: 'Ижрочилар (Чилангарлар)',
    roleInspectors: 'ЁХХ Инспекторлари',
    tableFullName: 'Исм-шариф',
    tableBadge: 'Табел №',
    tableWorkshop: 'Бириктирилган цех',
    tableRole: 'Тизимдаги роли',
    tableZone: 'Масъулият ҳудуди',
    tablePhone: 'Телефон',
    tablePermissions: 'Берилган ҳуқуқлар',
    tableStatus: 'Ҳолат',
    statusActive: 'Фаол',
    statusOnDuty: 'Сменада',
    statusVacation: 'Таътилда',

    // Role definitions
    roleSupervisorName: 'Цех бошлиғи',
    roleSupervisorDesc: 'Муддатларни назорат қилиш, далолатномаларга расмий жавоб бериш',
    roleMasterName: 'Катта уста (Мастер)',
    roleMasterDesc: 'Участкада кунлик кўрик ўтказиш, бригадага ижро топшириқларини тақсимлаш',
    roleExecutorName: 'Ижрочи (Чилангар/Электрик)',
    roleExecutorDesc: 'Камчиликни жойида бартараф этиш ва фото далил юклаш',
    roleInspectorName: 'ЁХХ Инспектори',
    roleInspectorDesc: 'Рақамли чек-лист аудити, жарима ва кўрсатма бериш, камчиликни ёпиш',

    // Permissions
    permReport: 'Камчилик киритиш',
    permUpload: 'Фото далил юклаш',
    permClose: 'Камчиликни ёпиш',
    permAudit: 'Чек-лист ўтказиш',

    // Modal
    modalAddRoleTitle: 'Ходимга рол ва масъулият бириктириш',
    fieldFullName: 'Ходим исми-шарифи: *',
    fieldBadge: 'Табел рақами: *',
    fieldWorkshop: 'Тегишли цех: *',
    fieldRole: 'Тизимдаги роли: *',
    fieldPhone: 'Алоқа телефони: *',
    fieldZone: 'Аниқ масъулият зонаси: *',
    fieldPermissions: 'Ажратилган ваколатлар (ҳуқуқлар):',
    confirmResetData: 'Барча маълумотларни металлургия синов ҳолатига қайта тиклашни хоҳлайсизми?',
  },

  RU: {
    // Brand & App
    appName: 'FireSafety Control',
    appSubtitle: 'Центр пожарной безопасности',
    companyName: 'АО «УЗМЕТКОМБИНАТ»',
    companySub: 'Система управления промышленной и пожарной безопасностью при ЧС',
    systemActive: 'Система активна · 24/7 Мониторинг',
    industrialComplex: 'ПРОМЫШЛЕННЫЙ КОМПЛЕКС',
    dispatchBadge: 'ДИСПЕТЧЕР 24/7',
    refreshData: 'Сбросить тестовые данные',
    
    // Navigation
    navDashboard: 'Панель руководства',
    navDashboardShort: 'Панель',
    navInspector: 'Страница инспектора',
    navInspectorShort: 'Инспектор',
    navRegistry: 'Реестр нарушений',
    navRegistryShort: 'Реестр',
    navSupervisor: 'Ответственный цеха',
    navSupervisorShort: 'Цех',
    navSettings: 'Настройки и Роли',
    navSettingsShort: 'Настройки',
    addNewDefect: 'Зафиксировать дефект',

    // Language
    langUz: "O'zbekcha",
    langRu: 'Русский',
    switchLang: 'Выбор языка',

    // Statuses
    statusAll: 'Все',
    statusYangi: 'Новый',
    statusIjroda: 'В работе',
    statusTekshiruvda: 'На проверке',
    statusYopilgan: 'Закрыт',
    statusMuddatiOtgan: 'Просрочен',

    // Severity
    severityHigh: 'Высокий (Критический)',
    severityMedium: 'Средний',
    severityLow: 'Низкий риск',

    // Common
    workshop: 'Цех',
    allWorkshops: 'Все цеха',
    zone: 'Зона / Участок',
    deadline: 'Срок',
    responsible: 'Ответственный',
    actions: 'Действия',
    viewDetails: 'Просмотр',
    close: 'Закрыть',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    confirm: 'Подтвердить',
    printReport: 'Печать отчета',
    exportCsv: 'Экспорт в CSV',
    searchPlaceholder: 'Поиск по коду, цеху, участку...',
    clearFilters: 'Сбросить фильтры',

    // Settings & Roles
    settingsTitle: 'Управление персоналом и ролями в разрезе цехов',
    settingsSubtitle: 'Назначение прав и обязанностей мастерам участков, исполнителям (слесарям), начальникам цехов и пожарным инспекторам',
    addRoleBtn: '+ Назначить роль сотруднику',
    roleFilter: 'Фильтр по ролям',
    roleSupervisors: 'Начальники цехов',
    roleMasters: 'Старшие мастера (Мастера)',
    roleExecutors: 'Исполнители (Слесари)',
    roleInspectors: 'Инспекторы ГПС',
    tableFullName: 'Ф.И.О. сотрудника',
    tableBadge: 'Табель №',
    tableWorkshop: 'Закрепленный цех',
    tableRole: 'Роль в системе',
    tableZone: 'Зона ответственности',
    tablePhone: 'Телефон',
    tablePermissions: 'Предоставленные права',
    tableStatus: 'Статус',
    statusActive: 'Активен',
    statusOnDuty: 'На смене',
    statusVacation: 'В отпуске',

    // Role definitions
    roleSupervisorName: 'Начальник цеха',
    roleSupervisorDesc: 'Контроль сроков, официальные ответы на предписания, координация',
    roleMasterName: 'Старший мастер',
    roleMasterDesc: 'Ежедневный осмотр участка, распределение нарядов бригаде',
    roleExecutorName: 'Исполнитель (Слесарь/Электрик)',
    roleExecutorDesc: 'Физическое устранение замечания и загрузка фотоотчета',
    roleInspectorName: 'Инспектор пожарной охраны',
    roleInspectorDesc: 'Цифровой чек-лист аудит, выдача предписаний, закрытие дефектов',

    // Permissions
    permReport: 'Фиксация дефектов',
    permUpload: 'Загрузка фотоотчета',
    permClose: 'Закрытие дефектов',
    permAudit: 'Проведение чек-листа',

    // Modal
    modalAddRoleTitle: 'Назначение роли и зоны ответственности',
    fieldFullName: 'Ф.И.О. сотрудника: *',
    fieldBadge: 'Табельный номер: *',
    fieldWorkshop: 'Цех: *',
    fieldRole: 'Роль в системе: *',
    fieldPhone: 'Контактный телефон: *',
    fieldZone: 'Точная зона ответственности: *',
    fieldPermissions: 'Разрешенные полномочия:',
    confirmResetData: 'Вы действительно хотите восстановить демонстрационные данные металлургического комбината?',
  },
};
