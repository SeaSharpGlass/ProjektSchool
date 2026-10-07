/**
 * WarehouseHub - Klientské drátové demo
 * Modul: Správa produktů & Víceskladové hospodářství (Zadání B: 3 Lokace, M:N vazba)
 */

// Konfigurace fyzických skladů dle Zadání B a ER diagramu
const warehouses = [
  {
    key: "praha",
    code: "W-PRG",
    name: "Centrální sklad Praha",
    location: "Praha - Ruzyně",
    type: "Centrální distribuční sklad",
    accent: "#3b82f6",
    capacity: 100,
    badgeClass: "praha"
  },
  {
    key: "brno",
    code: "W-BRN",
    name: "Regionální sklad Brno",
    location: "Brno - Slatina",
    type: "Regionální pobočka pro Moravu",
    accent: "#10b981",
    capacity: 60,
    badgeClass: "brno"
  },
  {
    key: "ostrava",
    code: "W-OST",
    name: "Distribuční centrum Ostrava",
    location: "Ostrava - Mošnov",
    type: "Distribuční centrum pro Slezsko",
    accent: "#8b5cf6",
    capacity: 50,
    badgeClass: "ostrava"
  }
];

// Výchozí produkty a zásoby na skladech (M:N vazba WarehouseStock)
let products = [
  {
    id: "prd-001",
    sku: "PRD-1001",
    name: "Bezdrátová mechanická klávesnice RGB",
    category: "Elektronika",
    description: "Kompaktní 75% rozložení, spínače Gateron Brown, Bluetooth 5.2 i 2.4GHz.",
    price: 2490,
    isActive: true,
    stocks: {
      praha: 14,
      brno: 8,
      ostrava: 3
    },
    reserved: {
      praha: 2,
      brno: 1,
      ostrava: 0
    }
  },
  {
    id: "prd-002",
    sku: "PRD-1002",
    name: "Ergonomická vertikální myš Pro",
    category: "Příslušenství",
    description: "Snižuje únavu zápěstí, nastavitelný optický senzor až 4000 DPI.",
    price: 1190,
    isActive: true,
    stocks: {
      praha: 5,
      brno: 2,
      ostrava: 0
    },
    reserved: {
      praha: 1,
      brno: 0,
      ostrava: 0
    }
  },
  {
    id: "prd-003",
    sku: "PRD-1003",
    name: "Sluchátka s aktivním potlačením hluku (ANC)",
    category: "Audio",
    description: "Výdrž baterie až 35 hodin, kodeky LDAC a AAC, luxusní koženkové náušníky.",
    price: 3890,
    isActive: true,
    stocks: {
      praha: 0,
      brno: 0,
      ostrava: 0
    },
    reserved: {
      praha: 0,
      brno: 0,
      ostrava: 0
    }
  },
  {
    id: "prd-004",
    sku: "PRD-1004",
    name: "USB-C Dokovací stanice 10v1 Dual 4K",
    category: "Elektronika",
    description: "Podpora 2x 4K@60Hz HDMI, 100W Power Delivery, Gigabit LAN, 3x USB 3.2.",
    price: 2150,
    isActive: true,
    stocks: {
      praha: 22,
      brno: 15,
      ostrava: 9
    },
    reserved: {
      praha: 4,
      brno: 0,
      ostrava: 2
    }
  },
  {
    id: "prd-005",
    sku: "PRD-1005",
    name: "Polohovací stavitelný podstavec pod monitor",
    category: "Kancelář",
    description: "Hliníková konstrukce s integrovaným organizérem kabelů, nosnost 20 kg.",
    price: 890,
    isActive: true,
    stocks: {
      praha: 4,
      brno: 3,
      ostrava: 1
    },
    reserved: {
      praha: 0,
      brno: 0,
      ostrava: 0
    }
  },
  {
    id: "prd-006",
    sku: "PRD-1006",
    name: "Kondenzátorový USB mikrofon Studio",
    category: "Audio",
    description: "Kardioidní charakteristika, vestavěný pop-filtr, monitoring bez latence.",
    price: 1790,
    isActive: true,
    stocks: {
      praha: 12,
      brno: 0,
      ostrava: 4
    },
    reserved: {
      praha: 2,
      brno: 0,
      ostrava: 1
    }
  }
];

// Aktivní záložka v přehledu skladů (ALL, praha, brno, ostrava)
let currentWarehouseTab = "ALL";

