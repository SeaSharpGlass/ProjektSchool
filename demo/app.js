/**
 * WarehouseHub - Klientské drátové demo (Jediná entita: Produkt)
 * Demonstrace správy produktů, víceskladového rozpadu a business pravidel
 */

// Výchozí skladová data pro demonstraci
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
    }
  }
];

// Reference na DOM prvky
const tbody = document.getElementById("products-tbody");
const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");
const filterStock = document.getElementById("filter-stock");
const btnResetFilters = document.getElementById("btn-reset-filters");

const kpiTotalProducts = document.getElementById("kpi-total-products");
const kpiTotalStock = document.getElementById("kpi-total-stock");
const kpiLowStock = document.getElementById("kpi-low-stock");
const kpiTotalValue = document.getElementById("kpi-total-value");
const tableStatusText = document.getElementById("table-status-text");
const navCountBadge = document.getElementById("nav-count-badge");

// Modální okno
const productModal = document.getElementById("product-modal");
const modalTitle = document.getElementById("modal-title");
const productForm = document.getElementById("product-form");
const btnOpenCreateModal = document.getElementById("btn-open-create-modal");
const modalBtnClose = document.getElementById("modal-btn-close");
const modalBtnCancel = document.getElementById("modal-btn-cancel");
const btnSimulateOrder = document.getElementById("btn-simulate-order");

// Inicializace po načtení DOM
document.addEventListener("DOMContentLoaded", () => {
  render();
  setupEventListeners();
});

function setupEventListeners() {
  // Filtrování a hledání
  searchInput.addEventListener("input", render);
  filterCategory.addEventListener("change", render);
  filterStock.addEventListener("change", render);

  btnResetFilters.addEventListener("click", () => {
    searchInput.value = "";
    filterCategory.value = "ALL";
    filterStock.value = "ALL";
    render();
    showToast("Filtry byly resetovány", "info");
  });

  // Modální dialog
  btnOpenCreateModal.addEventListener("click", () => openModal());
  modalBtnClose.addEventListener("click", closeModal);
  modalBtnCancel.addEventListener("click", closeModal);

  productModal.addEventListener("click", (e) => {
    if (e.target === productModal) closeModal();
  });

  // Odeslání formuláře
  productForm.addEventListener("submit", handleFormSubmit);

  // Klientská simulace nákupu
  btnSimulateOrder.addEventListener("click", simulateClientOrder);
}

// Výpočet celkového počtu kusů produktu napříč sklady
function getTotalStock(product) {
  return (product.stocks.praha || 0) + (product.stocks.brno || 0) + (product.stocks.ostrava || 0);
}

// Určení stavu dostupnosti
function getStockStatus(totalStock) {
  if (totalStock === 0) {
    return { key: "OUT", label: "Vyprodáno", class: "out-stock" };
  } else if (totalStock <= 10) {
    return { key: "LOW", label: `Dochází (${totalStock} ks)`, class: "low-stock" };
  } else {
    return { key: "IN_STOCK", label: `Skladem (${totalStock} ks)`, class: "in-stock" };
  }
}

// Vykreslení tabulky a aktualizace metrik
function render() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCat = filterCategory.value;
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

    // Filtr skladu
    const matchesStock = selectedStock === "ALL" || status.key === selectedStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Vykreslení řádků
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
            <span class="wh-chip">Praha: <strong>${p.stocks.praha} ks</strong></span>
            <span class="wh-chip">Brno: <strong>${p.stocks.brno} ks</strong></span>
            <span class="wh-chip">Ostrava: <strong>${p.stocks.ostrava} ks</strong></span>
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

  // Aktualizace KPI karet
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

// Otevření modálního dialogu (pro vytvoření nebo editaci)
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
    // Automaticky vygenerovat následující SKU
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

// Uložení produktu z formuláře
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
      stocks: { praha: stockPraha, brno: stockBrno, ostrava: stockOstrava }
    };
    products.unshift(newProduct);
    showToast(`Nový produkt ${name} byl zařazen do katalogu.`, "success");
  }

  closeModal();
  render();
}

// Smazání produktu
window.deleteProduct = function(id) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  if (confirm(`Opravdu chcete vyřadit produkt "${p.name}" ze systému?`)) {
    products = products.filter(item => item.id !== id);
    showToast(`Produkt ${p.name} byl vyřazen.`, "warning");
    render();
  }
};

// Rychlá úprava stavu skladu (+1 ks na sklad Praha)
window.quickAdjustStock = function(id, amount) {
  const p = products.find(item => item.id === id);
  if (!p) return;

  p.stocks.praha = (p.stocks.praha || 0) + amount;
  showToast(`Naskladněn +${amount} ks na Sklad Praha pro: ${p.name}`, "info");
  render();
};

// Simulace zákaznického nákupu - ukázka klientských pravidel
function simulateClientOrder() {
  if (products.length === 0) return;

  // Vybrat náhodný produkt
  const randomIndex = Math.floor(Math.random() * products.length);
  const targetProduct = products[randomIndex];
  const requestedPieces = 2;
  const totalAvailable = getTotalStock(targetProduct);

  if (totalAvailable < requestedPieces) {
    // BUSINESS PRAVIDLO ZADÁNÍ B: Odmítnutí objednávky při nedostatku zásob!
    showToast(
      `❌ Objednávka ODMÍTNUTA! Zákazník požadoval ${requestedPieces}x "${targetProduct.name}", ale skladem je pouze ${totalAvailable} ks. Systém nedovolil vytvořit objednávku bez krytí zásoby.`,
      "danger"
    );
  } else {
    // BUSINESS PRAVIDLO ZADÁNÍ B: Vyskladnění s dohledatelností skladu
    // Zvolit sklad s nejvyšším stavem
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
      `✅ Objednávka ${orderNumber} POTVRZENA: 2x "${targetProduct.name}" (celkem ${(targetProduct.price * 2).toLocaleString("cs-CZ")} Kč). Položky byly úspěšně vyskladněny ze: Sklad ${selectedWarehouse}.`,
      "success"
    );
    render();
  }
}

// Zobrazení plovoucí notifikace (Toast)
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
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

// Ochrana proti XSS
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
