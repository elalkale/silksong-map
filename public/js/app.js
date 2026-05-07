/* ── Silksong Interactive Map — app.js ── */

// ── Colores, labels e iconos por tipo ────────────────────────────────────────
const TYPE_COLORS = {
  bench:      '#F5C842',
  npc:        '#4EC994',
  boss:       '#E05252',
  collectible:'#C87BE8',
  skill:      '#5AB4F0',
  secret:     '#E8A84A',
  shop:       '#7EC8C8',
};
const TYPE_LABELS = {
  bench:'Banco', npc:'NPC', boss:'Jefe',
  collectible:'Coleccionable', skill:'Habilidad', secret:'Secreto', shop:'Tienda',
};
const TYPE_ICONS = {
  bench:       `<svg viewBox="0 0 10 10"><rect x="1" y="5" width="8" height="2" rx="0.5"/><rect x="2" y="3" width="6" height="1.5" rx="0.5"/><rect x="1.5" y="7" width="1" height="2" rx="0.3"/><rect x="7.5" y="7" width="1" height="2" rx="0.3"/></svg>`,
  npc:         `<svg viewBox="0 0 10 10"><circle cx="5" cy="3.5" r="2"/><path d="M1.5 9c0-1.93 1.57-3.5 3.5-3.5S8.5 7.07 8.5 9" fill="rgba(0,0,0,0.6)"/></svg>`,
  boss:        `<svg viewBox="0 0 10 10"><path d="M5 1L6.5 4H9L6.8 6L7.5 9L5 7.5L2.5 9L3.2 6L1 4H3.5Z"/></svg>`,
  collectible: `<svg viewBox="0 0 10 10"><path d="M5 1.5L6 4H8.5L6.5 5.8L7.2 8.5L5 7L2.8 8.5L3.5 5.8L1.5 4H4Z"/></svg>`,
  skill:       `<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="1.5"/><path d="M5 1v2M5 7v2M1 5h2M7 5h2M2.5 2.5l1.4 1.4M6.1 6.1l1.4 1.4M2.5 7.5l1.4-1.4M6.1 3.9l1.4-1.4" stroke="rgba(0,0,0,0.8)" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>`,
  secret:      `<svg viewBox="0 0 10 10"><path d="M5 1.5L6.8 4.5H8.5L7 6.5L7.8 9L5 7.5L2.2 9L3 6.5L1.5 4.5H3.2Z" opacity="0.9"/></svg>`,
  shop:        `<svg viewBox="0 0 10 10"><path d="M2 3.5h6L7.5 7.5h-5z"/><path d="M3.5 3.5V2.5a1.5 1.5 0 013 0v1" stroke="rgba(0,0,0,0.8)" stroke-width="1" fill="none"/></svg>`,
};

// ── Estado ────────────────────────────────────────────────────────────────────
const state = {
  scale: 1, offsetX: 0, offsetY: 0,
  minScale: 0.2, maxScale: 5,
  isDragging: false, dragStartX: 0, dragStartY: 0, dragOffX: 0, dragOffY: 0,
  filters: { bench:true, npc:true, boss:true, collectible:true, skill:true, secret:true, shop:true },
  showCompleted: true,
  selectedId: null,
  completed: {},
  searchQuery: '',
  mapW: 0, mapH: 0,
};

let MARKERS = [];

// ── DOM ───────────────────────────────────────────────────────────────────────
const viewport      = document.getElementById('map-viewport');
const world         = document.getElementById('map-world');
const mapImg        = document.getElementById('map-image');
const markersLayer  = document.getElementById('markers-layer');
const zoomLabel     = document.getElementById('zoom-label');
const progressBar   = document.getElementById('progress-bar');
const progressText  = document.getElementById('progress-text');
const detailPanel   = document.getElementById('detail-panel');
const searchInput   = document.getElementById('search-input');
const searchClear   = document.getElementById('search-clear');
const searchResults = document.getElementById('search-results');
const toast         = document.getElementById('toast');
const tooltip       = document.getElementById('map-tooltip');
const coordsDisplay = document.getElementById('coords-display');

// ── API ───────────────────────────────────────────────────────────────────────
async function fetchMarkers() {
  const r = await fetch('/api/markers');
  if (!r.ok) throw new Error('markers ' + r.status);
  return r.json();
}
async function fetchProgress() {
  try { const r = await fetch('/api/progress'); return r.ok ? r.json() : {}; }
  catch { return {}; }
}
async function postProgress(data) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {}
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Esperar que la imagen esté lista
  await new Promise(resolve => {
    if (mapImg.complete && mapImg.naturalWidth > 0) return resolve();
    mapImg.onload = resolve;
    mapImg.onerror = resolve; // continuar aunque falle
  });

  // Cargar datos
  try {
    [MARKERS, state.completed] = await Promise.all([fetchMarkers(), fetchProgress()]);
  } catch (e) {
    console.error('Error cargando datos:', e);
    MARKERS = [];
    state.completed = {};
  }

  // Dimensionar la capa de marcadores igual que la imagen
  state.mapW = mapImg.naturalWidth  || mapImg.offsetWidth;
  state.mapH = mapImg.naturalHeight || mapImg.offsetHeight;
  markersLayer.style.width  = state.mapW + 'px';
  markersLayer.style.height = state.mapH + 'px';

  renderMarkers();
  fitMap();
  updateUI();
  bindEvents();
}