// Reference na DOM prvky - Navigace a pohledy
const navProducts = document.getElementById("nav-products");
const navWarehouses = document.getElementById("nav-warehouses");
const viewProducts = document.getElementById("view-products");
const viewWarehouses = document.getElementById("view-warehouses");
const btnViewBackToProducts = document.getElementById("btn-view-back-to-products");

// Reference na DOM prvky - Pohled Produkty
const tbody = document.getElementById("products-tbody");
const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");
const filterWarehouse = document.getElementById("filter-warehouse");
const filterStock = document.getElementById("filter-stock");
const btnResetFilters = document.getElementById("btn-reset-filters");

const kpiTotalProducts = document.getElementById("kpi-total-products");
const kpiTotalStock = document.getElementById("kpi-total-stock");
const kpiLowStock = document.getElementById("kpi-low-stock");
const kpiTotalValue = document.getElementById("kpi-total-value");
const tableStatusText = document.getElementById("table-status-text");
const navCountBadge = document.getElementById("nav-count-badge");

// Reference na DOM prvky - Pohled Sklady
const warehouseCardsContainer = document.getElementById("warehouse-cards-container");
const whTabsContainer = document.getElementById("wh-tabs-container");
const whSearchInput = document.getElementById("wh-search-input");
const whFilterAvailability = document.getElementById("wh-filter-availability");
const warehouseTbody = document.getElementById("warehouse-tbody");
const warehouseTableStatus = document.getElementById("warehouse-table-status");

// Modální okno: Produkt
const productModal = document.getElementById("product-modal");
const modalTitle = document.getElementById("modal-title");
const productForm = document.getElementById("product-form");
const btnOpenCreateModal = document.getElementById("btn-open-create-modal");
const modalBtnClose = document.getElementById("modal-btn-close");
const modalBtnCancel = document.getElementById("modal-btn-cancel");
const btnSimulateOrder = document.getElementById("btn-simulate-order");

// Modální okno: Meziskladový převod
const transferModal = document.getElementById("transfer-modal");
const transferForm = document.getElementById("transfer-form");
const btnOpenTransferModal = document.getElementById("btn-open-transfer-modal");
const transferBtnClose = document.getElementById("transfer-btn-close");
const transferBtnCancel = document.getElementById("transfer-btn-cancel");
const transferProductSelect = document.getElementById("transfer-product");
const transferFromSelect = document.getElementById("transfer-from");
const transferToSelect = document.getElementById("transfer-to");
const transferQuantityInput = document.getElementById("transfer-quantity");
const transferAvailableCount = document.getElementById("transfer-available-count");

// Inicializace po načtení DOM
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();

  // Zpracovat počáteční hash (#products nebo #warehouses)
  if (window.location.hash === "#warehouses") {
    switchView("warehouses");
  } else {
    switchView("products");
  }
});

// Přepínání mezi moduly systému (Produkty vs. Sklady)
function switchView(viewName) {
  if (viewName === "warehouses") {
    viewProducts.style.display = "none";
    viewWarehouses.style.display = "block";
    navProducts.classList.remove("active");
    navWarehouses.classList.add("active");
    window.location.hash = "warehouses";
    renderWarehouseView();
  } else {
    viewProducts.style.display = "block";
    viewWarehouses.style.display = "none";
    navProducts.classList.add("active");
    navWarehouses.classList.remove("active");
    window.location.hash = "products";
    render();
  }
}

