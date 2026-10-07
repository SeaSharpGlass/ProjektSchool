/**
 * WarehouseHub - Klientské drátové demo
 * Moduly:
 * 1. Správa produktů & skladových zásob (Katalog, CRUD, filtrace)
 * 2. Sklady - 3 lokace ze Zadání B (Centrální sklad Praha W-PRG, Regionální sklad Brno W-BRN, Distribuční centrum Ostrava W-OST, M:N rozpad)
 * 3. Objednávky - vazba M:N (Order -> OrderItem -> Product & Warehouse, kontrola zásob, auditovatelnost výdeje)
 */

// ===================================================================
// DATOVÝ MODEL & KONFIGURACE (Zadání B)
// ===================================================================

// Konfigurace fyzických skladů dle Zadání B a ER diagramu
const warehouses = [
  {
    key: "praha",
    code: "W-PRG",
    name: "Centrální sklad Praha",
    location: "Praha - Ruzyně",
    type: "Centrální distribuční sklad",
    accent: "#F9B9F2",
    capacity: 100,
    badgeClass: "praha"
  },
  {
    key: "brno",
    code: "W-BRN",
    name: "Regionální sklad Brno",
    location: "Brno - Slatina",
    type: "Regionální pobočka pro Moravu",
    accent: "#83A0A0",
    capacity: 60,
    badgeClass: "brno"
  },
  {
    key: "ostrava",
    code: "W-OST",
    name: "Distribuční centrum Ostrava",
    location: "Ostrava - Mošnov",
    type: "Distribuční centrum pro Slezsko",
    accent: "#BCA0BC",
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
      brno: 0,
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
      praha: 1,
      brno: 0,
      ostrava: 0
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
      praha: 0,
      brno: 0,
      ostrava: 0
    }
  }
];

// Syntetická zákaznická data (pravidlo 4: Žádná reálná osobní data)
const sampleCustomers = [
  {
    id: "cst-001",
    fullName: "Jan Novák (Demo)",
    email: "jan.novak.demo@test-eshop.cz",
    phone: "+420 777 123 456",
    address: "Karlova 15, 110 00 Praha 1"
  },
  {
    id: "cst-002",
    fullName: "Petra Dvořáková (Demo)",
    email: "petra.dvorak.demo@test-eshop.cz",
    phone: "+420 608 987 654",
    address: "Masarykova 42, 602 00 Brno"
  },
  {
    id: "cst-003",
    fullName: "Tomáš Kučera (Demo)",
    email: "tomas.kucera.demo@test-eshop.cz",
    phone: "+420 724 555 888",
    address: "Nádražní 8, 702 00 Ostrava"
  }
];

// Výchozí objednávky demonstrující M:N vazbu a dohledatelnost výdeje
let orders = [
  {
    id: "ord-101",
    orderNumber: "ORD-2026-1041",
    customerId: "cst-001",
    customerName: "Jan Novák (Demo)",
    customerEmail: "jan.novak.demo@test-eshop.cz",
    customerPhone: "+420 777 123 456",
    customerAddress: "Karlova 15, 110 00 Praha 1",
    status: "Confirmed",
    createdAt: "2026-10-06 14:20",
    totalPrice: 4980,
    items: [
      {
        id: "item-001",
        productId: "prd-001",
        productSku: "PRD-1001",
        productName: "Bezdrátová mechanická klávesnice RGB",
        warehouseKey: "praha",
        warehouseName: "Centrální sklad Praha (W-PRG)",
        quantity: 2,
        unitPrice: 2490
      }
    ]
  },
  {
    id: "ord-102",
    orderNumber: "ORD-2026-1042",
    customerId: "cst-002",
    customerName: "Petra Dvořáková (Demo)",
    customerEmail: "petra.dvorak.demo@test-eshop.cz",
    customerPhone: "+420 608 987 654",
    customerAddress: "Masarykova 42, 602 00 Brno",
    status: "Confirmed",
    createdAt: "2026-10-07 09:15",
    totalPrice: 3340,
    items: [
      {
        id: "item-002",
        productId: "prd-002",
        productSku: "PRD-1002",
        productName: "Ergonomická vertikální myš Pro",
        warehouseKey: "praha",
        warehouseName: "Centrální sklad Praha (W-PRG)",
        quantity: 1,
        unitPrice: 1190
      },
      {
        id: "item-003",
        productId: "prd-004",
        productSku: "PRD-1004",
        productName: "USB-C Dokovací stanice 10v1 Dual 4K",
        warehouseKey: "praha",
        warehouseName: "Centrální sklad Praha (W-PRG)",
        quantity: 1,
        unitPrice: 2150
      }
    ]
  },
  {
    id: "ord-103",
    orderNumber: "ORD-2026-1043",
    customerId: "cst-003",
    customerName: "Tomáš Kučera (Demo)",
    customerEmail: "tomas.kucera.demo@test-eshop.cz",
    customerPhone: "+420 724 555 888",
    customerAddress: "Nádražní 8, 702 00 Ostrava",
    status: "Dispatched",
    createdAt: "2026-10-05 11:45",
    totalPrice: 4830,
    items: [
      {
        id: "item-004",
        productId: "prd-006",
        productSku: "PRD-1006",
        productName: "Kondenzátorový USB mikrofon Studio",
        warehouseKey: "ostrava",
        warehouseName: "Distribuční centrum Ostrava (W-OST)",
        quantity: 1,
        unitPrice: 1790
      },
      {
        id: "item-005",
        productId: "prd-005",
        productSku: "PRD-1005",
        productName: "Polohovací stavitelný podstavec pod monitor",
        warehouseKey: "brno",
        warehouseName: "Regionální sklad Brno (W-BRN)",
        quantity: 1,
        unitPrice: 890
      },
      {
        id: "item-006",
        productId: "prd-004",
        productSku: "PRD-1004",
        productName: "USB-C Dokovací stanice 10v1 Dual 4K",
        warehouseKey: "ostrava",
        warehouseName: "Distribuční centrum Ostrava (W-OST)",
        quantity: 1,
        unitPrice: 2150
      }
    ]
  }
];