// ── Render marcadores ─────────────────────────────────────────────────────────
function renderMarkers() {
  markersLayer.innerHTML = '';
  MARKERS.forEach((m, i) => {
    const el = document.createElement('div');
    el.className  = 'marker';
    el.dataset.id   = m.id;
    el.dataset.type = m.type;
    // Posición como % del tamaño del mapa
    el.style.left = m.x + '%';
    el.style.top  = m.y + '%';
    el.style.animationDelay = (i * 4) + 'ms';

    const inner = document.createElement('div');
    inner.className = 'marker-inner';
    inner.style.background = TYPE_COLORS[m.type] || '#aaa';
    inner.style.color      = TYPE_COLORS[m.type] || '#aaa';
    inner.innerHTML = TYPE_ICONS[m.type] || '';

    el.appendChild(inner);
    el.addEventListener('click',      e => { e.stopPropagation(); selectMarker(m.id); });
    el.addEventListener('mouseenter', e => showTooltip(e, m));
    el.addEventListener('mouseleave', hideTooltip);
    markersLayer.appendChild(el);
  });

  applyFilters();
}

function applyFilters() {
  markersLayer.querySelectorAll('.marker').forEach(el => {
    const type = el.dataset.type;
    const id   = el.dataset.id;
    const done = !!state.completed[id];
    const hiddenByFilter    = !state.filters[type];
    const hiddenByCompleted = !state.showCompleted && done;
    el.classList.toggle('hidden', hiddenByFilter || hiddenByCompleted);
    el.classList.toggle('done',   done);
  });
}

// ── Selección ─────────────────────────────────────────────────────────────────
function selectMarker(id) {
  // Deseleccionar anterior
  markersLayer.querySelectorAll('.marker.selected').forEach(el => el.classList.remove('selected'));

  if (state.selectedId === id) {
    state.selectedId = null;
    detailPanel.classList.add('hidden');
    if (state.searchQuery) { searchResults.classList.remove('hidden'); }
    return;
  }

  state.selectedId = id;
  const el = markersLayer.querySelector(`.marker[data-id="${id}"]`);
  if (el) el.classList.add('selected');

  const m = MARKERS.find(x => x.id === id);
  if (!m) return;

  searchResults.classList.add('hidden');
  detailPanel.classList.remove('hidden');

  document.getElementById('detail-type').textContent   = TYPE_LABELS[m.type];
  document.getElementById('detail-type').style.color        = TYPE_COLORS[m.type];
  document.getElementById('detail-type').style.borderColor  = TYPE_COLORS[m.type];
  document.getElementById('detail-name').textContent   = m.name;
  document.getElementById('detail-area').textContent   = '📍 ' + m.area;
  document.getElementById('detail-desc').textContent   = m.desc;

  const btn = document.getElementById('complete-btn');
  refreshCompleteBtn(btn, id);
  btn.onclick = () => toggleComplete(id);
}

function refreshCompleteBtn(btn, id) {
  const done = !!state.completed[id];
  btn.textContent = done ? '✓ Completado — Click para desmarcar' : 'Marcar como completado';
  btn.classList.toggle('done', done);
}

function toggleComplete(id) {
  if (state.completed[id]) delete state.completed[id];
  else state.completed[id] = true;
  postProgress(state.completed);
  applyFilters();
  updateUI();
  if (state.selectedId === id) refreshCompleteBtn(document.getElementById('complete-btn'), id);
  showToast(state.completed[id] ? '✓ Completado' : 'Desmarcado');
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
let tooltipTimer;
function showTooltip(e, m) {
  clearTimeout(tooltipTimer);
  tooltip.innerHTML = `<div class="tt-name">${m.name}</div><div class="tt-sub">${TYPE_LABELS[m.type]} · ${m.area}</div>`;
  tooltip.classList.add('visible');
  positionTooltip(e);
}
function hideTooltip() {
  tooltipTimer = setTimeout(() => tooltip.classList.remove('visible'), 80);
}
function positionTooltip(e) {
  const x = e.clientX + 14, y = e.clientY - 8;
  tooltip.style.left = Math.min(x, window.innerWidth  - tooltip.offsetWidth  - 10) + 'px';
  tooltip.style.top  = Math.max(y, 10) + 'px';
}

// ── Filtros ───────────────────────────────────────────────────────────────────
document.getElementById('filter-list').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  const type = btn.dataset.type;
  state.filters[type] = !state.filters[type];
  btn.classList.toggle('active', state.filters[type]);
  applyFilters();
  updateCounts();
});

