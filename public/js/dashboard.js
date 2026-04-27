/**
 * Dashboard controller — loads resources, filters, handles CRUD and ML prediction.
 */

// ── Auth guard ────────────────────────────────────────────────────────────
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/';
  throw new Error('Not authenticated');
}

const currentUser = getUser();  // from api.js

// ── State ─────────────────────────────────────────────────────────────────
let allResources = [];
let filteredResources = [];

// ── DOM refs ──────────────────────────────────────────────────────────────
const navAvatar = document.getElementById('nav-avatar');
const navName = document.getElementById('nav-name');
const navRole = document.getElementById('nav-role');
const logoutBtn = document.getElementById('logout-btn');

const statTotal = document.getElementById('stat-total');
const statAvailable = document.getElementById('stat-available');
const statInuse = document.getElementById('stat-inuse');
const statDepleted = document.getElementById('stat-depleted');

const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const addResourceBtn = document.getElementById('add-resource-btn');
const refreshBtn = document.getElementById('refresh-btn');
const resourceCount = document.getElementById('resource-count');
const tbody = document.getElementById('resource-tbody');

const modalBackdrop = document.getElementById('modal-backdrop');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const resourceForm = document.getElementById('resource-form');
const modalSubmit = document.getElementById('modal-submit');

const predictPanel = document.getElementById('predict-panel');
const panelClose = document.getElementById('panel-close');
const panelBody = document.getElementById('panel-body');
const panelResourceName = document.getElementById('panel-resource-name');
const dashMain = document.getElementById('dash-main');

const toastContainer = document.getElementById('toast-container');

// ── Init ──────────────────────────────────────────────────────────────────
(function init() {
  // Populate navbar
  if (currentUser) {
    navAvatar.textContent = (currentUser.name || 'U')[0].toUpperCase();
    navName.textContent = currentUser.name || currentUser.email;
    navRole.textContent = currentUser.role === 'admin' ? 'Admin' : 'Viewer';
  }

  // Show admin-only elements
  if (currentUser?.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
  }

  loadResources();
})();

// ── Load resources ─────────────────────────────────────────────────────────
async function loadResources() {
  showSkeletonRows(5);
  try {
    allResources = await api.resources.getAll();
    applyFilters();
  } catch (err) {
    toast(err.message, 'error');
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon"></div><p>${err.message}</p></div></td></tr>`;
  }
}

// ── Filter & render ────────────────────────────────────────────────────────
function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const st = filterStatus.value;
  const pri = filterPriority.value;

  filteredResources = allResources.filter(r => {
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
    const matchSt = !st || r.status === st;
    const matchPri = !pri || r.priorityLevel === pri;
    return matchQ && matchSt && matchPri;
  });

  renderStats();
  renderTable();
}

function renderStats() {
  statTotal.textContent = allResources.length;
  statAvailable.textContent = allResources.filter(r => r.status === 'available').length;
  statInuse.textContent = allResources.filter(r => r.status === 'in-use').length;
  statDepleted.textContent = allResources.filter(r => r.status === 'depleted').length;
}