function setupEventListeners() {
  // Navigační odkazy v postranním panelu
  navProducts.addEventListener("click", (e) => {
    e.preventDefault();
    switchView("products");
  });

  navWarehouses.addEventListener("click", (e) => {
    e.preventDefault();
    switchView("warehouses");
  });

  if (btnViewBackToProducts) {
    btnViewBackToProducts.addEventListener("click", () => switchView("products"));
  }

  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#warehouses") {
      switchView("warehouses");
    } else {
      switchView("products");
    }
  });

  // Filtrování v modulu Produktů
  searchInput.addEventListener("input", render);
  filterCategory.addEventListener("change", render);
  if (filterWarehouse) {
    filterWarehouse.addEventListener("change", render);
  }
  filterStock.addEventListener("change", render);

  btnResetFilters.addEventListener("click", () => {
    searchInput.value = "";
    filterCategory.value = "ALL";
    if (filterWarehouse) filterWarehouse.value = "ALL";
    filterStock.value = "ALL";
    render();
    showToast("Filtry katalogu byly resetovány", "info");
  });

  // Filtrování v modulu Skladů
  if (whTabsContainer) {
    whTabsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".wh-tab-btn");
      if (!btn) return;
      document.querySelectorAll(".wh-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentWarehouseTab = btn.getAttribute("data-wh") || "ALL";
      renderWarehouseView();
    });
  }

  if (whSearchInput) {
    whSearchInput.addEventListener("input", renderWarehouseView);
  }

  if (whFilterAvailability) {
    whFilterAvailability.addEventListener("change", renderWarehouseView);
  }

  // Modální dialog: Produkt
  btnOpenCreateModal.addEventListener("click", () => openModal());
  modalBtnClose.addEventListener("click", closeModal);
  modalBtnCancel.addEventListener("click", closeModal);
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeModal();
  });
  productForm.addEventListener("submit", handleFormSubmit);

  // Modální dialog: Meziskladový převod
  if (btnOpenTransferModal) {
    btnOpenTransferModal.addEventListener("click", () => openTransferModal());
  }
  if (transferBtnClose) transferBtnClose.addEventListener("click", closeTransferModal);
  if (transferBtnCancel) transferBtnCancel.addEventListener("click", closeTransferModal);
  if (transferModal) {
    transferModal.addEventListener("click", (e) => {
      if (e.target === transferModal) closeTransferModal();
    });
  }
  if (transferForm) {
    transferForm.addEventListener("submit", handleTransferSubmit);
  }
  if (transferProductSelect) {
    transferProductSelect.addEventListener("change", updateTransferAvailabilityHint);
  }
  if (transferFromSelect) {
    transferFromSelect.addEventListener("change", updateTransferAvailabilityHint);
  }

  // Klientská simulace nákupu
  btnSimulateOrder.addEventListener("click", simulateClientOrder);
}

// Výpočet celkového počtu kusů produktu napříč sklady
function getTotalStock(product) {
  return (product.stocks.praha || 0) + (product.stocks.brno || 0) + (product.stocks.ostrava || 0);
}

// Získání rezervovaného množství na konkrétním skladu
function getReservedStock(product, whKey) {
  return (product.reserved && product.reserved[whKey]) || 0;
}

// Získání volného (nerezervovaného) množství k výdeji
function getAvailableStock(product, whKey) {
  const physical = (product.stocks && product.stocks[whKey]) || 0;
  const reserved = getReservedStock(product, whKey);
  return Math.max(0, physical - reserved);
}

// Určení stavu dostupnosti pro souhrnné zobrazení
function getStockStatus(totalStock) {
  if (totalStock === 0) {
    return { key: "OUT", label: "Vyprodáno", class: "out-stock" };
  } else if (totalStock <= 10) {
    return { key: "LOW", label: `Dochází (${totalStock} ks)`, class: "low-stock" };
  } else {
    return { key: "IN_STOCK", label: `Skladem (${totalStock} ks)`, class: "in-stock" };
  }
}

// Rychlé nastavení filtru skladu z kliknutí na štítek
window.filterByWarehouse = function(whKey) {
  if (filterWarehouse) {
    filterWarehouse.value = whKey;
    render();
    const whObj = warehouses.find(w => w.key === whKey);
    showToast(`Filtrován sklad: ${whObj ? whObj.name : whKey}`, "info");
  }
};

