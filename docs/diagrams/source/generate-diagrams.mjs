import { writeFileSync } from 'node:fs';

const out = new URL('../', import.meta.url);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const wrap = (s, n = 30) => {
  const words = s.split(' '); const rows = []; let row = '';
  for (const word of words) { if (`${row} ${word}`.trim().length > n && row) { rows.push(row); row = word; } else row = `${row} ${word}`.trim(); }
  return [...rows, row];
};
const dims = { terminal: [320, 54], process: [410, 68], input: [410, 64], decision: [300, 150], message: [400, 64] };
const n = (id, type, text, cx, y, extra = {}) => ({ id, type, text, cx, y, w: dims[type][0], h: dims[type][1], ...extra });
const E = (from, to, label = '', opts = {}) => ({ from, to, label, ...opts });

const diagrams = [
  {
    file: '1', title: 'D01. Импорт данных в базу данных', height: 1060,
    nodes: [
      n('start','terminal','Начало',700,70), n('files','input','Получить файлы с пометкой import',700,160), n('check','process','Проверить кодировку, обязательные поля и связи',700,270), n('valid','decision','Данные корректны?',700,385),
      n('dataErr','message','Показать и записать ошибки импорта',300,595), n('load','process','Загрузить подготовленные данные в БД',1050,595), n('importOk','decision','Импорт успешен?',1050,725), n('importErr','message','Записать ошибку импорта',650,900), n('end','terminal','Импорт завершён',1050,925)
    ],
    edges: [E('start','files'),E('files','check'),E('check','valid'),E('valid','dataErr','Нет'),E('valid','load','Да'),E('load','importOk'),E('importOk','importErr','Нет'),E('importOk','end','Да'),E('dataErr','check','Исправить файл',{routeX:80}),E('importErr','check','Повторить проверку',{routeX:140})]
  },
  {
    file: '2', title: 'D02. Запуск приложения и подключение к БД', height: 990,
    nodes: [
      n('start','terminal','Начало',700,70),n('settings','process','Загрузить настройки приложения',700,160),n('connect','process','Открыть подключение к БД',700,270),n('connected','decision','Подключение успешно?',700,385),
      n('error','message','Показать понятное сообщение о проблеме подключения',300,600),n('stop','terminal','Запуск остановлен',300,735),n('assets','process','Загрузить иконку, логотип и заглушку фото',1050,575),n('login','process','Открыть окно входа',1050,695),n('wait','terminal','Ожидание действий пользователя',1050,815)
    ],
    edges: [E('start','settings'),E('settings','connect'),E('connect','connected'),E('connected','error','Нет'),E('error','stop'),E('connected','assets','Да'),E('assets','login'),E('login','wait')]
  },
  {
    file: '3', title: 'D03. Авторизация и выход из учётной записи', height: 1260,
    nodes: [
      n('start','terminal','Окно входа',700,70),n('guest','decision','Выбран вход в роли гостя?',700,165),n('guestCat','process','Открыть каталог: только просмотр',300,385),n('guestEnd','terminal','Гостевой сеанс',300,510),
      n('credentials','input','Ввести логин и пароль',1050,385),n('verify','process','Проверить учётные данные в БД',1050,495),n('correct','decision','Данные верны?',1050,610),n('bad','message','Показать: неверный логин или пароль',610,830),n('role','process','Определить роль и показать ФИО пользователя',1050,830),n('open','process','Открыть доступный интерфейс роли',1050,955),n('session','terminal','Работа в учётной записи',1050,1070)
    ],
    edges: [E('start','guest'),E('guest','guestCat','Да'),E('guestCat','guestEnd'),E('guest','credentials','Нет'),E('credentials','verify'),E('verify','correct'),E('correct','bad','Нет'),E('bad','credentials','Повторить ввод',{routeX:470}),E('correct','role','Да'),E('role','open'),E('open','session'),E('session','start','Выйти',{routeX:1360})]
  },
  {
    file: '4', title: 'D04. Навигация между окнами', height: 1210,
    nodes: [
      n('start','terminal','Каталог открыт',700,70),n('select','input','Выбрать пункт меню или кнопку',700,165),n('access','process','Проверить право доступа',700,275),n('allowed','decision','Доступ разрешён?',700,390),
      n('denied','message','Показать сообщение о запрете действия',290,615),n('open','process','Открыть нужное окно с корректным заголовком',1050,600),n('back','decision','Нажата кнопка «Назад»?',1050,735),n('previous','process','Вернуться на предыдущее окно',670,950),n('exit','decision','Нажата команда «Выйти»?',1120,950),n('login','terminal','Окно входа',1120,1115)
    ],
    edges: [E('start','select'),E('select','access'),E('access','allowed'),E('allowed','denied','Нет'),E('denied','select','Продолжить',{routeX:90}),E('allowed','open','Да'),E('open','back'),E('back','previous','Да'),E('previous','select','Продолжить',{routeX:410}),E('back','exit','Нет'),E('exit','login','Да'),E('exit','select','Нет',{routeX:1370})]
  },
  {
    file: '5', title: 'D05. Вывод каталога товаров', height: 1510,
    nodes: [
      n('start','terminal','Начало: открыть каталог',700,60),n('get','process','Получить список товаров из БД',700,145),n('photo','decision','У товара есть фото?',700,250),n('placeholder','process','Показать заглушку picture.png',310,470),n('showPhoto','process','Показать фото товара',1090,470),n('fields','process','Вывести данные товара',700,600),n('discount','decision','Скидка больше 15%?',700,710),n('green','process','Применить зелёный фон строки #2E8B57',310,930),n('price','decision','Цена снижена?',700,1030),n('reduced','process','Показать старую цену красной и зачёркнутой; итоговую - чёрной',310,1250),n('zero','decision','Остаток равен нулю?',700,1350),n('blue','process','Применить голубой фон строки',310,1570),n('end','terminal','Показать готовый каталог',700,1690)
    ],
    edges: [E('start','get'),E('get','photo'),E('photo','placeholder','Нет'),E('photo','showPhoto','Да'),E('placeholder','fields'),E('showPhoto','fields'),E('fields','discount'),E('discount','green','Да'),E('discount','price','Нет'),E('green','price'),E('price','reduced','Да'),E('price','zero','Нет'),E('reduced','zero'),E('zero','blue','Да'),E('zero','end','Нет'),E('blue','end')],
    extraBottom: 300
  },
  {
    file: '6', title: 'D06. Поиск, фильтрация и сортировка товаров', height: 1400,
    nodes: [
      n('start','terminal','Каталог открыт',700,60),n('change','input','Изменить поиск, поставщика или сортировку',700,145),n('all','process','Получить полный список товаров',700,245),n('empty','decision','Строка поиска пуста?',700,355),n('keep','process','Оставить все товары',300,580),n('find','process','Найти совпадения по всем текстовым полям',1090,580),n('suppliers','decision','Выбран пункт «Все поставщики»?',700,710),n('noFilter','process','Не применять фильтр поставщика',300,930),n('filter','process','Отфильтровать по выбранному поставщику',1090,930),n('sort','process','Отсортировать по остатку: по возрастанию или убыванию',700,1060),n('update','process','Сразу обновить список',700,1170),n('wait','terminal','Ожидать изменения параметров',700,1285)
    ],
    edges: [E('start','change'),E('change','all'),E('all','empty'),E('empty','keep','Да'),E('empty','find','Нет'),E('keep','suppliers'),E('find','suppliers'),E('suppliers','noFilter','Да'),E('suppliers','filter','Нет'),E('noFilter','sort'),E('filter','sort'),E('sort','update'),E('update','wait'),E('wait','change','Изменить параметры',{routeX:1340})]
  },
  {
    file: '7', title: 'D07. Открытие формы добавления или редактирования товара', height: 1250,
    nodes: [
      n('start','terminal','Каталог администратора',700,60),n('add','decision','Нажата кнопка «Добавить товар»?',700,150),n('new','process','Создать форму: ID не показывать',300,380),n('select','input','Выбрать товар в списке',1090,380),n('formOpen','decision','Форма редактирования уже открыта?',1090,505),n('already','message','Показать: можно открыть только одну форму',680,735),n('load','process','Загрузить данные товара; ID доступен только для чтения',1090,735),n('open','process','Открыть форму с полями товара',700,920),n('next','terminal','Перейти к проверке и сохранению (D08)',700,1040)
    ],
    edges: [E('start','add'),E('add','new','Да'),E('add','select','Нет'),E('select','formOpen'),E('formOpen','already','Да'),E('already','start','Вернуться к каталогу',{routeX:1280}),E('formOpen','load','Нет'),E('new','open'),E('load','open'),E('open','next')]
  },
  {
    file: '8', title: 'D08. Проверка и сохранение товара', height: 1330,
    nodes: [
      n('start','terminal','Заполнена форма товара',700,60),n('validate','process','Проверить обязательные поля, цену и остаток',700,145),n('valid','decision','Значения корректны?',700,255),n('error','message','Подсветить поле и показать текст ошибки',300,490),n('new','decision','Это новый товар?',1050,490),n('update','process','Обновить существующую запись',650,720),n('insert','process','Вычислить следующий ID и добавить запись',1130,720),n('reload','process','Закрыть форму и обновить каталог',700,880),n('success','message','Показать сообщение об успешном сохранении',700,990),n('end','terminal','Конец',700,1100)
    ],
    edges: [E('start','validate'),E('validate','valid'),E('valid','error','Нет'),E('error','start','Исправить данные',{routeX:90}),E('valid','new','Да'),E('new','update','Нет'),E('new','insert','Да'),E('update','reload'),E('insert','reload'),E('reload','success'),E('success','end')]
  },
  {
    file: '9', title: 'D09. Добавление или замена изображения товара', height: 1180,
    nodes: [
      n('start','terminal','Форма товара',700,60),n('file','input','Выбрать файл изображения',700,145),n('size','decision','Размер изображения не больше 300×200 пикселей?',700,255),n('limit','message','Сообщить об ограничении размера',300,490),n('old','decision','У товара уже есть фото?',1050,490),n('delete','process','Удалить старый файл изображения',1050,715),n('copy','process','Сохранить новый файл в папку приложения',700,850),n('path','process','Сохранить путь к фото в БД',700,960),n('end','terminal','Показать новое изображение',700,1070)
    ],
    edges: [E('start','file'),E('file','size'),E('size','limit','Нет'),E('limit','file','Выбрать другое',{routeX:90}),E('size','old','Да'),E('old','delete','Да'),E('old','copy','Нет'),E('delete','copy'),E('copy','path'),E('path','end')]
  },
  {
    file: '10', title: 'D10. Удаление товара', height: 1230,
    nodes: [
      n('start','terminal','Выбран товар',700,60),n('press','input','Нажать «Удалить товар»',700,145),n('confirm','decision','Удаление подтверждено?',700,255),n('cancel','terminal','Отмена: каталог без изменений',300,490),n('check','process','Проверить: товар есть в позициях заказа?',1050,490),n('ordered','decision','Товар есть в заказе?',1050,610),n('prohibited','message','Показать: удаление товара запрещено',650,840),n('delete','process','Удалить товар и связанное фото',1130,840),n('update','process','Обновить каталог',1130,960),n('end','terminal','Конец',1130,1070)
    ],
    edges: [E('start','press'),E('press','confirm'),E('confirm','cancel','Нет'),E('confirm','check','Да'),E('check','ordered'),E('ordered','prohibited','Да'),E('prohibited','start','Вернуться к каталогу',{routeX:1320}),E('ordered','delete','Нет'),E('delete','update'),E('update','end')]
  },
  {
    file: '11', title: 'D11. Обработка сообщений и исключительных ситуаций', height: 1230,
    nodes: [
      n('start','terminal','Произошло событие',700,60),n('type','decision','Тип события?',700,150),n('info','message','Информация: показать результат успешной операции',260,400),n('error','message','Ошибка: показать причину и способ исправления',700,400),n('warning','message','Предупреждение: показать последствия действия',1140,400),n('confirm','decision','Нужно подтверждение?',1140,590),n('choose','input','Пользователь выбирает «Да» или «Нет»',1140,820),n('safe','process','Выполнить действие или безопасно отменить',1140,930),n('return','terminal','Вернуться к работе с формой или каталогом',700,1080)
    ],
    edges: [E('start','type'),E('type','info','Информация'),E('type','error','Ошибка'),E('type','warning','Предупреждение'),E('info','return'),E('error','return'),E('warning','confirm'),E('confirm','return','Нет'),E('confirm','choose','Да'),E('choose','safe'),E('safe','return')]
  },
  {
    file: 'вся-программа', title: 'Сводная блок-схема приложения', height: 1650,
    nodes: [
      n('start','terminal','Начало',700,50),n('boot','process','D02: запуск приложения и подключение к БД',700,135),n('connected','decision','Подключение доступно?',700,245),n('connectionErr','message','Показать ошибку подключения и инструкцию',280,470),n('connectionEnd','terminal','Конец',280,580),n('login','process','D03: открыть окно входа',1050,470),n('guest','decision','Вход в роли гостя?',1050,590),n('guestCat','process','D05: открыть каталог без поиска, фильтра и сортировки',670,820),n('guestEnd','terminal','Конец гостевого сеанса',670,930),n('credentials','input','Ввести логин и пароль',1250,820),n('verify','process','Проверить учётные данные',1250,930),n('correct','decision','Данные верны?',1250,1040),n('authErr','message','Показать ошибку и повторить ввод',850,1270),n('role','process','Определить роль и открыть интерфейс',1250,1270),n('work','process','D04-D11: навигация; каталог; поиск; управление товарами; сообщения',1250,1390),n('exit','terminal','Выход → окно входа',1250,1510)
    ],
    edges: [E('start','boot'),E('boot','connected'),E('connected','connectionErr','Нет'),E('connectionErr','connectionEnd'),E('connected','login','Да'),E('login','guest'),E('guest','guestCat','Да'),E('guestCat','guestEnd'),E('guest','credentials','Нет'),E('credentials','verify'),E('verify','correct'),E('correct','authErr','Нет'),E('authErr','credentials','Повторить ввод',{routeX:760}),E('correct','role','Да'),E('role','work'),E('work','exit'),E('exit','login','Выйти',{routeX:1390})]
  }
];