document.getElementById('toggle-completed').addEventListener('change', e => {
  state.showCompleted = e.target.checked;
  applyFilters();
});

// ── UI ────────────────────────────────────────────────────────────────────────
function updateUI() { updateCounts(); updateProgress(); }

function updateCounts() {
  Object.keys(TYPE_LABELS).forEach(t => {
    const total = MARKERS.filter(m => m.type === t).length;
    const done  = MARKERS.filter(m => m.type === t && state.completed[m.id]).length;
    const el = document.getElementById('fc-' + t);
    if (el) el.textContent = done > 0 ? `${done}/${total}` : total;
  });
}

function updateProgress() {
  const total = MARKERS.length;
  const done  = MARKERS.filter(m => state.completed[m.id]).length;
  const pct   = total > 0 ? (done / total * 100).toFixed(1) : 0;
  progressBar.style.width = pct + '%';
  progressText.textContent = `${done} / ${total}`;
}

// ── Búsqueda ──────────────────────────────────────────────────────────────────
searchInput.addEventListener('input', e => {
  state.searchQuery = e.target.value.trim();
  searchClear.classList.toggle('visible', state.searchQuery.length > 0);
  if (!state.searchQuery) { searchResults.classList.add('hidden'); searchResults.innerHTML = ''; return; }
  state.selectedId = null;
  detailPanel.classList.add('hidden');
  renderSearch(state.searchQuery);
});

searchClear.addEventListener('click', () => {
  searchInput.value = ''; state.searchQuery = '';
  searchClear.classList.remove('visible');
  searchResults.classList.add('hidden'); searchResults.innerHTML = '';
});

function renderSearch(query) {
  const q = query.toLowerCase();
  const hits = MARKERS.filter(m =>
    m.name.toLowerCase().includes(q) || m.area.toLowerCase().includes(q) ||
    m.desc.toLowerCase().includes(q) || TYPE_LABELS[m.type].toLowerCase().includes(q)
  );
  searchResults.classList.remove('hidden');
  if (!hits.length) {
    searchResults.innerHTML = '<div class="no-results">Sin resultados</div>';
    return;
  }
  searchResults.innerHTML = hits.map(m => `
    <div class="search-item" data-id="${m.id}">
      <span class="search-dot" style="background:${TYPE_COLORS[m.type]}"></span>
      <span class="search-name">${m.name}</span>
      <span class="search-area">${m.area}</span>
    </div>
  `).join('');
  searchResults.querySelectorAll('.search-item').forEach(el => {
    el.addEventListener('click', () => {
      const m = MARKERS.find(x => x.id === el.dataset.id);
      if (!m) return;
      searchInput.value = ''; state.searchQuery = '';
      searchClear.classList.remove('visible');
      searchResults.classList.add('hidden');
      panTo(m);
      setTimeout(() => selectMarker(m.id), 320);
    });
  });
}

// ── Pan / Zoom ────────────────────────────────────────────────────────────────
function panTo(m) {
  const vpW = viewport.clientWidth, vpH = viewport.clientHeight;
  state.offsetX = vpW / 2 - (m.x / 100) * state.mapW * state.scale;
  state.offsetY = vpH / 2 - (m.y / 100) * state.mapH * state.scale;
  applyTransform(true);
}

function applyTransform(animate) {
  if (animate) {
    world.style.transition = 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
    setTimeout(() => { world.style.transition = ''; }, 400);
  }
  world.style.transform = `translate(${state.offsetX}px,${state.offsetY}px) scale(${state.scale})`;
  zoomLabel.textContent = Math.round(state.scale * 100) + '%';
}

function fitMap() {
  const vpW = viewport.clientWidth, vpH = viewport.clientHeight;
  const s = Math.min(vpW / state.mapW, vpH / state.mapH) * 0.95;
  state.scale   = s;
  state.offsetX = (vpW - state.mapW * s) / 2;
  state.offsetY = (vpH - state.mapH * s) / 2;
  applyTransform(false);
}

function zoom(factor, cx, cy) {
  const prev = state.scale;
  state.scale = Math.max(state.minScale, Math.min(state.maxScale, state.scale * factor));
  const r = state.scale / prev;
  if (cx !== undefined) { state.offsetX = cx - (cx - state.offsetX) * r; state.offsetY = cy - (cy - state.offsetY) * r; }
  applyTransform(false);
}

