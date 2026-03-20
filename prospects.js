/* ===== Pipedrive Configuration ===== */
const PIPEDRIVE_CONFIG = {
  apiToken: '0086b89bf447686cf363aca895336001f839f6a2',
  companyDomain: 'boost-housellc'
};

const API_BASE = `https://${PIPEDRIVE_CONFIG.companyDomain}.pipedrive.com/api/v1`;

/* ===== State ===== */
let allDeals = [];
let allStages = {};
let pipelineId = null;

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  checkConnection();
  loadDeals();

  document.getElementById('xlsx-upload').addEventListener('change', handleFileUpload);
  document.getElementById('btn-export').addEventListener('click', exportToXlsx);
  document.getElementById('btn-refresh').addEventListener('click', loadDeals);
  document.getElementById('search-input').addEventListener('input', filterTable);
  document.getElementById('filter-status').addEventListener('change', filterTable);
  document.getElementById('btn-cancel-map').addEventListener('click', () => {
    document.getElementById('mapping-modal').hidden = true;
  });
});

/* ===== Mobile Menu (reused from main site) ===== */
function initMobileMenu() {
  const hamburger = document.querySelector('.nav__hamburger');
  const menu = document.querySelector('.nav__menu');
  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
  });
}

/* ===== API Helper ===== */
async function pipedriveAPI(endpoint, options = {}) {
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${API_BASE}${endpoint}${separator}api_token=${PIPEDRIVE_CONFIG.apiToken}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

/* ===== Fetch all pages of a Pipedrive endpoint ===== */
async function pipedriveAPIAll(endpoint) {
  let items = [];
  let start = 0;
  const limit = 100;

  while (true) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const result = await pipedriveAPI(`${endpoint}${separator}start=${start}&limit=${limit}`);
    if (result.data) {
      items = items.concat(result.data);
    }
    if (!result.additional_data || !result.additional_data.pagination || !result.additional_data.pagination.more_items_in_collection) {
      break;
    }
    start = result.additional_data.pagination.next_start;
  }

  return items;
}

/* ===== Check Pipedrive Connection ===== */
async function checkConnection() {
  const dot = document.querySelector('.status-dot');
  const text = document.getElementById('status-text');

  try {
    const result = await pipedriveAPI('/users/me');
    if (result.success) {
      dot.classList.remove('status-dot--disconnected');
      dot.classList.add('status-dot--connected');
      text.textContent = `Connected as ${result.data.name}`;
    }
  } catch (err) {
    dot.classList.add('status-dot--disconnected');
    text.textContent = 'Connection failed — check API token';
    showToast('Failed to connect to Pipedrive. Check your API token.', 'error');
  }
}

