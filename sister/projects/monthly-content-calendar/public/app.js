const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

const STATUS_LABELS = { draft: 'טיוטה', ready: 'מוכן', published: 'פורסם' };

const COLOR_PALETTE = [
  '#F0394C', '#F68B59', '#E0A526', '#3E9C6B',
  '#2E86AB', '#7B61FF', '#D6558C', '#4A4A9C'
];

const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  products: [],
  clients: [],
  ideas: [],
  holidays: [],
  filterClientId: '',
  removeImageFlag: false,
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function api(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `שגיאה בבקשה ל-${url}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const apiGet = (url) => api(url);
const apiPost = (url, data) => api(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
const apiPut = (url, data) => api(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
const apiDelete = (url) => api(url, { method: 'DELETE' });

async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  const res = await fetch('/api/upload', { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'שגיאה בהעלאת תמונה');
  }
  return res.json();
}

async function loadAll() {
  const [products, clients, ideas, holidays] = await Promise.all([
    apiGet('/api/products'),
    apiGet('/api/clients'),
    apiGet('/api/ideas'),
    apiGet('/api/holidays'),
  ]);
  state.products = products;
  state.clients = clients;
  state.ideas = ideas;
  state.holidays = holidays;
}

function productById(id) {
  return state.products.find((p) => p.id === id);
}

function holidayTypeSlug(type) {
  if (type === 'חג') return 'major';
  if (type === 'יום זיכרון') return 'memorial';
  if (type === 'יום לאומי') return 'national';
  return 'minor';
}

/* ---------- Rendering: toolbar ---------- */

function renderProductsBar() {
  const list = document.getElementById('productsList');
  list.innerHTML = '';
  state.products.forEach((p) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'product-chip';
    const dot = document.createElement('span');
    dot.className = 'product-chip__dot';
    dot.style.background = p.color || '#999';
    const label = document.createElement('span');
    label.textContent = p.name;
    chip.appendChild(dot);
    chip.appendChild(label);
    chip.addEventListener('click', () => openProductModal(p));
    list.appendChild(chip);
  });
}

function renderClientOptions() {
  const filterSelect = document.getElementById('clientFilter');
  const ideaSelect = document.getElementById('ideaClientInput');
  const currentFilter = state.filterClientId;

  filterSelect.innerHTML = '<option value="">כל הלקוחות</option>';
  ideaSelect.innerHTML = '<option value="">בלי לקוח</option>';

  state.clients.forEach((c) => {
    const opt1 = document.createElement('option');
    opt1.value = c.id;
    opt1.textContent = c.name;
    filterSelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = c.id;
    opt2.textContent = c.name;
    ideaSelect.appendChild(opt2);
  });

  filterSelect.value = currentFilter;
}

function renderProductSelectOptions() {
  const sel = document.getElementById('ideaProductInput');
  sel.innerHTML = '<option value="">בלי מוצר</option>';
  state.products.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
}

/* ---------- Rendering: calendar ---------- */

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) {
    const d = daysInPrevMonth - startWeekday + i + 1;
    cells.push({ year: month === 0 ? year - 1 : year, month: (month + 11) % 12, day: d, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ year, month, day: d, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const d = cells.length - (startWeekday + daysInMonth) + 1;
    cells.push({ year: month === 11 ? year + 1 : year, month: (month + 1) % 12, day: d, inMonth: false });
  }
  return cells;
}

function isoOf(cell) {
  return `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
}