// ===================================================================
// VYKRESLENÍ: POHLED 1 (PRODUKTY & ZÁSOBY)
// ===================================================================
function render() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCat = filterCategory.value;
  const selectedWh = filterWarehouse ? filterWarehouse.value : "ALL";
  const selectedStock = filterStock.value;

  // Filtrace produktů
  const filtered = products.filter(p => {
    const total = getTotalStock(p);
    const status = getStockStatus(total);

    // Fulltext filtr
    const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
                          p.sku.toLowerCase().includes(searchTerm) ||
                          p.description.toLowerCase().includes(searchTerm);

    // Filtr kategorie
    const matchesCategory = selectedCat === "ALL" || p.category === selectedCat;

    // Filtr skladu (zda má na vybraném skladu alespoň 1 ks)
    const matchesWarehouse = selectedWh === "ALL" || (p.stocks[selectedWh] || 0) > 0;

    // Filtr stavu zásob
    const matchesStock = selectedStock === "ALL" || status.key === selectedStock;

    return matchesSearch && matchesCategory && matchesWarehouse && matchesStock;
  });

  // Vykreslení řádků tabulky produktů
  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-dim);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p>Žádný produkt neodpovídá zvoleným filtrům.</p>
        </td>
      </tr>
    `;
  } else {
    filtered.forEach(p => {
      const total = getTotalStock(p);
      const status = getStockStatus(total);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><span class="sku-pill">${p.sku}</span></td>
        <td>
          <span class="product-name">${escapeHtml(p.name)}</span>
          <span class="product-desc" title="${escapeHtml(p.description)}">${escapeHtml(p.description)}</span>
          <span class="category-tag">${p.category}</span>
        </td>
        <td>
          <div class="price-text">${p.price.toLocaleString("cs-CZ")} Kč</div>
          <div class="price-vat">${Math.round(p.price / 1.21).toLocaleString("cs-CZ")} Kč bez DPH</div>
        </td>
        <td>
          <div class="warehouse-stock-chips">
            <span class="wh-chip clickable" onclick="filterByWarehouse('praha')" title="Filtrovat pouze Centrální sklad Praha (W-PRG)">Praha: <strong>${p.stocks.praha} ks</strong></span>
            <span class="wh-chip clickable" onclick="filterByWarehouse('brno')" title="Filtrovat pouze Regionální sklad Brno (W-BRN)">Brno: <strong>${p.stocks.brno} ks</strong></span>
            <span class="wh-chip clickable" onclick="filterByWarehouse('ostrava')" title="Filtrovat pouze Distribuční centrum Ostrava (W-OST)">Ostrava: <strong>${p.stocks.ostrava} ks</strong></span>
          </div>
        </td>
        <td>
          <strong style="font-size: 1.05rem;">${total} ks</strong>
        </td>
        <td>
          <span class="stock-status-badge ${status.class}">
            <span class="status-indicator-dot"></span>
            ${status.label}
          </span>
        </td>
        <td class="text-right">
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm quick-stock-btn" onclick="quickAdjustStock('${p.id}', -1)" title="Odebrat 1 ks ze skladu" ${total === 0 ? "disabled" : ""}>-1 ks</button>
            <button class="btn btn-secondary btn-sm quick-stock-btn" onclick="quickAdjustStock('${p.id}', 1)" title="Přijmout 1 ks na centrální sklad Praha">+1 ks</button>
            <button class="btn-icon" onclick="openModal('${p.id}')" title="Upravit produkt">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </button>
            <button class="btn-icon btn-danger" onclick="deleteProduct('${p.id}')" title="Smazat produkt">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Aktualizace souhrnných metrik
  updateMetrics(filtered);
}

// Přepočet celkových metrik
function updateMetrics(currentList) {
  const activeProducts = products.filter(p => p.isActive).length;
  let totalStockPieces = 0;
  let lowStockCount = 0;
  let totalValue = 0;

  products.forEach(p => {
    const total = getTotalStock(p);
    totalStockPieces += total;
    if (total <= 10) lowStockCount++;
    totalValue += (total * p.price);
  });

  kpiTotalProducts.textContent = activeProducts;
  kpiTotalStock.textContent = `${totalStockPieces.toLocaleString("cs-CZ")} ks`;
  kpiLowStock.textContent = `${lowStockCount} pol.`;
  kpiTotalValue.textContent = `${totalValue.toLocaleString("cs-CZ")} Kč`;

  tableStatusText.textContent = `Zobrazeno ${currentList.length} z celkem ${products.length} produktů`;
  navCountBadge.textContent = products.length;
}

// ===================================================================
// VYKRESLENÍ: POHLED 2 (SKLADY - 3 LOKACE ZE ZADÁNÍ B)
// ===================================================================
function renderWarehouseView() {
  if (!warehouseCardsContainer || !warehouseTbody) return;

  // 1. Spočítat statistiky pro každý sklad
  const stats = {};
  warehouses.forEach(wh => {
    let itemsCount = 0;
    let totalQty = 0;
    let totalReserved = 0;
    let totalValue = 0;

    products.forEach(p => {
      const q = (p.stocks[wh.key] || 0);
      const res = getReservedStock(p, wh.key);
      if (q > 0) itemsCount++;
      totalQty += q;
      totalReserved += res;
      totalValue += (q * p.price);
    });

    const capacityPct = Math.min(100, Math.round((totalQty / wh.capacity) * 100));

    stats[wh.key] = {
      itemsCount,
      totalQty,
      totalReserved,
      totalValue,
      capacityPct
    };
  });

  // 2. Vykreslit 3 karty skladů
  warehouseCardsContainer.innerHTML = "";
  warehouses.forEach(wh => {
    const s = stats[wh.key];
    const isSelected = currentWarehouseTab === wh.key;

    const card = document.createElement("div");
    card.className = "wh-card";
    card.style.setProperty("--wh-accent", wh.accent);

    card.innerHTML = `
      <div class="wh-card-header">
        <div class="wh-card-title-group">
          <span class="wh-card-title">${wh.name}</span>
          <span class="wh-card-location">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${wh.location} • <em>${wh.type}</em>
          </span>
        </div>
        <span class="wh-pill ${wh.badgeClass}">${wh.code}</span>
      </div>

      <div class="wh-stats-grid">
        <div class="wh-stat-item">
          <span class="wh-stat-label">Skladových položek</span>
          <span class="wh-stat-val">${s.itemsCount} / ${products.length}</span>
        </div>
        <div class="wh-stat-item">
          <span class="wh-stat-label">Fyzická zásoba</span>
          <span class="wh-stat-val">${s.totalQty} ks</span>
        </div>
        <div class="wh-stat-item">
          <span class="wh-stat-label">Rezervováno</span>
          <span class="wh-stat-val sub" style="color: #f59e0b;">${s.totalReserved} ks</span>
        </div>
        <div class="wh-stat-item">
          <span class="wh-stat-label">Hodnota skladu</span>
          <span class="wh-stat-val sub">${s.totalValue.toLocaleString("cs-CZ")} Kč</span>
        </div>
      </div>

      <div class="wh-capacity-wrap">
        <div class="wh-capacity-header">
          <span>Zaplnění kapacity skladu (${s.totalQty} / ${wh.capacity} ks)</span>
          <strong>${s.capacityPct} %</strong>
        </div>
        <div class="wh-capacity-bar">
          <div class="wh-capacity-fill" style="width: ${s.capacityPct}%; background: ${wh.accent};"></div>
        </div>
      </div>

      <div class="wh-card-actions">
        <button class="btn btn-secondary btn-sm" style="flex-grow: 1;" onclick="setWarehouseTab('${wh.key}')">
          ${isSelected ? "✓ Zobrazen v tabulce" : "Zobrazit zásoby skladu"}
        </button>
      </div>
    `;

    warehouseCardsContainer.appendChild(card);
  });

  // 3. Vykreslit tabulku skladových zásob (rozpad M:N)
  const query = (whSearchInput ? whSearchInput.value.trim().toLowerCase() : "");
  const availFilter = (whFilterAvailability ? whFilterAvailability.value : "ALL");

  const rowsData = [];

  products.forEach(p => {
    // Projít sklady relevantní pro aktuální záložku
    const relevantWarehouses = (currentWarehouseTab === "ALL")
      ? warehouses
      : warehouses.filter(w => w.key === currentWarehouseTab);

    relevantWarehouses.forEach(wh => {
      const qty = (p.stocks[wh.key] || 0);
      const res = getReservedStock(p, wh.key);
      const avail = Math.max(0, qty - res);

      // Vyhledávací filtr
      const matchesSearch = p.name.toLowerCase().includes(query) ||
                            p.sku.toLowerCase().includes(query) ||
                            wh.name.toLowerCase().includes(query) ||
                            wh.code.toLowerCase().includes(query);

      // Filtr dostupnosti
      let matchesAvail = true;
      if (availFilter === "IN_STOCK") matchesAvail = (qty > 0);
      if (availFilter === "OUT") matchesAvail = (qty === 0);

      if (matchesSearch && matchesAvail) {
        rowsData.push({
          product: p,
          warehouse: wh,
          quantity: qty,
          reserved: res,
          available: avail,
          value: qty * p.price
        });
      }
    });
  });

  warehouseTbody.innerHTML = "";

  if (rowsData.length === 0) {
    warehouseTbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-dim);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p>Pro vybraný sklad a filtry nebyly nalezeny žádné skladové zásoby.</p>
        </td>
      </tr>
    `;
  } else {
    rowsData.forEach(row => {
      const p = row.product;
      const wh = row.warehouse;
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="wh-pill ${wh.badgeClass}">${wh.code}</span>
            <div>
              <strong style="display: block; font-size: 0.86rem;">${wh.name}</strong>
              <small style="color: var(--text-dim);">${wh.location}</small>
            </div>
          </div>
        </td>
        <td><span class="sku-pill">${p.sku}</span></td>
        <td>
          <span class="product-name">${escapeHtml(p.name)}</span>
          <span class="category-tag">${p.category}</span>
        </td>
        <td>
          <strong style="font-size: 1rem;">${row.quantity} ks</strong>
        </td>
        <td>
          <span style="color: ${row.reserved > 0 ? '#f59e0b' : 'var(--text-dim)'}; font-weight: ${row.reserved > 0 ? '700' : 'normal'};">
            ${row.reserved} ks
          </span>
        </td>
        <td>
          <span class="stock-status-badge ${row.available > 0 ? 'in-stock' : 'out-stock'}">
            <span class="status-indicator-dot"></span>
            ${row.available} ks volných
          </span>
        </td>
        <td>
          <div class="price-text">${row.value.toLocaleString("cs-CZ")} Kč</div>
          <div class="price-vat">${p.price.toLocaleString("cs-CZ")} Kč / ks</div>
        </td>
        <td class="text-right">
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm quick-stock-btn" onclick="quickAdjustWarehouseStock('${p.id}', '${wh.key}', -1)" title="Odebrat 1 ks ze skladu ${wh.name}" ${row.available <= 0 ? 'disabled' : ''}>-1 ks</button>
            <button class="btn btn-secondary btn-sm quick-stock-btn" onclick="quickAdjustWarehouseStock('${p.id}', '${wh.key}', 1)" title="Přijmout 1 ks na sklad ${wh.name}">+1 ks</button>
            <button class="btn btn-secondary btn-sm" onclick="openTransferModal('${p.id}', '${wh.key}')" title="Převést zboží na jiný sklad" ${row.available <= 0 ? 'disabled' : ''}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path></svg>
              <span>Převést</span>
            </button>
          </div>
        </td>
      `;

      warehouseTbody.appendChild(tr);
    });
  }

  if (warehouseTableStatus) {
    warehouseTableStatus.textContent = `Zobrazeno ${rowsData.length} skladových záznamů pro ${currentWarehouseTab === "ALL" ? "všechny sklady" : warehouses.find(w => w.key === currentWarehouseTab).name}`;
  }
}

// Změna aktivní záložky skladu programově
window.setWarehouseTab = function(whKey) {
  currentWarehouseTab = whKey;
  if (whTabsContainer) {
    document.querySelectorAll(".wh-tab-btn").forEach(btn => {
      if (btn.getAttribute("data-wh") === whKey) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
  renderWarehouseView();
};

// Rychlá úprava stavu skladu pro KONKRÉTNÍ SKLAD
window.quickAdjustWarehouseStock = function(productId, warehouseKey, amount) {
  const p = products.find(item => item.id === productId);
  if (!p) return;

  const whObj = warehouses.find(w => w.key === warehouseKey) || { name: warehouseKey };

  if (amount < 0) {
    const currentQty = (p.stocks[warehouseKey] || 0);
    const reserved = getReservedStock(p, warehouseKey);

    if (currentQty <= 0) {
      showToast(`Nelze odebrat kus – Sklad ${whObj.name} nemá žádnou zásobu produktu "${p.name}".`, "warning");
      return;
    }

    if (currentQty - reserved <= 0) {
      showToast(`Nelze odebrat kus – všechny zbývající kusy na skladě ${whObj.name} jsou rezervovány v objednávkách!`, "danger");
      return;
    }

    p.stocks[warehouseKey] += amount;
    showToast(`Odebrán 1 ks ze Skladu ${whObj.name} pro: ${p.name}`, "info");
  } else {
    p.stocks[warehouseKey] = (p.stocks[warehouseKey] || 0) + amount;
    showToast(`Naskladněn +${amount} ks na Sklad ${whObj.name} pro: ${p.name}`, "info");
  }

  render();
  renderWarehouseView();
};

// ===================================================================
// MEZISKLADOVÝ PŘEVOD ZÁSOB (TRANSFER)
// ===================================================================
window.openTransferModal = function(productId = null, fromWhKey = null) {
  if (!transferModal) return;

  // Naplnit selectbox produktů
  transferProductSelect.innerHTML = "";
  products.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.sku} – ${p.name}`;
    transferProductSelect.appendChild(opt);
  });

  if (productId) {
    transferProductSelect.value = productId;
  }

  if (fromWhKey) {
    transferFromSelect.value = fromWhKey;
    // Nastavit cílový sklad na jiný než výchozí
    const otherWh = warehouses.find(w => w.key !== fromWhKey);
    if (otherWh) transferToSelect.value = otherWh.key;
  }

  transferQuantityInput.value = "1";
  updateTransferAvailabilityHint();

  transferModal.classList.add("active");
};