// Aktivní záložka v přehledu skladů (ALL, praha, brno, ostrava)
let currentWarehouseTab = "ALL";

// ===================================================================
// REFERENCE NA DOM PRVKY
// ===================================================================

// Navigace a moduly
const navProducts = document.getElementById("nav-products");
const navWarehouses = document.getElementById("nav-warehouses");
const navOrders = document.getElementById("nav-orders");
const navCountBadge = document.getElementById("nav-count-badge");
const navOrdersBadge = document.getElementById("nav-orders-badge");

const viewProducts = document.getElementById("view-products");
const viewWarehouses = document.getElementById("view-warehouses");
const viewOrders = document.getElementById("view-orders");
const btnViewBackToProducts = document.getElementById("btn-view-back-to-products");

// Modul 1: Produkty
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

// Modul 2: Sklady
const warehouseCardsContainer = document.getElementById("warehouse-cards-container");
const whTabsContainer = document.getElementById("wh-tabs-container");
const whSearchInput = document.getElementById("wh-search-input");
const whFilterAvailability = document.getElementById("wh-filter-availability");
const warehouseTbody = document.getElementById("warehouse-tbody");
const warehouseTableStatus = document.getElementById("warehouse-table-status");

// Modul 3: Objednávky
const ordersTbody = document.getElementById("orders-tbody");
const orderSearchInput = document.getElementById("order-search-input");
const orderFilterStatus = document.getElementById("order-filter-status");
const orderFilterWarehouse = document.getElementById("order-filter-warehouse");
const btnResetOrderFilters = document.getElementById("btn-reset-order-filters");

const kpiOrdersCount = document.getElementById("kpi-orders-count");
const kpiOrdersRevenue = document.getElementById("kpi-orders-revenue");
const kpiOrdersConfirmed = document.getElementById("kpi-orders-confirmed");
const kpiOrdersDispatched = document.getElementById("kpi-orders-dispatched");
const ordersTableStatus = document.getElementById("orders-table-status");

const btnOpenCreateOrderModal = document.getElementById("btn-open-create-order-modal");
const btnQuickSampleOrder = document.getElementById("btn-quick-sample-order");

// Modály
const productModal = document.getElementById("product-modal");
const modalTitle = document.getElementById("modal-title");
const productForm = document.getElementById("product-form");
const btnOpenCreateModal = document.getElementById("btn-open-create-modal");
const modalBtnClose = document.getElementById("modal-btn-close");
const modalBtnCancel = document.getElementById("modal-btn-cancel");
const btnSimulateOrder = document.getElementById("btn-simulate-order");

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

const createOrderModal = document.getElementById("create-order-modal");
const createOrderForm = document.getElementById("create-order-form");
const createOrderBtnClose = document.getElementById("create-order-btn-close");
const createOrderBtnCancel = document.getElementById("create-order-btn-cancel");
const orderCustomerSelect = document.getElementById("order-customer-select");
const orderCustName = document.getElementById("order-cust-name");
const orderCustEmail = document.getElementById("order-cust-email");
const orderCustPhone = document.getElementById("order-cust-phone");
const orderCustAddress = document.getElementById("order-cust-address");
const orderItemsBuilder = document.getElementById("order-items-builder");
const btnAddOrderItem = document.getElementById("btn-add-order-item");
const orderCalcSubtotal = document.getElementById("order-calc-subtotal");
const orderCalcVat = document.getElementById("order-calc-vat");
const orderCalcTotal = document.getElementById("order-calc-total");

const orderDetailModal = document.getElementById("order-detail-modal");
const orderDetailTitle = document.getElementById("order-detail-title");
const orderDetailBtnClose = document.getElementById("order-detail-btn-close");
const orderDetailContent = document.getElementById("order-detail-content");
const orderDetailActions = document.getElementById("order-detail-actions");

// ===================================================================
// INICIALIZACE A PŘEPÍNÁNÍ POHLEDŮ
// ===================================================================

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();

  // Zpracovat počáteční hash (#products, #warehouses, #orders)
  if (window.location.hash === "#orders") {
    switchView("orders");
  } else if (window.location.hash === "#warehouses") {
    switchView("warehouses");
  } else {
    switchView("products");
  }
});

function switchView(viewName) {
  // Reset tříd
  navProducts.classList.remove("active");
  navWarehouses.classList.remove("active");
  if (navOrders) navOrders.classList.remove("active");

  viewProducts.style.display = "none";
  viewWarehouses.style.display = "none";
  if (viewOrders) viewOrders.style.display = "none";

  if (viewName === "orders") {
    if (viewOrders) viewOrders.style.display = "block";
    if (navOrders) navOrders.classList.add("active");
    window.location.hash = "orders";
    renderOrdersView();
  } else if (viewName === "warehouses") {
    viewWarehouses.style.display = "block";
    navWarehouses.classList.add("active");
    window.location.hash = "warehouses";
    renderWarehouseView();
  } else {
    viewProducts.style.display = "block";
    navProducts.classList.add("active");
    window.location.hash = "products";
    render();
  }
}