function renderCalendar() {
  document.getElementById('monthLabel').textContent = `${HEBREW_MONTHS[state.month]} ${state.year}`;

  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';
  const cells = buildMonthGrid(state.year, state.month);
  const today = todayISO();

  const visibleIdeas = state.filterClientId
    ? state.ideas.filter((i) => i.clientId === state.filterClientId)
    : state.ideas;

  cells.forEach((cell) => {
    const iso = isoOf(cell);
    const weekday = new Date(cell.year, cell.month, cell.day).getDay();

    const el = document.createElement('div');
    el.className = 'day-cell';
    if (!cell.inMonth) el.classList.add('day-cell--muted');
    if (weekday === 5 || weekday === 6) el.classList.add('day-cell--weekend');
    if (iso === today) el.classList.add('day-cell--today');
    el.dataset.date = iso;

    const top = document.createElement('div');
    top.className = 'day-cell__top';

    const num = document.createElement('span');
    num.className = 'day-cell__num';
    if (iso === today) num.classList.add('day-cell__num--today');
    num.textContent = String(cell.day);

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'day-cell__add';
    addBtn.textContent = '+';
    addBtn.title = 'הוספת רעיון';
    addBtn.addEventListener('click', () => openIdeaModal(iso));

    top.appendChild(num);
    top.appendChild(addBtn);
    el.appendChild(top);

    const dayHolidays = state.holidays.filter((h) => h.date === iso);
    dayHolidays.forEach((h) => {
      const tag = document.createElement('div');
      tag.className = `holiday-tag holiday-tag--${holidayTypeSlug(h.type)}`;
      tag.textContent = h.title;
      tag.title = h.title;
      el.appendChild(tag);
    });

    const ideasWrap = document.createElement('div');
    ideasWrap.className = 'day-cell__ideas';
    visibleIdeas
      .filter((idea) => idea.date === iso)
      .forEach((idea) => {
        const product = productById(idea.productId);
        const card = document.createElement('div');
        card.className = 'idea-card';
        card.style.background = product ? product.color : '#B9AFAF';
        card.draggable = true;
        card.dataset.ideaId = idea.id;

        const statusDot = document.createElement('span');
        statusDot.className = `idea-card__status idea-card__status--${idea.status}`;
        statusDot.title = STATUS_LABELS[idea.status] || '';

        const title = document.createElement('span');
        title.className = 'idea-card__title';
        title.textContent = idea.title;

        card.appendChild(statusDot);
        card.appendChild(title);
        card.title = `${idea.title} — ${STATUS_LABELS[idea.status] || ''}`;

        card.addEventListener('click', () => openIdeaModal(idea.date, idea.id));
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', idea.id);
          e.dataTransfer.effectAllowed = 'move';
        });

        ideasWrap.appendChild(card);
      });
    el.appendChild(ideasWrap);

    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', async (e) => {
      e.preventDefault();
      el.classList.remove('drag-over');
      const ideaId = e.dataTransfer.getData('text/plain');
      if (!ideaId) return;
      const idea = state.ideas.find((i) => i.id === ideaId);
      if (!idea || idea.date === iso) return;
      const updated = await apiPut(`/api/ideas/${ideaId}`, { date: iso });
      const idx = state.ideas.findIndex((i) => i.id === ideaId);
      state.ideas[idx] = updated;
      renderCalendar();
    });

    grid.appendChild(el);
  });
}

/* ---------- Idea modal ---------- */

function setStatusPicker(status) {
  document.getElementById('ideaStatusInput').value = status;
  document.querySelectorAll('#ideaStatusPicker .status-option').forEach((btn) => {
    btn.dataset.active = String(btn.dataset.status === status);
  });
}

function openIdeaModal(dateIso, ideaId) {
  const form = document.getElementById('ideaForm');
  form.reset();
  state.removeImageFlag = false;
  document.getElementById('ideaImagePreview').hidden = true;

  document.getElementById('ideaId').value = ideaId || '';
  document.getElementById('ideaDate').value = dateIso;

  const deleteBtn = document.getElementById('ideaDeleteBtn');

  if (ideaId) {
    const idea = state.ideas.find((i) => i.id === ideaId);
    document.getElementById('ideaModalTitle').textContent = 'עריכת רעיון';
    document.getElementById('ideaTitleInput').value = idea.title || '';
    document.getElementById('ideaDescInput').value = idea.description || '';
    document.getElementById('ideaProductInput').value = idea.productId || '';
    document.getElementById('ideaClientInput').value = idea.clientId || '';
    setStatusPicker(idea.status || 'draft');
    if (idea.imagePath) {
      document.getElementById('ideaImagePreviewImg').src = idea.imagePath;
      document.getElementById('ideaImagePreview').hidden = false;
    }
    deleteBtn.hidden = false;
  } else {
    document.getElementById('ideaModalTitle').textContent = 'רעיון חדש';
    setStatusPicker('draft');
    deleteBtn.hidden = true;
  }

  document.getElementById('ideaModal').hidden = false;
}

function closeIdeaModal() {
  document.getElementById('ideaModal').hidden = true;
}

async function handleIdeaSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('ideaId').value;
  const fileInput = document.getElementById('ideaImageInput');

  let imagePath;
  if (fileInput.files[0]) {
    const uploaded = await uploadImage(fileInput.files[0]);
    imagePath = uploaded.path;
  } else if (state.removeImageFlag) {
    imagePath = null;
  }

  const payload = {
    date: document.getElementById('ideaDate').value,
    title: document.getElementById('ideaTitleInput').value.trim(),
    description: document.getElementById('ideaDescInput').value.trim(),
    productId: document.getElementById('ideaProductInput').value || null,
    clientId: document.getElementById('ideaClientInput').value || null,
    status: document.getElementById('ideaStatusInput').value,
  };
  if (imagePath !== undefined) payload.imagePath = imagePath;

  if (id) {
    const updated = await apiPut(`/api/ideas/${id}`, payload);
    const idx = state.ideas.findIndex((i) => i.id === id);
    state.ideas[idx] = updated;
  } else {
    const created = await apiPost('/api/ideas', payload);
    state.ideas.push(created);
  }

  closeIdeaModal();
  renderCalendar();
}