function closeTransferModal() {
  if (transferModal) {
    transferModal.classList.remove("active");
  }
}

function updateTransferAvailabilityHint() {
  const prodId = transferProductSelect.value;
  const fromWh = transferFromSelect.value;
  const p = products.find(item => item.id === prodId);

  if (!p) {
    transferAvailableCount.textContent = "0 ks";
    return;
  }

  const avail = getAvailableStock(p, fromWh);
  transferAvailableCount.textContent = `${avail} ks`;

  if (avail <= 0) {
    transferAvailableCount.style.color = "var(--color-rose)";
    transferQuantityInput.max = 0;
  } else {
    transferAvailableCount.style.color = "var(--color-emerald)";
    transferQuantityInput.max = avail;
  }
}

function handleTransferSubmit(e) {
  e.preventDefault();

  const prodId = transferProductSelect.value;
  const fromWh = transferFromSelect.value;
  const toWh = transferToSelect.value;
  const qty = parseInt(transferQuantityInput.value) || 0;

  if (fromWh === toWh) {
    showToast("Zdrojový a cílový sklad nemohou být stejné!", "warning");
    return;
  }

  if (qty <= 0) {
    showToast("Zadejte platný počet kusů k převodu (min. 1 ks).", "warning");
    return;
  }

  const p = products.find(item => item.id === prodId);
  if (!p) return;

  const availAtSource = getAvailableStock(p, fromWh);
  if (qty > availAtSource) {
    showToast(`Nelze převést ${qty} ks! Na zdrojovém skladu je k dispozici pouze ${availAtSource} volných ks.`, "danger");
    return;
  }

  // Provedení transakčního převodu
  p.stocks[fromWh] -= qty;
  p.stocks[toWh] = (p.stocks[toWh] || 0) + qty;

  const fromObj = warehouses.find(w => w.key === fromWh);
  const toObj = warehouses.find(w => w.key === toWh);

  closeTransferModal();
  render();
  renderWarehouseView();

  showToast(`✅ Úspěšný meziskladový převod: ${qty}x "${p.name}" přesunuto z ${fromObj.name} do ${toObj.name}.`, "success");
}