function setupEventListeners() {
  // Navigace v postranním panelu
  navProducts.addEventListener("click", (e) => {
    e.preventDefault();
    switchView("products");
  });

  navWarehouses.addEventListener("click", (e) => {
    e.preventDefault();
    switchView("warehouses");
  });

  if (navOrders) {
    navOrders.addEventListener("click", (e) => {
      e.preventDefault();
      switchView("orders");
    });
  }

  if (btnViewBackToProducts) {
    btnViewBackToProducts.addEventListener("click", () => switchView("products"));
  }

  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#orders") {
      switchView("orders");
    } else if (window.location.hash === "#warehouses") {
      switchView("warehouses");
    } else {
      switchView("products");
    }
  });

  // Filtry: Produkty
  searchInput.addEventListener("input", render);
  filterCategory.addEventListener("change", render);
  if (filterWarehouse) filterWarehouse.addEventListener("change", render);
  filterStock.addEventListener("change", render);

  btnResetFilters.addEventListener("click", () => {
    searchInput.value = "";
    filterCategory.value = "ALL";
    if (filterWarehouse) filterWarehouse.value = "ALL";
    filterStock.value = "ALL";
    render();
    showToast("Filtry katalogu byly resetovány", "info");
  });

  // Filtry: Sklady
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

  if (whSearchInput) whSearchInput.addEventListener("input", renderWarehouseView);
  if (whFilterAvailability) whFilterAvailability.addEventListener("change", renderWarehouseView);

  // Filtry: Objednávky
  if (orderSearchInput) orderSearchInput.addEventListener("input", renderOrdersView);
  if (orderFilterStatus) orderFilterStatus.addEventListener("change", renderOrdersView);
  if (orderFilterWarehouse) orderFilterWarehouse.addEventListener("change", renderOrdersView);
  if (btnResetOrderFilters) {
    btnResetOrderFilters.addEventListener("click", () => {
      orderSearchInput.value = "";
      orderFilterStatus.value = "ALL";
      orderFilterWarehouse.value = "ALL";
      renderOrdersView();
      showToast("Filtry objednávek byly resetovány", "info");
    });
  }

  // Modál: Produkt
  btnOpenCreateModal.addEventListener("click", () => openModal());
  modalBtnClose.addEventListener("click", closeModal);
  modalBtnCancel.addEventListener("click", closeModal);
  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeModal();
  });
  productForm.addEventListener("submit", handleFormSubmit);

  // Modál: Převod
  if (btnOpenTransferModal) btnOpenTransferModal.addEventListener("click", () => openTransferModal());
  if (transferBtnClose) transferBtnClose.addEventListener("click", closeTransferModal);
  if (transferBtnCancel) transferBtnCancel.addEventListener("click", closeTransferModal);
  if (transferModal) {
    transferModal.addEventListener("click", (e) => {
      if (e.target === transferModal) closeTransferModal();
    });
  }
  if (transferForm) transferForm.addEventListener("submit", handleTransferSubmit);
  if (transferProductSelect) transferProductSelect.addEventListener("change", updateTransferAvailabilityHint);
  if (transferFromSelect) transferFromSelect.addEventListener("change", updateTransferAvailabilityHint);

  // Modál: Objednávka
  if (btnOpenCreateOrderModal) btnOpenCreateOrderModal.addEventListener("click", openCreateOrderModal);
  if (btnQuickSampleOrder) btnQuickSampleOrder.addEventListener("click", simulateClientOrder);
  if (createOrderBtnClose) createOrderBtnClose.addEventListener("click", closeCreateOrderModal);
  if (createOrderBtnCancel) createOrderBtnCancel.addEventListener("click", closeCreateOrderModal);
  if (createOrderModal) {
    createOrderModal.addEventListener("click", (e) => {
      if (e.target === createOrderModal) closeCreateOrderModal();
    });
  }
  if (createOrderForm) createOrderForm.addEventListener("submit", handleCreateOrderSubmit);
  if (btnAddOrderItem) btnAddOrderItem.addEventListener("click", () => addOrderItemRow());
  if (orderCustomerSelect) orderCustomerSelect.addEventListener("change", handleCustomerSelectChange);

  // Modál: Detail objednávky
  if (orderDetailBtnClose) orderDetailBtnClose.addEventListener("click", closeOrderDetailModal);
  if (orderDetailModal) {
    orderDetailModal.addEventListener("click", (e) => {
      if (e.target === orderDetailModal) closeOrderDetailModal();
    });
  }

  // Simulace nákupu z topbaru
  btnSimulateOrder.addEventListener("click", simulateClientOrder);
}

// ===================================================================
// POMOCNÉ DOMÉNOVÉ FUNKCE
// ===================================================================

function getTotalStock(product) {
  return (product.stocks.praha || 0) + (product.stocks.brno || 0) + (product.stocks.ostrava || 0);
}

function getReservedStock(product, whKey) {
  return (product.reserved && product.reserved[whKey]) || 0;
}

function getAvailableStock(product, whKey) {
  const physical = (product.stocks && product.stocks[whKey]) || 0;
  const reserved = getReservedStock(product, whKey);
  return Math.max(0, physical - reserved);
}