function render(diagram) {
  const byId = Object.fromEntries(diagram.nodes.map(x => [x.id, x]));
  const maxY = Math.max(...diagram.nodes.map(x => x.y + x.h), diagram.height - 40) + (diagram.extraBottom || 0);
  const W = Math.max(1400, Math.max(...diagram.nodes.map(x => x.cx + x.w / 2)) + 80), H = maxY + 60;
  const nodeSvg = (x) => {
    const left = x.cx - x.w / 2, top = x.y;
    let shape = '';
    if (x.type === 'terminal') shape = `<rect x="${left}" y="${top}" width="${x.w}" height="${x.h}" rx="27" fill="white" stroke="black" stroke-width="2"/>`;
    else if (x.type === 'decision') shape = `<path d="M ${x.cx} ${top} L ${left+x.w} ${top+x.h/2} L ${x.cx} ${top+x.h} L ${left} ${top+x.h/2} Z" fill="white" stroke="black" stroke-width="2"/>`;
    else if (x.type === 'input' || x.type === 'message') shape = `<path d="M ${left+24} ${top} L ${left+x.w} ${top} L ${left+x.w-24} ${top+x.h} L ${left} ${top+x.h} Z" fill="white" stroke="black" stroke-width="2"/>`;
    else shape = `<rect x="${left}" y="${top}" width="${x.w}" height="${x.h}" fill="white" stroke="black" stroke-width="2"/>`;
    const lines = wrap(x.text, x.type === 'decision' ? 25 : 36); const gap = 21; const sy = top + x.h/2 - (lines.length-1)*gap/2 + 7;
    return `<g>${shape}<text x="${x.cx}" y="${sy}" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="black">${lines.map((line,i)=>`<tspan x="${x.cx}" dy="${i ? gap : 0}">${esc(line)}</tspan>`).join('')}</text></g>`;
  };
  const edgeSvg = (e, i) => {
    const a = byId[e.from], b = byId[e.to]; const sx=a.cx, sy=a.y+a.h, tx=b.cx, ty=b.y;
    let d;
    if (e.routeX !== undefined) {
      const midY = sy + 34; const enterY = ty - 34;
      d = `M ${sx} ${sy} V ${midY} H ${e.routeX} V ${enterY} H ${tx} V ${ty}`;
    } else if (sx === tx) d = `M ${sx} ${sy} V ${ty}`;
    else { const mid = sy + Math.max(34, (ty-sy)*0.28); d = `M ${sx} ${sy} V ${mid} H ${tx} V ${ty}`; }
    let label = '';
    if (e.label) { const lx = e.labelX ?? ((sx+tx)/2); const ly = e.labelY ?? (sy + Math.max(28, (ty-sy)*0.22)); label = `<text x="${lx}" y="${ly-7}" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="black" style="paint-order:stroke;stroke:white;stroke-width:6">${esc(e.label)}</text>`; }
    return `<path d="${d}" fill="none" stroke="black" stroke-width="2" marker-end="url(#arrow)"/>${label}`;
  };
  const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M 0 0 L 9 4.5 L 0 9 z" fill="black"/></marker></defs><rect width="100%" height="100%" fill="white"/><text x="${W/2}" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="black">${esc(diagram.title)}</text>${diagram.edges.map(edgeSvg).join('')}${diagram.nodes.map(nodeSvg).join('')}</svg>`;
  const cells = diagram.nodes.map((x,i) => {
    const style = x.type === 'terminal' ? 'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;' : x.type === 'decision' ? 'rhombus;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;' : (x.type === 'input'||x.type==='message') ? 'shape=parallelogram;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;' : 'whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;';
    return `<mxCell id="${x.id}" value="${esc(x.text)}" style="${style}" vertex="1" parent="1"><mxGeometry x="${x.cx-x.w/2}" y="${x.y}" width="${x.w}" height="${x.h}" as="geometry"/></mxCell>`;
  }).join('');
  const edges = diagram.edges.map((e,i) => `<mxCell id="e${i}" value="${esc(e.label)}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;strokeColor=#000000;fontColor=#000000;exitX=0.5;exitY=1;exitPerimeter=0;entryX=0.5;entryY=0;entryPerimeter=0;" edge="1" parent="1" source="${e.from}" target="${e.to}"><mxGeometry relative="1" as="geometry"/></mxCell>`).join('');
  const drawio = `<mxfile host="app.diagrams.net" modified="2026-09-29T00:00:00.000Z" agent="Codex" version="26.0.14"><diagram name="${esc(diagram.title)}"><mxGraphModel dx="1400" dy="${H}" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${W}" pageHeight="${H}" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}${edges}</root></mxGraphModel></diagram></mxfile>`;
  writeFileSync(new URL(`../${diagram.file}.svg`, import.meta.url), svg);
  writeFileSync(new URL(`../${diagram.file}.drawio`, import.meta.url), drawio);
}

for (const diagram of diagrams) render(diagram);