// ===================================================================
// MODÁL: PRODUKT (PŘIDAT / EDITOVAT)
// ===================================================================
window.openModal = function(productId = null) {
  productForm.reset();

  if (productId) {
    const p = products.find(item => item.id === productId);
    if (!p) return;

    modalTitle.textContent = "Upravit produkt: " + p.name;
    document.getElementById("form-product-id").value = p.id;
    document.getElementById("form-sku").value = p.sku;
    document.getElementById("form-name").value = p.name;
    document.getElementById("form-category").value = p.category;
    document.getElementById("form-description").value = p.description;
    document.getElementById("form-price").value = p.price;
    document.getElementById("form-active").value = p.isActive.toString();

    document.getElementById("form-stock-praha").value = p.stocks.praha;
    document.getElementById("form-stock-brno").value = p.stocks.brno;
    document.getElementById("form-stock-ostrava").value = p.stocks.ostrava;
  } else {
    modalTitle.textContent = "Přidat nový produkt";
    document.getElementById("form-product-id").value = "";
    const nextNum = 1000 + products.length + 1;
    document.getElementById("form-sku").value = `PRD-${nextNum}`;
    document.getElementById("form-stock-praha").value = 5;
    document.getElementById("form-stock-brno").value = 0;
    document.getElementById("form-stock-ostrava").value = 0;
  }

  productModal.classList.add("active");
};