function getStockStatus(totalStock) {
  if (totalStock === 0) {
    return { key: "OUT", label: "Vyprodáno", class: "out-stock" };
  } else if (totalStock <= 10) {
    return { key: "LOW", label: `Dochází (${totalStock} ks)`, class: "low-stock" };
  } else {
    return { key: "IN_STOCK", label: `Skladem (${totalStock} ks)`, class: "in-stock" };
  }
}

window.filterByWarehouse = function(whKey) {
  if (filterWarehouse) {
    filterWarehouse.value = whKey;
    render();
    const whObj = warehouses.find(w => w.key === whKey);
    showToast(`Filtrován sklad: ${whObj ? whObj.name : whKey}`, "info");
  }
};

// ===================================================================
// VYKRESLENÍ: 1. PRODUKTY & ZÁSOBY
// ===================================================================
function render() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCat = filterCategory.value;
  const selectedWh = filterWarehouse ? filterWarehouse.value : "ALL";
  const selectedStock = filterStock.value;

  const filtered = products.filter(p => {
    const total = getTotalStock(p);
    const status = getStockStatus(total);

    const matchesSearch = p.name.toLowerCase().includes(searchTerm) ||
                          p.sku.toLowerCase().includes(searchTerm) ||
                          p.description.toLowerCase().includes(searchTerm);

    const matchesCategory = selectedCat === "ALL" || p.category === selectedCat;
    const matchesWarehouse = selectedWh === "ALL" || (p.stocks[selectedWh] || 0) > 0;
    const matchesStock = selectedStock === "ALL" || status.key === selectedStock;

    return matchesSearch && matchesCategory && matchesWarehouse && matchesStock;
  });

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

  updateMetrics(filtered);
}

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
// VYKRESLENÍ: 2. SKLADY (3 LOKACE ZE ZADÁNÍ B)
// ===================================================================
function renderWarehouseView() {
  if (!warehouseCardsContainer || !warehouseTbody) return;

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

  const query = (whSearchInput ? whSearchInput.value.trim().toLowerCase() : "");
  const availFilter = (whFilterAvailability ? whFilterAvailability.value : "ALL");
  const rowsData = [];

  products.forEach(p => {
    const relevantWarehouses = (currentWarehouseTab === "ALL")
      ? warehouses
      : warehouses.filter(w => w.key === currentWarehouseTab);

    relevantWarehouses.forEach(wh => {
      const qty = (p.stocks[wh.key] || 0);
      const res = getReservedStock(p, wh.key);
      const avail = Math.max(0, qty - res);

      const matchesSearch = p.name.toLowerCase().includes(query) ||
                            p.sku.toLowerCase().includes(query) ||
                            wh.name.toLowerCase().includes(query) ||
                            wh.code.toLowerCase().includes(query);

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
        <td><strong style="font-size: 1rem;">${row.quantity} ks</strong></td>
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
  renderOrdersView();
};

// ===================================================================
// VYKRESLENÍ: 3. OBJEDNÁVKY (M:N VAZBA, AUDITOVATELNOST VÝDEJE)
// ===================================================================
function renderOrdersView() {
  if (!ordersTbody) return;

  const search = orderSearchInput ? orderSearchInput.value.trim().toLowerCase() : "";
  const statusFilter = orderFilterStatus ? orderFilterStatus.value : "ALL";
  const whFilter = orderFilterWarehouse ? orderFilterWarehouse.value : "ALL";

  // Výpočet KPI objednávek
  let totalRevenue = 0;
  let confirmedCount = 0;
  let dispatchedCount = 0;

  orders.forEach(ord => {
    if (ord.status !== "Cancelled") {
      totalRevenue += ord.totalPrice;
    }
    if (ord.status === "Confirmed") confirmedCount++;
    if (ord.status === "Dispatched") dispatchedCount++;
  });

  if (kpiOrdersCount) kpiOrdersCount.textContent = orders.length;
  if (kpiOrdersRevenue) kpiOrdersRevenue.textContent = `${totalRevenue.toLocaleString("cs-CZ")} Kč`;
  if (kpiOrdersConfirmed) kpiOrdersConfirmed.textContent = confirmedCount;
  if (kpiOrdersDispatched) kpiOrdersDispatched.textContent = dispatchedCount;
  if (navOrdersBadge) navOrdersBadge.textContent = confirmedCount;

  // Filtrace objednávek
  const filtered = orders.filter(ord => {
    const matchesSearch = ord.orderNumber.toLowerCase().includes(search) ||
                          ord.customerName.toLowerCase().includes(search) ||
                          ord.customerEmail.toLowerCase().includes(search) ||
                          ord.items.some(it => it.productName.toLowerCase().includes(search));

    const matchesStatus = (statusFilter === "ALL") || (ord.status === statusFilter);

    const matchesWarehouse = (whFilter === "ALL") || ord.items.some(it => it.warehouseKey === whFilter);

    return matchesSearch && matchesStatus && matchesWarehouse;
  });

  ordersTbody.innerHTML = "";

  if (filtered.length === 0) {
    ordersTbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-dim);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; opacity: 0.5;"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <p>Nebyly nalezeny žádné objednávky odpovídající zadaným filtrům.</p>
        </td>
      </tr>
    `;
  } else {
    filtered.forEach(ord => {
      const tr = document.createElement("tr");

      // Náhled položek a expedičních skladů
      const itemsPreviewHtml = ord.items.map(it => {
        const whObj = warehouses.find(w => w.key === it.warehouseKey) || { code: it.warehouseKey, badgeClass: "praha" };
        return `
          <div class="order-item-chip" title="${escapeHtml(it.productName)} z ${escapeHtml(it.warehouseName)}">
            <span class="wh-pill ${whObj.badgeClass}" style="padding: 1px 5px; font-size: 0.68rem;">${whObj.code}</span>
            <span><strong>${it.quantity}x</strong> ${escapeHtml(it.productName)}</span>
          </div>
        `;
      }).join("");

      // Status badge třída a popisek
      let badgeClass = "confirmed";
      let statusLabel = "Potvrzeno";
      if (ord.status === "Dispatched") {
        badgeClass = "dispatched";
        statusLabel = "Expedováno";
      } else if (ord.status === "Cancelled") {
        badgeClass = "cancelled";
        statusLabel = "Stornováno";
      }

      tr.innerHTML = `
        <td><span class="sku-pill" style="color: #60a5fa; font-weight: 800;">${ord.orderNumber}</span></td>
        <td>
          <strong style="display: block; font-size: 0.88rem;">${escapeHtml(ord.customerName)}</strong>
          <small style="color: var(--text-dim);">${escapeHtml(ord.customerEmail)}</small>
        </td>
        <td><small style="color: var(--text-muted);">${ord.createdAt}</small></td>
        <td>
          <div class="order-items-preview">
            ${itemsPreviewHtml}
          </div>
        </td>
        <td>
          <div class="price-text">${ord.totalPrice.toLocaleString("cs-CZ")} Kč</div>
          <div class="price-vat">${ord.items.length} ${ord.items.length === 1 ? "položka" : "položky"} (M:N)</div>
        </td>
        <td>
          <span class="order-status-badge ${badgeClass}">
            <span class="status-indicator-dot"></span>
            ${statusLabel}
          </span>
        </td>
        <td class="text-right">
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm" onclick="viewOrderDetail('${ord.id}')" title="Zobrazit detail položek a audit výdeje">
              Detail
            </button>
            ${ord.status === "Confirmed" ? `
              <button class="btn btn-primary btn-sm" onclick="dispatchOrder('${ord.id}')" title="Expedovat ze skladů">
                Expedovat
              </button>
            ` : ""}
          </div>
        </td>
      `;

      ordersTbody.appendChild(tr);
    });
  }

  if (ordersTableStatus) {
    ordersTableStatus.textContent = `Zobrazeno ${filtered.length} z celkem ${orders.length} objednávek`;
  }
}

// ===================================================================
// MODÁL: VYTVOŘENÍ NOVÉ OBJEDNÁVKY (M:N POLOŽKY S AUDITEM SKLADŮ)
// ===================================================================
function openCreateOrderModal() {
  if (!createOrderModal) return;

  // Naplnit select zákazníků
  orderCustomerSelect.innerHTML = `
    <option value="">-- Vyberte stávajícího zákazníka nebo zadejte nového --</option>
  `;
  sampleCustomers.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.fullName} (${c.email})`;
    orderCustomerSelect.appendChild(opt);
  });

  // Předvolit prvního zákazníka
  if (sampleCustomers.length > 0) {
    orderCustomerSelect.value = sampleCustomers[0].id;
    handleCustomerSelectChange();
  }

  // Inicializovat builder s jedním řádkem
  orderItemsBuilder.innerHTML = "";
  addOrderItemRow();

  createOrderModal.classList.add("active");
}

function closeCreateOrderModal() {
  if (createOrderModal) createOrderModal.classList.remove("active");
}

function handleCustomerSelectChange() {
  const custId = orderCustomerSelect.value;
  const c = sampleCustomers.find(item => item.id === custId);
  if (c) {
    orderCustName.value = c.fullName;
    orderCustEmail.value = c.email;
    orderCustPhone.value = c.phone;
    orderCustAddress.value = c.address;
  } else {
    orderCustName.value = "";
    orderCustEmail.value = "";
    orderCustPhone.value = "";
    orderCustAddress.value = "";
  }
}

function addOrderItemRow(defaultProdId = null, defaultWhKey = "praha", defaultQty = 1) {
  const rowId = "row-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  const row = document.createElement("div");
  row.className = "order-builder-row";
  row.id = rowId;

  // Sestavení options pro produkty
  const prodOptions = products.map(p => `
    <option value="${p.id}" ${p.id === defaultProdId ? "selected" : ""}>
      ${p.sku} – ${p.name} (${p.price} Kč)
    </option>
  `).join("");

  // Sestavení options pro sklady
  const whOptions = warehouses.map(wh => `
    <option value="${wh.key}" ${wh.key === defaultWhKey ? "selected" : ""}>
      ${wh.code} – ${wh.name}
    </option>
  `).join("");

  row.innerHTML = `
    <div>
      <select class="builder-prod-select" onchange="updateBuilderRow('${rowId}')">
        ${prodOptions}
      </select>
    </div>
    <div>
      <select class="builder-wh-select" onchange="updateBuilderRow('${rowId}')">
        ${whOptions}
      </select>
    </div>
    <div>
      <input type="number" class="builder-qty-input" min="1" value="${defaultQty}" oninput="updateBuilderRow('${rowId}')" title="Množství ks">
    </div>
    <div style="text-align: right; font-weight: 700;">
      <span class="builder-subtotal">0 Kč</span>
    </div>
    <div>
      <button type="button" class="btn-icon btn-danger" onclick="removeOrderItemRow('${rowId}')" title="Odstranit položku">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
    <div class="order-stock-hint" id="${rowId}-hint">
      <span>Dostupná volná zásoba na vybraném skladu: <strong class="builder-avail-val">0 ks</strong></span>
      <span class="builder-unit-price" style="color: var(--text-dim);">0 Kč / ks</span>
    </div>
  `;

  orderItemsBuilder.appendChild(row);
  updateBuilderRow(rowId);
}

window.removeOrderItemRow = function(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;

  const totalRows = orderItemsBuilder.querySelectorAll(".order-builder-row").length;
  if (totalRows <= 1) {
    showToast("Objednávka musí obsahovat alespoň jednu položku!", "warning");
    return;
  }

  row.remove();
  recalculateOrderTotals();
};

window.updateBuilderRow = function(rowId) {
  const row = document.getElementById(rowId);
  if (!row) return;

  const prodSelect = row.querySelector(".builder-prod-select");
  const whSelect = row.querySelector(".builder-wh-select");
  const qtyInput = row.querySelector(".builder-qty-input");
  const subtotalEl = row.querySelector(".builder-subtotal");
  const availEl = row.querySelector(".builder-avail-val");
  const unitPriceEl = row.querySelector(".builder-unit-price");
  const hintContainer = row.querySelector(".order-stock-hint");

  const p = products.find(item => item.id === prodSelect.value);
  if (!p) return;

  const whKey = whSelect.value;
  const qty = parseInt(qtyInput.value) || 0;
  const avail = getAvailableStock(p, whKey);

  availEl.textContent = `${avail} ks`;
  unitPriceEl.textContent = `${p.price.toLocaleString("cs-CZ")} Kč / ks`;

  if (qty > avail) {
    hintContainer.classList.add("out-of-stock");
    availEl.style.color = "var(--color-rose)";
  } else {
    hintContainer.classList.remove("out-of-stock");
    availEl.style.color = "var(--color-emerald)";
  }

  const subtotal = qty * p.price;
  subtotalEl.textContent = `${subtotal.toLocaleString("cs-CZ")} Kč`;

  recalculateOrderTotals();
};

function recalculateOrderTotals() {
  let subtotal = 0;
  const rows = orderItemsBuilder.querySelectorAll(".order-builder-row");

  rows.forEach(row => {
    const prodSelect = row.querySelector(".builder-prod-select");
    const qtyInput = row.querySelector(".builder-qty-input");
    const p = products.find(item => item.id === prodSelect.value);
    const qty = parseInt(qtyInput.value) || 0;
    if (p) {
      subtotal += (qty * p.price);
    }
  });

  const vat = Math.round(subtotal * 0.21);
  const total = subtotal;
  const withoutVat = Math.round(subtotal / 1.21);

  if (orderCalcSubtotal) orderCalcSubtotal.textContent = `${withoutVat.toLocaleString("cs-CZ")} Kč`;
  if (orderCalcVat) orderCalcVat.textContent = `${(total - withoutVat).toLocaleString("cs-CZ")} Kč`;
  if (orderCalcTotal) orderCalcTotal.textContent = `${total.toLocaleString("cs-CZ")} Kč`;
}

// Odeslání formuláře objednávky (s doménovým pravidlem Zadání B)
function handleCreateOrderSubmit(e) {
  e.preventDefault();

  const custName = orderCustName.value.trim();
  const custEmail = orderCustEmail.value.trim();
  const custPhone = orderCustPhone.value.trim();
  const custAddress = orderCustAddress.value.trim();

  const rows = orderItemsBuilder.querySelectorAll(".order-builder-row");
  if (rows.length === 0) {
    showToast("Přidejte alespoň jednu položku do objednávky!", "warning");
    return;
  }

  const items = [];
  let hasInsufficientStock = false;
  let insufficientMessage = "";

  rows.forEach(row => {
    const prodId = row.querySelector(".builder-prod-select").value;
    const whKey = row.querySelector(".builder-wh-select").value;
    const qty = parseInt(row.querySelector(".builder-qty-input").value) || 0;

    const p = products.find(item => item.id === prodId);
    const whObj = warehouses.find(w => w.key === whKey);
    const avail = getAvailableStock(p, whKey);

    if (qty <= 0) {
      hasInsufficientStock = true;
      insufficientMessage = "Množství u položky musí být minimálně 1 ks.";
      return;
    }

    // KRITICKÉ PRAVIDLO ZADÁNÍ B: Striktní odmítnutí při nedostatku zásob
    if (qty > avail) {
      hasInsufficientStock = true;
      insufficientMessage = `❌ Objednávka ODMÍTNUTA! Na skladě "${whObj.name}" je k dispozici pouze ${avail} ks produktu "${p.name}". Nelze vytvořit objednávku na ${qty} ks bez krytí zásoby.`;
      return;
    }

    items.push({
      id: "item-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      productId: p.id,
      productSku: p.sku,
      productName: p.name,
      warehouseKey: whKey,
      warehouseName: whObj.name,
      quantity: qty,
      unitPrice: p.price
    });
  });

  if (hasInsufficientStock) {
    showToast(insufficientMessage, "danger");
    return;
  }

  // Výpočet celkové ceny
  const totalPrice = items.reduce((acc, it) => acc + (it.quantity * it.unitPrice), 0);
  const orderNumber = "ORD-2026-" + Math.floor(1000 + Math.random() * 9000);

  // Provedení rezervace na skladech (ReservedQuantity dle ERD)
  items.forEach(it => {
    const p = products.find(prod => prod.id === it.productId);
    if (p) {
      if (!p.reserved) p.reserved = { praha: 0, brno: 0, ostrava: 0 };
      p.reserved[it.warehouseKey] = (p.reserved[it.warehouseKey] || 0) + it.quantity;
    }
  });

  // Vytvoření entity objednávky
  const newOrder = {
    id: "ord-" + Date.now(),
    orderNumber,
    customerId: orderCustomerSelect.value || "cst-" + Date.now(),
    customerName: custName,
    customerEmail: custEmail,
    customerPhone: custPhone,
    customerAddress: custAddress,
    status: "Confirmed",
    createdAt: new Date().toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" }),
    totalPrice,
    items
  };

  orders.unshift(newOrder);

  closeCreateOrderModal();
  render();
  renderWarehouseView();
  renderOrdersView();

  showToast(`✅ Objednávka ${orderNumber} POTVRZENA (${totalPrice.toLocaleString("cs-CZ")} Kč). Položky byly zarezervovány na příslušných skladech expedice.`, "success");
}

// ===================================================================
// MODÁL: DETAIL OBJEDNÁVKY & AUDIT VÝDEJE
// ===================================================================
window.viewOrderDetail = function(orderId) {
  const ord = orders.find(item => item.id === orderId);
  if (!ord || !orderDetailModal) return;

  orderDetailTitle.textContent = `Detail objednávky: ${ord.orderNumber}`;

  let badgeClass = "confirmed";
  let statusText = "Potvrzeno (Zboží rezervováno na skladech)";
  if (ord.status === "Dispatched") {
    badgeClass = "dispatched";
    statusText = "Expedováno zákazníkovi (Odpis ze zásob dokončen)";
  } else if (ord.status === "Cancelled") {
    badgeClass = "cancelled";
    statusText = "Stornováno (Rezervace uvolněna)";
  }

  const itemsHtml = ord.items.map(it => {
    const whObj = warehouses.find(w => w.key === it.warehouseKey) || { code: it.warehouseKey, name: it.warehouseName, badgeClass: "praha" };
    return `
      <tr>
        <td><span class="sku-pill">${it.productSku}</span></td>
        <td><strong>${escapeHtml(it.productName)}</strong></td>
        <td>
          <span class="wh-pill ${whObj.badgeClass}">${whObj.code}</span>
          <small style="display: block; color: var(--text-dim); margin-top: 2px;">${whObj.name}</small>
        </td>
        <td><strong>${it.quantity} ks</strong></td>
        <td>${it.unitPrice.toLocaleString("cs-CZ")} Kč</td>
        <td><strong>${(it.quantity * it.unitPrice).toLocaleString("cs-CZ")} Kč</strong></td>
      </tr>
    `;
  }).join("");

  orderDetailContent.innerHTML = `
    <div class="order-detail-meta">
      <div class="order-meta-item">
        <span class="order-meta-label">Stav objednávky</span>
        <div style="margin-top: 4px;">
          <span class="order-status-badge ${badgeClass}">${statusText}</span>
        </div>
      </div>
      <div class="order-meta-item">
        <span class="order-meta-label">Odběratel (Zákazník)</span>
        <span class="order-meta-val">${escapeHtml(ord.customerName)}</span>
        <small style="color: var(--text-dim);">${escapeHtml(ord.customerEmail)} • ${escapeHtml(ord.customerPhone || "Bez tel.")}</small>
      </div>
      <div class="order-meta-item">
        <span class="order-meta-label">Dodací adresa</span>
        <span class="order-meta-val">${escapeHtml(ord.customerAddress || "Osobní odběr")}</span>
      </div>
      <div class="order-meta-item">
        <span class="order-meta-label">Čas vytvoření</span>
        <span class="order-meta-val">${ord.createdAt}</span>
      </div>
    </div>

    <h3 style="font-size: 0.92rem; text-transform: uppercase; letter-spacing: 0.05em; color: #60a5fa; margin-bottom: 10px;">
      Rozpis položek & Dohledatelnost skladu výdeje (M:N)
    </h3>
    <table class="order-detail-items-table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Produkt</th>
          <th>Sklad výdeje (Audit)</th>
          <th>Množství</th>
          <th>Cena / ks</th>
          <th>Celkem</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="order-summary-box" style="margin-top: 10px;">
      <div class="order-summary-row total">
        <span>Celková částka objednávky s DPH:</span>
        <span style="font-size: 1.2rem; color: #60a5fa;">${ord.totalPrice.toLocaleString("cs-CZ")} Kč</span>
      </div>
    </div>
  `;

  // Tlačítka akcí dle stavu
  orderDetailActions.innerHTML = "";
  if (ord.status === "Confirmed") {
    orderDetailActions.innerHTML = `
      <button type="button" class="btn btn-secondary btn-danger" onclick="cancelOrder('${ord.id}')">Stornovat objednávku</button>
      <button type="button" class="btn btn-primary" onclick="dispatchOrder('${ord.id}')">Expedovat objednávku ze skladů</button>
    `;
  } else {
    orderDetailActions.innerHTML = `
      <button type="button" class="btn btn-secondary" onclick="closeOrderDetailModal()">Zavřít</button>
    `;
  }

  orderDetailModal.classList.add("active");
};

function closeOrderDetailModal() {
  if (orderDetailModal) orderDetailModal.classList.remove("active");
}

window.dispatchOrder = function(orderId) {
  const ord = orders.find(item => item.id === orderId);
  if (!ord || ord.status !== "Confirmed") return;

  // Definitivní odpis ze skladových zásob a zrušení rezervace
  ord.items.forEach(it => {
    const p = products.find(prod => prod.id === it.productId);
    if (p) {
      if (p.stocks[it.warehouseKey] !== undefined) {
        p.stocks[it.warehouseKey] = Math.max(0, p.stocks[it.warehouseKey] - it.quantity);
      }
      if (p.reserved && p.reserved[it.warehouseKey] !== undefined) {
        p.reserved[it.warehouseKey] = Math.max(0, p.reserved[it.warehouseKey] - it.quantity);
      }
    }
  });

  ord.status = "Dispatched";
  closeOrderDetailModal();
  render();
  renderWarehouseView();
  renderOrdersView();

  showToast(`✅ Objednávka ${ord.orderNumber} byla úspěšně EXPEDOVÁNA ze skladů a položky odepsány ze stavu zásob.`, "success");
};

window.cancelOrder = function(orderId) {
  const ord = orders.find(item => item.id === orderId);
  if (!ord || ord.status !== "Confirmed") return;

  if (confirm(`Opravdu chcete stornovat objednávku ${ord.orderNumber}? Rezervované zásoby budou vráceny do volného stavu.`)) {
    // Vrácení rezervace zpět
    ord.items.forEach(it => {
      const p = products.find(prod => prod.id === it.productId);
      if (p && p.reserved && p.reserved[it.warehouseKey] !== undefined) {
        p.reserved[it.warehouseKey] = Math.max(0, p.reserved[it.warehouseKey] - it.quantity);
      }
    });

    ord.status = "Cancelled";
    closeOrderDetailModal();
    render();
    renderWarehouseView();
    renderOrdersView();

    showToast(`Objednávka ${ord.orderNumber} byla STORNOVÁNA a rezervované zásoby uvolněny.`, "warning");
  }
};

// ===================================================================
// MEZISKLADOVÝ PŘEVOD ZÁSOB (TRANSFER)
// ===================================================================
window.openTransferModal = function(productId = null, fromWhKey = null) {
  if (!transferModal) return;

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
    const otherWh = warehouses.find(w => w.key !== fromWhKey);
    if (otherWh) transferToSelect.value = otherWh.key;
  }

  transferQuantityInput.value = "1";
  updateTransferAvailabilityHint();

  transferModal.classList.add("active");
};

function closeTransferModal() {
  if (transferModal) transferModal.classList.remove("active");
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

  p.stocks[fromWh] -= qty;
  p.stocks[toWh] = (p.stocks[toWh] || 0) + qty;

  const fromObj = warehouses.find(w => w.key === fromWh);
  const toObj = warehouses.find(w => w.key === toWh);

  closeTransferModal();
  render();
  renderWarehouseView();
  renderOrdersView();

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
  renderOrdersView();
}

window.deleteProduct = function(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  if (confirm(`Opravdu chcete vyřadit produkt "${p.name}" ze systému?`)) {
    products = products.filter(item => item.id !== id);
    showToast(`Produkt ${p.name} byl vyřazen.`, "warning");
    render();
    renderWarehouseView();
    renderOrdersView();
  }
};

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
  renderOrdersView();
};