/* ===== Load Stages ===== */
async function loadStages() {
  try {
    const result = await pipedriveAPI('/stages');
    if (result.data) {
      const filterSelect = document.getElementById('filter-status');
      // Clear existing options except "All"
      filterSelect.innerHTML = '<option value="all">All Stages</option>';

      result.data.forEach(stage => {
        allStages[stage.id] = stage.name;
        if (!pipelineId) pipelineId = stage.pipeline_id;
        const opt = document.createElement('option');
        opt.value = stage.id;
        opt.textContent = stage.name;
        filterSelect.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Failed to load stages:', err);
  }
}

/* ===== Load Deals from Pipedrive ===== */
async function loadDeals() {
  const tbody = document.getElementById('prospects-body');
  tbody.innerHTML = '<tr><td colspan="6" class="prospects__empty">Loading prospects from Pipedrive...</td></tr>';

  try {
    await loadStages();
    allDeals = await pipedriveAPIAll('/deals');

    updateStats();
    renderTable(allDeals);

    if (!allDeals.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="prospects__empty">No prospects found. Import an XLSX file to get started.</td></tr>';
    }
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" class="prospects__empty">Failed to load prospects. Check your connection.</td></tr>';
    showToast('Failed to load deals: ' + err.message, 'error');
  }
}

/* ===== Update Stats ===== */
function updateStats() {
  document.getElementById('stat-total').textContent = allDeals.length;
  document.getElementById('stat-open').textContent = allDeals.filter(d => d.status === 'open').length;
  document.getElementById('stat-won').textContent = allDeals.filter(d => d.status === 'won').length;

  const totalValue = allDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  document.getElementById('stat-value').textContent = '$' + totalValue.toLocaleString();
}

/* ===== Render Table ===== */
function renderTable(deals) {
  const tbody = document.getElementById('prospects-body');

  if (!deals.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="prospects__empty">No matching prospects found.</td></tr>';
    return;
  }

  tbody.innerHTML = deals.map(deal => {
    const personName = deal.person_id ? deal.person_id.name : '-';
    const personPhone = deal.person_id && deal.person_id.phone && deal.person_id.phone[0]
      ? deal.person_id.phone[0].value : '';
    const personEmail = deal.person_id && deal.person_id.email && deal.person_id.email[0]
      ? deal.person_id.email[0].value : '';
    const contact = [personPhone, personEmail].filter(Boolean).join(' | ') || '-';
    const stageName = allStages[deal.stage_id] || 'Unknown';
    const value = deal.value ? '$' + deal.value.toLocaleString() : '-';
    const added = deal.add_time ? new Date(deal.add_time).toLocaleDateString() : '-';
    const statusClass = deal.status === 'won' ? 'stage--won' :
                        deal.status === 'lost' ? 'stage--lost' : 'stage--open';

    return `<tr>
      <td><strong>${escapeHtml(deal.title || '-')}</strong></td>
      <td class="td-contact">${escapeHtml(contact)}</td>
      <td>${escapeHtml(deal.pipeline_id ? getStagePipeline(deal) : '-')}</td>
      <td><span class="stage-badge ${statusClass}">${escapeHtml(stageName)}</span></td>
      <td>${value}</td>
      <td>${added}</td>
    </tr>`;
  }).join('');
}

function getStagePipeline(deal) {
  // Use the deal title to infer service type, or return stage name
  const title = (deal.title || '').toLowerCase();
  if (title.includes('repair')) return 'Roof Repair';
  if (title.includes('replace')) return 'Replacement';
  if (title.includes('inspect')) return 'Inspection';
  if (title.includes('commercial')) return 'Commercial';
  if (title.includes('emergency')) return 'Emergency';
  if (title.includes('residential')) return 'Residential';
  return 'Roofing';
}

/* ===== Filter & Search ===== */
function filterTable() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const stageFilter = document.getElementById('filter-status').value;

  const filtered = allDeals.filter(deal => {
    const matchSearch = !query ||
      (deal.title || '').toLowerCase().includes(query) ||
      (deal.person_id && deal.person_id.name || '').toLowerCase().includes(query);

    const matchStage = stageFilter === 'all' || String(deal.stage_id) === stageFilter;

    return matchSearch && matchStage;
  });

  renderTable(filtered);
}

/* ===== XLSX Upload & Import ===== */
let uploadedData = null;
let uploadedHeaders = null;

function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const workbook = XLSX.read(evt.target.result, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!json.length) {
        showToast('Spreadsheet is empty.', 'error');
        return;
      }

      uploadedData = json;
      uploadedHeaders = Object.keys(json[0]);
      showMappingModal();
    } catch (err) {
      showToast('Failed to read spreadsheet: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
  // Reset so same file can be re-uploaded
  e.target.value = '';
}

/* ===== Column Mapping Modal ===== */
const PIPEDRIVE_FIELDS = [
  { key: 'name', label: 'Prospect Name', required: true },
  { key: 'phone', label: 'Phone Number', required: false },
  { key: 'email', label: 'Email Address', required: false },
  { key: 'address', label: 'Address', required: false },
  { key: 'title', label: 'Deal Title', required: false },
  { key: 'value', label: 'Deal Value ($)', required: false },
  { key: 'note', label: 'Notes', required: false }
];

function showMappingModal() {
  const container = document.getElementById('mapping-fields');
  container.innerHTML = '';

  PIPEDRIVE_FIELDS.forEach(field => {
    const row = document.createElement('div');
    row.className = 'mapping-row';

    // Try to auto-match columns
    const autoMatch = findBestMatch(field.key, uploadedHeaders);

    row.innerHTML = `
      <label>${field.label}${field.required ? ' <span class="required">*</span>' : ''}</label>
      <select data-field="${field.key}">
        <option value="">— Skip —</option>
        ${uploadedHeaders.map(h => `<option value="${h}" ${h === autoMatch ? 'selected' : ''}>${h}</option>`).join('')}
      </select>
    `;
    container.appendChild(row);
  });

  document.getElementById('mapping-modal').hidden = false;

  // Wire up confirm button
  document.getElementById('btn-confirm-map').onclick = () => {
    const mapping = {};
    container.querySelectorAll('select').forEach(sel => {
      if (sel.value) mapping[sel.dataset.field] = sel.value;
    });

    if (!mapping.name) {
      showToast('Please map the "Prospect Name" field.', 'error');
      return;
    }

    document.getElementById('mapping-modal').hidden = true;
    importToPopedrive(mapping);
  };
}

function findBestMatch(fieldKey, headers) {
  const aliases = {
    name: ['name', 'full name', 'contact name', 'prospect', 'customer', 'client'],
    phone: ['phone', 'telephone', 'cell', 'mobile', 'phone number'],
    email: ['email', 'e-mail', 'email address'],
    address: ['address', 'street', 'location', 'property address'],
    title: ['title', 'deal', 'project', 'service', 'job'],
    value: ['value', 'amount', 'price', 'estimate', 'cost', 'deal value'],
    note: ['note', 'notes', 'comments', 'description', 'details']
  };

  const options = aliases[fieldKey] || [fieldKey];
  for (const h of headers) {
    const lower = h.toLowerCase().trim();
    if (options.some(alias => lower.includes(alias))) return h;
  }
  return '';
}

/* ===== Import Rows to Pipedrive ===== */
async function importToPopedrive(mapping) {
  const progressEl = document.getElementById('import-progress');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  progressEl.hidden = false;

  let success = 0;
  let failed = 0;
  const total = uploadedData.length;

  for (let i = 0; i < total; i++) {
    const row = uploadedData[i];
    const progress = ((i + 1) / total * 100).toFixed(0);
    progressFill.style.width = progress + '%';
    progressText.textContent = `Importing ${i + 1} of ${total}...`;

    try {
      // 1. Create or find person
      const personData = {
        name: row[mapping.name] || 'Unknown Prospect'
      };
      if (mapping.phone && row[mapping.phone]) {
        personData.phone = [{ value: String(row[mapping.phone]), primary: true, label: 'work' }];
      }
      if (mapping.email && row[mapping.email]) {
        personData.email = [{ value: String(row[mapping.email]), primary: true, label: 'work' }];
      }

      const personResult = await pipedriveAPI('/persons', {
        method: 'POST',
        body: JSON.stringify(personData)
      });

      const personId = personResult.data.id;

      // 2. Create deal
      const dealData = {
        title: mapping.title && row[mapping.title]
          ? String(row[mapping.title])
          : `Roofing - ${personData.name}`,
        person_id: personId
      };

      if (mapping.value && row[mapping.value]) {
        const val = parseFloat(String(row[mapping.value]).replace(/[^0-9.]/g, ''));
        if (!isNaN(val)) dealData.value = val;
      }

      if (pipelineId) {
        dealData.pipeline_id = pipelineId;
      }

      const dealResult = await pipedriveAPI('/deals', {
        method: 'POST',
        body: JSON.stringify(dealData)
      });

      // 3. Add note if provided
      if (mapping.note && row[mapping.note]) {
        let noteContent = String(row[mapping.note]);
        if (mapping.address && row[mapping.address]) {
          noteContent += `\nAddress: ${row[mapping.address]}`;
        }
        await pipedriveAPI('/notes', {
          method: 'POST',
          body: JSON.stringify({
            content: noteContent,
            deal_id: dealResult.data.id
          })
        });
      } else if (mapping.address && row[mapping.address]) {
        await pipedriveAPI('/notes', {
          method: 'POST',
          body: JSON.stringify({
            content: `Address: ${row[mapping.address]}`,
            deal_id: dealResult.data.id
          })
        });
      }

      success++;
    } catch (err) {
      console.error(`Failed to import row ${i + 1}:`, err);
      failed++;
    }
  }

  progressEl.hidden = true;
  progressFill.style.width = '0%';

  showToast(`Imported ${success} prospect${success !== 1 ? 's' : ''}${failed ? `, ${failed} failed` : ''}.`, failed ? 'warning' : 'success');

  // Reload deals
  loadDeals();
}

/* ===== Export Pipedrive Deals to XLSX ===== */
async function exportToXlsx() {
  if (!allDeals.length) {
    showToast('No deals to export. Load prospects first.', 'error');
    return;
  }

  showToast('Preparing export...', 'info');

  const rows = allDeals.map(deal => {
    const personName = deal.person_id ? deal.person_id.name : '';
    const phone = deal.person_id && deal.person_id.phone && deal.person_id.phone[0]
      ? deal.person_id.phone[0].value : '';
    const email = deal.person_id && deal.person_id.email && deal.person_id.email[0]
      ? deal.person_id.email[0].value : '';

    return {
      'Deal Title': deal.title || '',
      'Prospect Name': personName,
      'Phone': phone,
      'Email': email,
      'Stage': allStages[deal.stage_id] || '',
      'Status': deal.status || '',
      'Value': deal.value || 0,
      'Currency': deal.currency || 'USD',
      'Added Date': deal.add_time || '',
      'Expected Close': deal.expected_close_date || '',
      'Owner': deal.owner_name || ''
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Roofer Prospects');

  // Auto-size columns
  const colWidths = Object.keys(rows[0]).map(key => ({
    wch: Math.max(key.length, ...rows.map(r => String(r[key]).length)) + 2
  }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, 'roofer_prospects.xlsx');
  showToast('Exported to roofer_prospects.xlsx', 'success');
}

/* ===== Toast Notifications ===== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ===== Utility ===== */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