function closeModal() {
  productModal.classList.remove("active");
}

function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("form-product-id").value;
  const sku = document.getElementById("form-sku").value.trim();
  const name = document.getElementById("form-name").value.trim();
  const category = document.getElementById("form-category").value;
  const description = document.getElementById("form-description").value.trim();
  const price = parseFloat(document.getElementById("form-price").value) || 0;
  const isActive = document.getElementById("form-active").value === "true";

  const stockPraha = parseInt(document.getElementById("form-stock-praha").value) || 0;
  const stockBrno = parseInt(document.getElementById("form-stock-brno").value) || 0;
  const stockOstrava = parseInt(document.getElementById("form-stock-ostrava").value) || 0;

  if (id) {
    // Editace
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        sku,
        name,
        category,
        description,
        price,
        isActive,
        stocks: { praha: stockPraha, brno: stockBrno, ostrava: stockOstrava }
      };
      showToast(`Produkt ${name} byl úspěšně upraven.`, "success");
    }
  } else {
    // Vytvoření nového
    const newProduct = {
      id: "prd-" + Date.now(),
      sku,
      name,
      category,
      description,
      price,
      isActive,
      stocks: { praha: stockPraha, brno: stockBrno, ostrava: stockOstrava },
      reserved: { praha: 0, brno: 0, ostrava: 0 }
    };
    products.unshift(newProduct);
    showToast(`Nový produkt ${name} byl zařazen do katalogu.`, "success");
  }

  closeModal();
  render();
  renderWarehouseView();
}

