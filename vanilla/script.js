// Dynamic content generator for Siege of Orgrimmar guide website

document.addEventListener("DOMContentLoaded", () => {
  initRaidOverview();
  renderSidebarBosses();
  setupEventListeners();
});

// Render general raid details on startup
function initRaidOverview() {
  document.getElementById("overview-title").textContent = raidOverview.title;
  document.getElementById("overview-description").textContent = raidOverview.description;
  
  const metaGrid = document.getElementById("overview-meta-grid");
  metaGrid.innerHTML = "";
  
  raidOverview.details.forEach(item => {
    const div = document.createElement("div");
    div.className = "meta-item";
    div.innerHTML = `
      <span class="meta-label">${item.label}</span>
      <span class="meta-value">${item.value}</span>
    `;
    metaGrid.appendChild(div);
  });
}

// Group and render bosses in the navigation list
function renderSidebarBosses() {
  const container = document.getElementById("boss-navigation-list");
  container.innerHTML = "";
  
  // Group bosses by zone
  const zones = {};
  bossesData.forEach(boss => {
    if (!zones[boss.zone]) {
      zones[boss.zone] = [];
    }
    zones[boss.zone].push(boss);
  });
  
  // Render groups
  for (const [zoneName, list] of Object.entries(zones)) {
    const title = document.createElement("div");
    title.className = "list-section-title";
    title.textContent = zoneName;
    container.appendChild(title);
    
    list.forEach(boss => {
      const btn = document.createElement("button");
      btn.className = "boss-item";
      btn.dataset.id = boss.id;
      btn.innerHTML = `
        <span class="boss-number">${boss.id}</span>
        <span>${boss.name}</span>
      `;
      btn.addEventListener("click", () => selectBoss(boss.id, btn));
      container.appendChild(btn);
    });
  }
}

// Setup searching and role tabs
function setupEventListeners() {
  // Search box
  const searchInput = document.getElementById("bossSearch");
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const items = document.querySelectorAll("#boss-navigation-list .boss-item");
    const titles = document.querySelectorAll("#boss-navigation-list .list-section-title");
    
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(query)) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
    
    // Hide zone titles if no bosses visible in that zone
    titles.forEach(title => {
      let next = title.nextElementSibling;
      let hasVisible = false;
      while (next && !next.classList.contains("list-section-title")) {
        if (next.style.display !== "none") {
          hasVisible = true;
          break;
        }
        next = next.nextElementSibling;
      }
      title.style.display = hasVisible ? "block" : "none";
    });
  });

  // Role filter buttons
  const tabs = document.querySelectorAll(".role-tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      filterRoleCards(tab.dataset.role);
    });
  });
}

// Click on general info
function showOverview() {
  // Toggle active menu state
  document.querySelectorAll(".boss-item").forEach(item => item.classList.remove("active"));
  document.getElementById("btn-overview").classList.add("active");
  
  // Toggle visible panels
  document.getElementById("raid-overview-panel").style.display = "block";
  document.getElementById("boss-detail-panel").classList.remove("active");
}