function renderTable() {
  resourceCount.textContent = `${filteredResources.length} resource${filteredResources.length !== 1 ? 's' : ''}`;

  if (filteredResources.length === 0) {
    tbody.innerHTML = `
          <tr><td colspan="7">
            <div class="empty-state">
              <div class="icon"></div>
              <p>No resources found. ${currentUser?.role === 'admin' ? 'Add one to get started.' : 'Ask an admin to add resources.'}</p>
            </div>
          </td></tr>`;
    return;
  }

  tbody.innerHTML = filteredResources.map((r, i) => `
      <tr style="animation:fade-up .25s ${i * 0.04}s var(--ease) both">
        <td>
          <div class="td-name">${escHtml(r.name)}</div>
          <div class="td-type tiny">${escHtml(r.type)}</div>
        </td>
        <td>${escHtml(r.type)}</td>
        <td>${r.quantity}</td>
        <td>${statusBadge(r.status)}</td>
        <td>${priorityBadge(r.priorityLevel)}</td>
        <td>${r.allocationLimit}</td>
        <td>
          <div class="td-actions">
            <button class="btn btn-ghost btn-sm" onclick="handlePredict('${r._id}')" title="ML Demand Prediction">
               Predict
            </button>
            ${currentUser?.role === 'admin' ? `
            <button class="btn btn-danger btn-sm btn-icon" onclick="handleDelete('${r._id}','${escHtml(r.name)}')" title="Delete resource">
              Delete
            </button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
}

// ── Badge helpers ──────────────────────────────────────────────────────────
function statusBadge(status) {
  const map = {
    'available': ['badge-green', 'Available'],
    'in-use': ['badge-yellow', 'In Use'],
    'depleted': ['badge-red', 'Depleted'],
  };
  const [cls, label] = map[status] || ['badge-blue', status];
  return `<span class="badge ${cls} badge-dot">${label}</span>`;
}

function priorityBadge(level) {
  const map = {
    'low': ['badge-blue', 'Low'],
    'medium': ['badge-green', 'Medium'],
    'high': ['badge-orange', 'High'],
    'critical': ['badge-red', 'Critical'],
  };
  const [cls, label] = map[level] || ['badge-purple', level];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ── Skeleton loading ───────────────────────────────────────────────────────
function showSkeletonRows(n) {
  tbody.innerHTML = Array.from({ length: n }, () => `
      <tr class="shimmer-row">
        ${Array.from({ length: 7 }, () =>
    `<td><span class="shimmer-cell" style="width:${60 + Math.random() * 60}px"></span></td>`
  ).join('')}
      </tr>
    `).join('');
  resourceCount.textContent = 'Loading…';
}

// ── ML Prediction ──────────────────────────────────────────────────────────
async function handlePredict(id) {
  const resource = allResources.find(r => r._id === id);
  if (!resource) return;

  panelResourceName.textContent = resource.name;
  panelBody.innerHTML = `
      <div class="panel-loading">
        <div class="spinner" style="width:32px;height:32px;border-width:3px"></div>
        <span>Running prediction model…</span>
      </div>`;

  openPanel();

  try {
    const result = await api.resources.predict(id);
    renderPrediction(result.prediction || result);
  } catch (err) {
    panelBody.innerHTML = `
          <div class="panel-loading" style="color:var(--red)">
            <span style="font-size:2rem"></span>
            <span>${err.message}</span>
          </div>`;
  }
}

function renderPrediction(p) {
  const level = p.predictedDemand || 'Unavailable';
  const conf = p.confidence ?? 0;
  const alloc = p.allocationRecommendation ?? '—';
  const advice = p.advice || '';
  const probs = p.probabilities || {};
  const feats = p.features || {};

  const demandColors = {
    Low: 'var(--blue)',
    Medium: 'var(--green)',
    High: 'var(--yellow)',
    Critical: 'var(--red)',
  };
  const col = demandColors[level] || 'var(--accent-lt)';

  // Probability bars
  const probOrder = ['Low', 'Medium', 'High', 'Critical'];
  const probBars = probOrder
    .filter(k => probs[k] !== undefined)
    .map(k => {
      const pct = Math.round(probs[k] * 100);
      return `
              <div class="prob-bar-wrap">
                <div class="prob-bar-label">
                  <span class="name">${k}</span>
                  <span class="pct">${pct}%</span>
                </div>
                <div class="prob-track">
                  <div class="prob-fill ${k}" style="width:${pct}%"></div>
                </div>
              </div>`;
    }).join('');

  // Feature quick-view
  const featItems = [
    { key: 'Quantity', val: feats.quantity ?? '—' },
    { key: 'Alloc. Limit', val: feats.allocationLimit ?? '—' },
    { key: 'Priority', val: capitalize(feats.priorityLevel ?? '—') },
    { key: 'Utilization', val: feats.utilization != null ? `${feats.utilization}%` : '—' },
  ].map(f => `
      <div class="feature-item">
        <div class="val">${f.val}</div>
        <div class="key">${f.key}</div>
      </div>`).join('');

  panelBody.innerHTML = `
      <!-- Demand level -->
      <div class="demand-card ${level}">
        <div class="label" style="margin-bottom:.4rem;color:${col}">Predicted Demand</div>
        <div class="demand-level">${level}</div>
        <div class="demand-conf">${conf}% confidence</div>
        ${advice ? `<div class="demand-advice">${advice}</div>` : ''}
      </div>

      <!-- Probability distribution -->
      ${probBars ? `<div class="prob-section"><div class="prob-label">Demand Probability Distribution</div>${probBars}</div>` : ''}

      <!-- Allocation recommendation -->
      <div class="alloc-section">
        <div class="alloc-title">Recommended Allocation</div>
        <div class="alloc-val">${alloc}</div>
        <div class="alloc-desc">units based on predicted demand level</div>
      </div>

      <!-- Feature used -->
      ${featItems ? `
        <div>
          <div class="label" style="margin-bottom:.6rem">Input Features</div>
          <div class="feature-grid">${featItems}</div>
        </div>` : ''}
    `;
}

// ── Panel open/close ───────────────────────────────────────────────────────
function openPanel() {
  predictPanel.classList.add('open');
  dashMain.classList.add('panel-open');
}

function closePanel() {
  predictPanel.classList.remove('open');
  dashMain.classList.remove('panel-open');
}

// ── Delete resource ────────────────────────────────────────────────────────
async function handleDelete(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    await api.resources.delete(id);
    toast(`"${name}" deleted`, 'success');
    await loadResources();
  } catch (err) {
    toast(err.message, 'error');
  }
}

// ── Add resource modal ─────────────────────────────────────────────────────
function openModal() {
  resourceForm.reset();
  modalBackdrop.classList.add('open');
}
function closeModal() {
  modalBackdrop.classList.remove('open');
}

resourceForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('r-name').value.trim();
  const type = document.getElementById('r-type').value.trim();
  const quantity = parseInt(document.getElementById('r-quantity').value) || 0;
  const alloc = parseInt(document.getElementById('r-alloc').value) || 100;
  const status = document.getElementById('r-status').value;
  const priority = document.getElementById('r-priority').value;

  if (!name || !type) {
    toast('Name and Type are required.', 'error');
    return;
  }

  modalSubmit.disabled = true;
  modalSubmit.innerHTML = '<span class="spinner"></span> Creating…';

  try {
    await api.resources.create({
      name, type,
      quantity,
      allocationLimit: alloc,
      status,
      priorityLevel: priority,
    });
    toast(`"${name}" created`, 'success');
    closeModal();
    await loadResources();
  } catch (err) {
    toast(err.message, 'error');
  } finally {
    modalSubmit.disabled = false;
    modalSubmit.innerHTML = 'Create Resource';
  }
});

// ── Event listeners ────────────────────────────────────────────────────────
logoutBtn.addEventListener('click', () => {
  if (confirm('Log out?')) logout();
});

addResourceBtn?.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', e => { if (e.target === modalBackdrop) closeModal(); });

panelClose.addEventListener('click', closePanel);

refreshBtn.addEventListener('click', async () => {
  refreshBtn.disabled = true;
  refreshBtn.textContent = '↻ Loading…';
  await loadResources();
  refreshBtn.disabled = false;
  refreshBtn.textContent = '↻ Refresh';
});

searchInput.addEventListener('input', applyFilters);
filterStatus.addEventListener('change', applyFilters);
filterPriority.addEventListener('change', applyFilters);

// Close panel on Escape, close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closePanel(); closeModal(); }
});

// ── Toast ──────────────────────────────────────────────────────────────────
function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
      <span class="toast-icon ${type}"></span>
      <span>${message}</span>`;
  toastContainer.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── Utils ──────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// Make handlePredict & handleDelete available globally (called from inline onclick)
window.handlePredict = handlePredict;
window.handleDelete = handleDelete;