async function handleIdeaDelete() {
  const id = document.getElementById('ideaId').value;
  if (!id) return;
  if (!confirm('למחוק את הרעיון הזה?')) return;
  await apiDelete(`/api/ideas/${id}`);
  state.ideas = state.ideas.filter((i) => i.id !== id);
  closeIdeaModal();
  renderCalendar();
}

/* ---------- Product modal ---------- */

function renderColorPicker(selectedColor) {
  const wrap = document.getElementById('productColorPicker');
  wrap.innerHTML = '';
  COLOR_PALETTE.forEach((color) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch';
    swatch.style.background = color;
    swatch.dataset.active = String(color === selectedColor);
    swatch.addEventListener('click', () => {
      document.getElementById('productColorInput').value = color;
      wrap.querySelectorAll('.color-swatch').forEach((s) => (s.dataset.active = 'false'));
      swatch.dataset.active = 'true';
    });
    wrap.appendChild(swatch);
  });
}

function openProductModal(product) {
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('productId').value = product ? product.id : '';
  document.getElementById('productNameInput').value = product ? product.name : '';
  const color = product ? product.color : COLOR_PALETTE[state.products.length % COLOR_PALETTE.length];
  document.getElementById('productColorInput').value = color;
  renderColorPicker(color);
  document.getElementById('productModalTitle').textContent = product ? 'עריכת מוצר' : 'מוצר חדש';
  document.getElementById('productDeleteBtn').hidden = !product;
  document.getElementById('productModal').hidden = false;
}

function closeProductModal() {
  document.getElementById('productModal').hidden = true;
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const payload = {
    name: document.getElementById('productNameInput').value.trim(),
    color: document.getElementById('productColorInput').value,
  };
  if (id) {
    const updated = await apiPut(`/api/products/${id}`, payload);
    const idx = state.products.findIndex((p) => p.id === id);
    state.products[idx] = updated;
  } else {
    const created = await apiPost('/api/products', payload);
    state.products.push(created);
  }
  closeProductModal();
  renderProductsBar();
  renderProductSelectOptions();
  renderCalendar();
}

async function handleProductDelete() {
  const id = document.getElementById('productId').value;
  if (!id) return;
  if (!confirm('למחוק את המוצר? רעיונות משויכים יישארו בלי מוצר.')) return;
  await apiDelete(`/api/products/${id}`);
  state.products = state.products.filter((p) => p.id !== id);
  closeProductModal();
  renderProductsBar();
  renderProductSelectOptions();
  renderCalendar();
}

/* ---------- Wiring ---------- */

function wireEvents() {
  document.getElementById('prevMonthBtn').addEventListener('click', () => {
    state.month -= 1;
    if (state.month < 0) { state.month = 11; state.year -= 1; }
    renderCalendar();
  });
  document.getElementById('nextMonthBtn').addEventListener('click', () => {
    state.month += 1;
    if (state.month > 11) { state.month = 0; state.year += 1; }
    renderCalendar();
  });
  document.getElementById('todayBtn').addEventListener('click', () => {
    const d = new Date();
    state.year = d.getFullYear();
    state.month = d.getMonth();
    renderCalendar();
  });

  document.getElementById('clientFilter').addEventListener('change', (e) => {
    state.filterClientId = e.target.value;
    renderCalendar();
  });

  document.getElementById('addProductBtn').addEventListener('click', () => openProductModal(null));
  document.getElementById('productModalClose').addEventListener('click', closeProductModal);
  document.getElementById('productCancelBtn').addEventListener('click', closeProductModal);
  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
  document.getElementById('productDeleteBtn').addEventListener('click', handleProductDelete);
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.id === 'productModal') closeProductModal();
  });

  document.getElementById('ideaModalClose').addEventListener('click', closeIdeaModal);
  document.getElementById('ideaCancelBtn').addEventListener('click', closeIdeaModal);
  document.getElementById('ideaForm').addEventListener('submit', handleIdeaSubmit);
  document.getElementById('ideaDeleteBtn').addEventListener('click', handleIdeaDelete);
  document.getElementById('ideaModal').addEventListener('click', (e) => {
    if (e.target.id === 'ideaModal') closeIdeaModal();
  });

  document.querySelectorAll('#ideaStatusPicker .status-option').forEach((btn) => {
    btn.addEventListener('click', () => setStatusPicker(btn.dataset.status));
  });

  document.getElementById('ideaImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    state.removeImageFlag = false;
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById('ideaImagePreviewImg').src = reader.result;
      document.getElementById('ideaImagePreview').hidden = false;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('ideaImageRemoveBtn').addEventListener('click', () => {
    document.getElementById('ideaImageInput').value = '';
    document.getElementById('ideaImagePreview').hidden = true;
    state.removeImageFlag = true;
  });
}

async function init() {
  await loadAll();
  renderProductsBar();
  renderClientOptions();
  renderProductSelectOptions();
  renderCalendar();
  wireEvents();
}

init().catch((err) => {
  console.error(err);
  alert('שגיאה בטעינת הלוח: ' + err.message);
});