// Click on boss
function selectBoss(id, buttonElement) {
  // Toggle active menu state
  document.querySelectorAll(".boss-item").forEach(item => item.classList.remove("active"));
  document.getElementById("btn-overview").classList.remove("active");
  buttonElement.classList.add("active");
  
  // Reset role filter tabs to "All"
  document.querySelectorAll(".role-tab-btn").forEach(t => t.classList.remove("active"));
  document.querySelector('.role-tab-btn[data-role="all"]').classList.add("active");
  
  // Load boss data
  const boss = bossesData.find(b => b.id === id);
  if (!boss) return;
  
  // Toggle visible panels
  document.getElementById("raid-overview-panel").style.display = "none";
  document.getElementById("boss-detail-panel").classList.add("active");
  
  // Render boss details
  document.getElementById("boss-zone").textContent = boss.zone;
  document.getElementById("boss-name").textContent = boss.name;
  document.getElementById("boss-eng-name").textContent = `(${boss.englishName})`;
  document.getElementById("boss-summary").textContent = boss.summary;
  document.getElementById("boss-phases").textContent = boss.criticalPhases;
  
  const videoBtn = document.getElementById("boss-video-btn");
  if (boss.videoLink) {
    videoBtn.href = boss.videoLink;
    videoBtn.style.display = "flex";
  } else {
    videoBtn.style.display = "none";
  }
  
  // Render abilities table
  const tbody = document.getElementById("boss-abilities-body");
  tbody.innerHTML = "";
  boss.abilities.forEach(ability => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="ability-name">${ability.name}</span></td>
      <td><span class="ability-type ${getAbilityClass(ability.type)}">${ability.type.split('/')[0].trim()}</span></td>
      <td>${ability.desc}</td>
    `;
    tbody.appendChild(tr);
  });
  
  // Render role cards
  renderRoleCards(boss);
}

// Helper to color code ability type tags in the table
function getAbilityClass(typeString) {
  const type = typeString.toLowerCase();
  if (type.includes("теневой") || type.includes("тьма") || type.includes("shadow")) return "type-shadow";
  if (type.includes("огненный") || type.includes("огонь") || type.includes("fire")) return "type-fire";
  if (type.includes("физический") || type.includes("физ") || type.includes("phys")) return "type-phys";
  if (type.includes("природный") || type.includes("яды") || type.includes("nature")) return "type-nature";
  if (type.includes("лед") || type.includes("ice")) return "type-ice";
  return "type-mech";
}

// Render check lists for each role
function renderRoleCards(boss) {
  const container = document.getElementById("roles-cards-container");
  container.innerHTML = "";
  
  // SVG Icon definitions
  const svgShield = `<svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>`;
  const svgHeart = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm10 10c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8 8 3.59 8 8zm-7-1h-2V9c0-.55-.45-1-1-1s-1 .45-1 1v2H9c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>`;
  const svgSword = `<svg viewBox="0 0 24 24"><path d="M21.9 2.1a1 1 0 0 0-1.4 0l-5.3 5.3-3.2-3.2a1 1 0 0 0-1.4 0L2.1 12.7a1 1 0 0 0 0 1.4l3.2 3.2-3.2 3.2a1 1 0 0 0 1.4 1.4l3.2-3.2 3.2 3.2a1 1 0 0 0 1.4-1.4L11.1 17.3l5.3-5.3 5.5 5.5a1 1 0 0 0 1.4-1.4l-5.5-5.5 5.3-5.3a1 1 0 0 0 0-1.4z"/></svg>`;
  const svgCrown = `<svg viewBox="0 0 24 24"><path d="M12 2L1 5v3l4.3 1.3L3.2 16H2v2h20v-2h-1.2l-2.1-6.7 4.3-1.3V5L12 2zm4.8 14H7.2l1.9-6 2.9.9 2.9-.9 1.9 6z"/></svg>`;
  const svgCheck = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;

  const roles = [
    { key: "tank", title: "Что делает Танк", css: "card-tank", icon: svgShield, list: boss.tankActions },
    { key: "healer", title: "Что делает Хилер", css: "card-healer", icon: svgHeart, list: boss.healerActions },
    { key: "dps", title: "Что делает ДД", css: "card-dps", icon: svgSword, list: boss.dpsActions },
    { key: "rl", title: "Обратить внимание РЛу", css: "card-rl", icon: svgCrown, list: boss.rlNotes }
  ];

  roles.forEach(role => {
    if (!role.list || role.list.length === 0) return;
    
    const card = document.createElement("div");
    card.className = `role-card ${role.css}`;
    card.dataset.role = role.key;
    
    const header = document.createElement("div");
    header.className = "role-card-header";
    header.innerHTML = `
      <div class="role-icon-box">${role.icon}</div>
      <h3 class="role-card-title">${role.title}</h3>
    `;
    card.appendChild(header);
    
    const ul = document.createElement("ul");
    ul.className = "checklist";
    
    role.list.forEach(task => {
      const li = document.createElement("li");
      li.className = "checklist-item";
      li.innerHTML = `
        ${svgCheck}
        <span>${task}</span>
      `;
      ul.appendChild(li);
    });
    
    card.appendChild(ul);
    container.appendChild(card);
  });
}

// Handles active filtering (showing only Tank cards, only Healer cards, etc.)
function filterRoleCards(role) {
  const cards = document.querySelectorAll(".role-card");
  cards.forEach(card => {
    if (role === "all") {
      card.style.display = "block";
    } else {
      if (card.dataset.role === role) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    }
  });
}