// ── Eventos ───────────────────────────────────────────────────────────────────
function bindEvents() {
  // Drag
  viewport.addEventListener('mousedown', e => {
    if (e.target.closest('.marker')) return;
    state.isDragging = true;
    state.dragStartX = e.clientX; state.dragStartY = e.clientY;
    state.dragOffX = state.offsetX; state.dragOffY = state.offsetY;
    viewport.classList.add('grabbing');
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!state.isDragging) return;
    state.offsetX = state.dragOffX + (e.clientX - state.dragStartX);
    state.offsetY = state.dragOffY + (e.clientY - state.dragStartY);
    applyTransform(false);
    // mover tooltip si está visible
    if (tooltip.classList.contains('visible')) positionTooltip(e);
  });
  window.addEventListener('mouseup', () => { state.isDragging = false; viewport.classList.remove('grabbing'); });

  // Scroll zoom
  viewport.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = viewport.getBoundingClientRect();
    zoom(e.deltaY < 0 ? 1.1 : 0.9, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });

  // Touch
  let lastDist = null;
  viewport.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    } else if (e.touches.length === 1 && !e.target.closest('.marker')) {
      state.isDragging = true;
      state.dragStartX = e.touches[0].clientX; state.dragStartY = e.touches[0].clientY;
      state.dragOffX = state.offsetX; state.dragOffY = state.offsetY;
    }
  });
  viewport.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (lastDist) {
        const rect = viewport.getBoundingClientRect();
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        zoom(d / lastDist, cx, cy);
      }
      lastDist = d;
    } else if (state.isDragging) {
      state.offsetX = state.dragOffX + (e.touches[0].clientX - state.dragStartX);
      state.offsetY = state.dragOffY + (e.touches[0].clientY - state.dragStartY);
      applyTransform(false);
    }
  }, { passive: false });
  viewport.addEventListener('touchend', () => { state.isDragging = false; lastDist = null; });

  // Botones zoom
  document.getElementById('zoom-in') .addEventListener('click', () => { const r = viewport.getBoundingClientRect(); zoom(1.25, r.width/2, r.height/2); });
  document.getElementById('zoom-out').addEventListener('click', () => { const r = viewport.getBoundingClientRect(); zoom(0.8,  r.width/2, r.height/2); });

  // Botones footer
  document.getElementById('btn-reset-view').addEventListener('click', () => fitMap());
  document.getElementById('btn-clear-progress').addEventListener('click', () => {
    if (!confirm('¿Resetear todo el progreso?')) return;
    state.completed = {};
    postProgress({});
    applyFilters(); updateUI();
    if (state.selectedId) refreshCompleteBtn(document.getElementById('complete-btn'), state.selectedId);
    showToast('Progreso reseteado');
  });

  // Cerrar detalle
  document.getElementById('detail-close').addEventListener('click', () => {
    markersLayer.querySelectorAll('.marker.selected').forEach(el => el.classList.remove('selected'));
    state.selectedId = null;
    detailPanel.classList.add('hidden');
  });

  // Click fondo → deseleccionar
  viewport.addEventListener('click', e => {
    if (e.target === viewport || e.target === world || e.target === mapImg) {
      markersLayer.querySelectorAll('.marker.selected').forEach(el => el.classList.remove('selected'));
      state.selectedId = null;
      detailPanel.classList.add('hidden');
    }
  });

  // Coordenadas debug
  viewport.addEventListener('mousemove', e => {
    const rect = viewport.getBoundingClientRect();
    const wx = (e.clientX - rect.left - state.offsetX) / state.scale;
    const wy = (e.clientY - rect.top  - state.offsetY) / state.scale;
    coordsDisplay.textContent = `x: ${(wx/state.mapW*100).toFixed(1)}%  y: ${(wy/state.mapH*100).toFixed(1)}%`;
  });

  // Teclado
  window.addEventListener('keydown', e => {
    if (e.target.matches('input')) return;
    if (e.key === 'Escape') {
      markersLayer.querySelectorAll('.marker.selected').forEach(el => el.classList.remove('selected'));
      state.selectedId = null; detailPanel.classList.add('hidden');
      searchInput.value = ''; state.searchQuery = '';
      searchClear.classList.remove('visible'); searchResults.classList.add('hidden');
    }
    if (e.key === '+' || e.key === '=') { const r = viewport.getBoundingClientRect(); zoom(1.2, r.width/2, r.height/2); }
    if (e.key === '-') { const r = viewport.getBoundingClientRect(); zoom(0.8, r.width/2, r.height/2); }
    if (e.key === '0') fitMap();
    if (e.key === 'f') searchInput.focus();
  });

  window.addEventListener('resize', fitMap);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ── Arranque ──────────────────────────────────────────────────────────────────
init();