// Simulace zákaznického nákupu - generuje reálnou objednávku v systému
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
    let selectedWarehouseKey = "praha";
    if (targetProduct.stocks.brno > targetProduct.stocks.praha && targetProduct.stocks.brno >= targetProduct.stocks.ostrava) {
      selectedWarehouseKey = "brno";
    } else if (targetProduct.stocks.ostrava > targetProduct.stocks.praha) {
      selectedWarehouseKey = "ostrava";
    }

    const whObj = warehouses.find(w => w.key === selectedWarehouseKey);

    // Zarezervovat položku
    if (!targetProduct.reserved) targetProduct.reserved = { praha: 0, brno: 0, ostrava: 0 };
    targetProduct.reserved[selectedWarehouseKey] = (targetProduct.reserved[selectedWarehouseKey] || 0) + requestedPieces;

    const randomCust = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
    const orderNumber = "ORD-2026-" + Math.floor(1000 + Math.random() * 9000);
    const totalPrice = targetProduct.price * requestedPieces;

    const newOrder = {
      id: "ord-" + Date.now(),
      orderNumber,
      customerId: randomCust.id,
      customerName: randomCust.fullName,
      customerEmail: randomCust.email,
      customerPhone: randomCust.phone,
      customerAddress: randomCust.address,
      status: "Confirmed",
      createdAt: new Date().toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" }),
      totalPrice,
      items: [
        {
          id: "item-" + Date.now(),
          productId: targetProduct.id,
          productSku: targetProduct.sku,
          productName: targetProduct.name,
          warehouseKey: selectedWarehouseKey,
          warehouseName: whObj.name,
          quantity: requestedPieces,
          unitPrice: targetProduct.price
        }
      ]
    };

    orders.unshift(newOrder);

    render();
    renderWarehouseView();
    renderOrdersView();

    showToast(
      `✅ Objednávka ${orderNumber} POTVRZENA: 2x "${targetProduct.name}" (${totalPrice.toLocaleString("cs-CZ")} Kč). Položky byly zarezervovány k expedici ze: ${whObj.name}.`,
      "success"
    );
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