window.deleteProduct = function(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  if (confirm(`Opravdu chcete vyřadit produkt "${p.name}" ze systému?`)) {
    products = products.filter(item => item.id !== id);
    showToast(`Produkt ${p.name} byl vyřazen.`, "warning");
    render();
    renderWarehouseView();
  }
};

// Rychlá úprava stavu skladu v tabulce produktů (+1 / -1 ks)
window.quickAdjustStock = function(id, amount) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  if (amount < 0) {
    const total = getTotalStock(p);
    if (total <= 0) {
      showToast(`Nelze odebrat kus – produkt "${p.name}" je zcela vyprodán.`, "warning");
      return;
    }

    if ((p.stocks.praha || 0) > 0) {
      p.stocks.praha += amount;
      showToast(`Odebrán 1 ks ze Skladu Praha pro: ${p.name}`, "info");
    } else if ((p.stocks.brno || 0) > 0) {
      p.stocks.brno += amount;
      showToast(`Odebrán 1 ks ze Skladu Brno pro: ${p.name}`, "info");
    } else if ((p.stocks.ostrava || 0) > 0) {
      p.stocks.ostrava += amount;
      showToast(`Odebrán 1 ks ze Skladu Ostrava pro: ${p.name}`, "info");
    }
  } else {
    p.stocks.praha = (p.stocks.praha || 0) + amount;
    showToast(`Naskladněn +${amount} ks na Sklad Praha pro: ${p.name}`, "info");
  }

  render();
  renderWarehouseView();
};

// Simulace zákaznického nákupu - ukázka klientských pravidel
function simulateClientOrder() {
  if (products.length === 0) return;

  const randomIndex = Math.floor(Math.random() * products.length);
  const targetProduct = products[randomIndex];
  const requestedPieces = 2;
  const totalAvailable = getTotalStock(targetProduct);

  if (totalAvailable < requestedPieces) {
    showToast(
      `❌ Objednávka ODMÍTNUTA! Zákazník požadoval ${requestedPieces}x "${targetProduct.name}", ale celkem je skladem pouze ${totalAvailable} ks. Systém striktně odmítá objednávky bez krytí zásob.`,
      "danger"
    );
  } else {
    let selectedWarehouse = "Praha";
    if (targetProduct.stocks.brno > targetProduct.stocks.praha && targetProduct.stocks.brno >= targetProduct.stocks.ostrava) {
      selectedWarehouse = "Brno";
      targetProduct.stocks.brno -= requestedPieces;
    } else if (targetProduct.stocks.ostrava > targetProduct.stocks.praha) {
      selectedWarehouse = "Ostrava";
      targetProduct.stocks.ostrava -= requestedPieces;
    } else {
      targetProduct.stocks.praha -= requestedPieces;
    }

    const orderNumber = "ORD-2026-" + Math.floor(1000 + Math.random() * 9000);
    showToast(
      `✅ Objednávka ${orderNumber} POTVRZENA: 2x "${targetProduct.name}" (${(targetProduct.price * 2).toLocaleString("cs-CZ")} Kč). Položky byly úspěšně vyskladněny ze: Sklad ${selectedWarehouse}.`,
      "success"
    );
    render();
    renderWarehouseView();
  }
}

// Zobrazení plovoucí notifikace (Toast)
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === "danger") {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else if (type === "warning") {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    <span style="display: flex; align-items: center;">${iconSvg}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
