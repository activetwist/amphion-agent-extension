const state = {
  data: null,
  charts: [],
  selectedChartId: "",
  filters: {
    milestoneId: "",
    search: "",
  },
  dragCardId: "",
  currentView: (() => {
    const saved = localStorage.getItem("mcd_current_view");
    return saved === "wiki" ? "board" : (saved || "board");
  })(),
  lastVersion: null,
  pollInterval: null,
};

const el = {
  boardList: document.querySelector("#boardList"),
  milestoneProgress: document.querySelector("#milestoneProgress"),
  kanbanColumns: document.querySelector("#kanbanColumns"),
  boardName: document.querySelector("#boardName"),
  boardDescription: document.querySelector("#boardDescription"),
  milestoneFilter: document.querySelector("#milestoneFilter"),
  searchInput: document.querySelector("#searchInput"),
  navTabs: document.querySelectorAll(".nav-tab"),
  btnNewBoard: document.querySelector("#btnNewBoard"),
  btnCloneBoard: document.querySelector("#btnCloneBoard"),
  btnExportBoard: document.querySelector("#btnExportBoard"),
  btnImportBoard: document.querySelector("#btnImportBoard"),
  btnReloadState: document.querySelector("#btnReloadState"),

  dashboardView: document.querySelector("#dashboardView"),
  chartsView: document.querySelector("#chartsView"),
  boardView: document.querySelector("#boardView"),
  guideView: document.querySelector("#guideView"),
  guideContent: document.querySelector("#guideContent"),
  dashboardPhase: document.querySelector("#dashboardPhase"),
  dashboardBurndown: document.querySelector("#dashboardBurndown"),
  dashboardBlockers: document.querySelector("#dashboardBlockers"),
  dashboardMetrics: document.querySelector("#dashboardMetrics"),
  dashboardGitLog: document.querySelector("#dashboardGitLog"),
  docDialog: document.querySelector("#docDialog"),
  docDialogTitle: document.querySelector("#docDialogTitle"),
  docDialogContent: document.querySelector("#docDialogContent"),
  chartsList: document.querySelector("#chartsList"),
  chartsListEmpty: document.querySelector("#chartsListEmpty"),
  chartsPanel: document.querySelector("#chartsPanel"),
  chartsPanelTitle: document.querySelector("#chartsPanelTitle"),
  chartsPanelContent: document.querySelector("#chartsPanelContent"),
  btnCloseChartsPanel: document.querySelector("#btnCloseChartsPanel"),

  importFile: document.querySelector("#importFile"),
  btnSaveBoard: document.querySelector("#btnSaveBoard"),
  btnDeleteBoard: document.querySelector("#btnDeleteBoard"),
  btnAddCard: document.querySelector("#btnAddCard"),
  btnAddMilestone: document.querySelector("#btnAddMilestone"),
  btnAddList: document.querySelector("#btnAddList"),
  cardDialog: document.querySelector("#cardDialog"),
  cardDialogTitle: document.querySelector("#cardDialogTitle"),
  cardDialogIssueNumber: document.querySelector("#cardDialogIssueNumber"),
  cardForm: document.querySelector("#cardForm"),
  cardId: document.querySelector("#cardId"),
  cardTitle: document.querySelector("#cardTitle"),
  cardMilestone: document.querySelector("#cardMilestone"),
  cardPriority: document.querySelector("#cardPriority"),
  cardList: document.querySelector("#cardList"),
  cardTargetDate: document.querySelector("#cardTargetDate"),
  cardOwner: document.querySelector("#cardOwner"),
  cardDescription: document.querySelector("#cardDescription"),
  cardAcceptance: document.querySelector("#cardAcceptance"),
  btnDeleteCard: document.querySelector("#btnDeleteCard"),
  btnCancelCard: document.querySelector("#btnCancelCard"),
  cardTemplate: document.querySelector("#cardTemplate"),
  whyMcdDialog: document.querySelector("#whyMcdDialog"),
  btnWhyMcd: document.querySelector("#btnWhyMcd"),
  btnThemeToggle: document.querySelector("#btnThemeToggle"),

  btnToggleSidebar: document.querySelector("#btnToggleSidebar"),
};

async function api(path, method = "GET", body = null) {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    const reason = payload.error || `Request failed: ${response.status}`;
    throw new Error(reason);
  }
  return payload;
}

function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function configureMermaidTheme() {
  if (!window.mermaid) return;
  const isLight = getCurrentTheme() === "light";
  window.mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: isLight
      ? {
        background: "#ffffff",
        primaryTextColor: "#0f172a",
        secondaryTextColor: "#334155",
        lineColor: "#475569",
        primaryColor: "#f8fafc",
        primaryBorderColor: "#94a3b8",
        clusterBorder: "#94a3b8",
      }
      : {
        background: "#0f2131",
        primaryTextColor: "#e9f5ff",
        secondaryTextColor: "#c5deef",
        lineColor: "#8bb4cf",
        primaryColor: "#13283a",
        primaryBorderColor: "#5a7d97",
        clusterBorder: "#5a7d97",
      },
  });
}

const MERMAID_VIEWPORT_CLASS = "mcd-mermaid-viewport";
const MERMAID_CONTROLS_CLASS = "mcd-mermaid-controls";
const MERMAID_MIN_SCALE = 0.4;
const MERMAID_MAX_SCALE = 3;
const MERMAID_BUTTON_ZOOM_FACTOR = 1.18;
const MERMAID_WHEEL_SENSITIVITY = 0.0014;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function applyMermaidTransform(controller) {
  const svg = controller.svg;
  if (!svg || !svg.isConnected) return;
  svg.style.transformOrigin = "0 0";
  svg.style.transform = `translate(${controller.tx}px, ${controller.ty}px) scale(${controller.scale})`;
}

function mermaidZoomAtPoint(controller, host, x, y, nextScale) {
  const targetScale = clamp(nextScale, MERMAID_MIN_SCALE, MERMAID_MAX_SCALE);
  if (Math.abs(targetScale - controller.scale) < 0.0001) return;
  const localX = (x - controller.tx) / controller.scale;
  const localY = (y - controller.ty) / controller.scale;
  controller.scale = targetScale;
  controller.tx = x - localX * targetScale;
  controller.ty = y - localY * targetScale;
  applyMermaidTransform(controller);
  host.dataset.mcdScale = targetScale.toFixed(2);
}

function resetMermaidTransform(controller, host) {
  controller.scale = 1;
  controller.tx = 0;
  controller.ty = 0;
  applyMermaidTransform(controller);
  host.dataset.mcdScale = "1.00";
}

function ensureMermaidControls(host, controller) {
  let controls = host.querySelector(`:scope > .${MERMAID_CONTROLS_CLASS}`);
  if (controls) return;

  controls = document.createElement("div");
  controls.className = MERMAID_CONTROLS_CLASS;
  controls.innerHTML = `
    <button type="button" data-mermaid-control="zoom-out" aria-label="Zoom out">-</button>
    <button type="button" data-mermaid-control="reset" aria-label="Reset zoom">Reset</button>
    <button type="button" data-mermaid-control="zoom-in" aria-label="Zoom in">+</button>
  `;

  controls.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mermaid-control]");
    if (!button || !controller.svg || !controller.svg.isConnected) return;
    const rect = host.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const action = button.dataset.mermaidControl;

    if (action === "zoom-in") {
      mermaidZoomAtPoint(controller, host, centerX, centerY, controller.scale * MERMAID_BUTTON_ZOOM_FACTOR);
      return;
    }
    if (action === "zoom-out") {
      mermaidZoomAtPoint(controller, host, centerX, centerY, controller.scale / MERMAID_BUTTON_ZOOM_FACTOR);
      return;
    }
    resetMermaidTransform(controller, host);
  });

  host.appendChild(controls);
}

function bindMermaidInteractions(host, controller) {
  const state = {
    pointerId: null,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
  };

  host.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (event.target.closest(`.${MERMAID_CONTROLS_CLASS}`)) return;
    if (!controller.svg || !controller.svg.isConnected) return;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.startTx = controller.tx;
    state.startTy = controller.ty;
    host.classList.add("is-panning");
    if (host.setPointerCapture) host.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  host.addEventListener("pointermove", (event) => {
    if (state.pointerId === null || event.pointerId !== state.pointerId) return;
    controller.tx = state.startTx + (event.clientX - state.startX);
    controller.ty = state.startTy + (event.clientY - state.startY);
    applyMermaidTransform(controller);
  });

  const endPan = (event) => {
    if (state.pointerId === null || event.pointerId !== state.pointerId) return;
    if (host.hasPointerCapture && host.hasPointerCapture(event.pointerId)) {
      host.releasePointerCapture(event.pointerId);
    }
    state.pointerId = null;
    host.classList.remove("is-panning");
  };

  host.addEventListener("pointerup", endPan);
  host.addEventListener("pointercancel", endPan);
  host.addEventListener("lostpointercapture", () => {
    state.pointerId = null;
    host.classList.remove("is-panning");
  });

  host.addEventListener(
    "wheel",
    (event) => {
      if (event.target.closest(`.${MERMAID_CONTROLS_CLASS}`)) return;
      if (!controller.svg || !controller.svg.isConnected) return;
      const rect = host.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const zoomFactor = Math.exp(-event.deltaY * MERMAID_WHEEL_SENSITIVITY);
      mermaidZoomAtPoint(controller, host, x, y, controller.scale * zoomFactor);
      event.preventDefault();
    },
    { passive: false }
  );
}

function attachMermaidPanZoom(container) {
  if (!container) return;
  const svgNodes = container.querySelectorAll(".language-mermaid svg, .mermaid svg, svg[id^='mermaid-']");
  svgNodes.forEach((svg) => {
    const host = svg.closest(".language-mermaid, .mermaid") || svg.parentElement;
    if (!host) return;
    host.classList.add(MERMAID_VIEWPORT_CLASS);

    if (host.__mcdMermaidController) {
      host.__mcdMermaidController.svg = svg;
      applyMermaidTransform(host.__mcdMermaidController);
      return;
    }

    const controller = {
      svg,
      scale: 1,
      tx: 0,
      ty: 0,
    };
    host.__mcdMermaidController = controller;
    ensureMermaidControls(host, controller);
    bindMermaidInteractions(host, controller);
    resetMermaidTransform(controller, host);
  });
}

function scheduleMermaidPanZoomAttach(container) {
  if (!container) return;
  requestAnimationFrame(() => attachMermaidPanZoom(container));
}

function renderMermaidBlocks(container) {
  if (!window.mermaid || !container) return;
  const nodes = container.querySelectorAll(".language-mermaid");
  if (!nodes.length) return;
  configureMermaidTheme();
  nodes.forEach((node) => node.removeAttribute("data-processed"));
  const attachInteractions = () => scheduleMermaidPanZoomAttach(container);
  if (typeof window.mermaid.run === "function") {
    const renderPromise = window.mermaid.run({ nodes });
    if (renderPromise && typeof renderPromise.then === "function") {
      renderPromise.then(attachInteractions).catch((error) => {
        console.warn("Mermaid render failed:", error);
      });
    } else {
      attachInteractions();
    }
  } else {
    window.mermaid.init(undefined, nodes);
    attachInteractions();
  }
}

function loadChartsFromState() {
  const raw = state.data && Array.isArray(state.data.charts) ? state.data.charts : [];
  state.charts = raw
    .filter((item) => item && typeof item.id === "string" && typeof item.title === "string")
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      markdown: item.markdown || "",
    }));
}

function setChartsPanelOpen(isOpen) {
  if (!el.chartsPanel) return;
  el.chartsPanel.classList.toggle("is-open", isOpen);
}

function renderChartsPreview() {
  const selected = state.charts.find((item) => item.id === state.selectedChartId) || null;
  if (!selected) {
    if (el.chartsPanelTitle) el.chartsPanelTitle.textContent = "Chart Preview";
    if (el.chartsPanelContent) {
      el.chartsPanelContent.innerHTML = "Select a chart from the left to preview it.";
    }
    setChartsPanelOpen(false);
    return;
  }

  if (el.chartsPanelTitle) el.chartsPanelTitle.textContent = selected.title;
  if (el.chartsPanelContent) {
    if (window.marked && selected.markdown) {
      el.chartsPanelContent.innerHTML = window.marked.parse(selected.markdown);
      renderMermaidBlocks(el.chartsPanelContent);
    } else {
      const desc = selected.description || "No chart preview content available.";
      el.chartsPanelContent.textContent = desc;
    }
  }
  setChartsPanelOpen(true);
}

function renderCharts() {
  if (!el.chartsList || !el.chartsListEmpty) return;
  el.chartsList.innerHTML = "";

  if (!state.charts.length) {
    el.chartsListEmpty.style.display = "block";
    state.selectedChartId = "";
    renderChartsPreview();
    return;
  }

  el.chartsListEmpty.style.display = "none";
  for (const chart of state.charts) {
    const button = document.createElement("button");
    button.className = `chart-item ${chart.id === state.selectedChartId ? "active" : ""}`;
    button.type = "button";
    button.dataset.chartId = chart.id;
    button.innerHTML = `<strong>${chart.title}</strong><span>${chart.description || "Chart artifact"}</span>`;
    button.addEventListener("click", () => {
      state.selectedChartId = chart.id;
      renderCharts();
    });
    el.chartsList.appendChild(button);
  }

  renderChartsPreview();
}

function getActiveBoard() {
  if (!state.data) return null;
  return state.data.boards.find((item) => item.id === state.data.activeBoardId) || null;
}

function sorted(items) {
  return [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function getListKeyMap(board) {
  const map = new Map();
  board.lists.forEach((item) => map.set(item.id, item.key || ""));
  return map;
}

function milestoneTitle(board, milestoneId) {
  const item = board.milestones.find((ms) => ms.id === milestoneId);
  return item ? item.title : "No milestone";
}

function formatDate(value) {
  if (!value) return "";
  return value;
}

function priorityClass(priority) {
  return `priority-${String(priority || "P2").toLowerCase()}`;
}

function cardMatchesFilter(board, card) {
  if (state.filters.milestoneId && card.milestoneId !== state.filters.milestoneId) {
    return false;
  }

  const query = state.filters.search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    card.title,
    card.description,
    card.acceptance,
    card.owner,
    milestoneTitle(board, card.milestoneId),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function renderBoardList() {
  const activeBoard = getActiveBoard();
  el.boardList.innerHTML = "";

  for (const board of state.data.boards) {
    const button = document.createElement("button");
    button.className = `board-item ${activeBoard && board.id === activeBoard.id ? "active" : ""}`;
    button.textContent = board.name;
    button.addEventListener("click", async () => {
      await api(`/api/boards/${board.id}/activate`, "POST", {});
      await refresh();
    });
    el.boardList.appendChild(button);
  }
}

function renderBoardMeta() {
  const board = getActiveBoard();
  if (!board) return;
  el.boardName.value = board.name;
  el.boardDescription.value = board.description || "";
}

function renderMilestoneFilter() {
  const board = getActiveBoard();
  if (!board) return;

  el.milestoneFilter.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = "All";
  el.milestoneFilter.appendChild(all);

  for (const milestone of sorted(board.milestones)) {
    const option = document.createElement("option");
    option.value = milestone.id;
    option.textContent = milestone.title;
    if (state.filters.milestoneId === milestone.id) {
      option.selected = true;
    }
    el.milestoneFilter.appendChild(option);
  }
}

function renderMilestoneProgress() {
  const board = getActiveBoard();
  if (!board) return;

  const listKeyMap = getListKeyMap(board);
  const doneListIds = board.lists.filter((item) => item.key === "done").map((item) => item.id);

  el.milestoneProgress.innerHTML = "";

  if (!board.milestones.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No milestones yet. Add one from toolbar.";
    el.milestoneProgress.appendChild(empty);
    return;
  }

  for (const milestone of sorted(board.milestones)) {
    const cards = board.cards.filter((card) => card.milestoneId === milestone.id);
    const done = cards.filter((card) => doneListIds.includes(card.listId)).length;
    const total = cards.length || 0;
    const ratio = total === 0 ? 0 : Math.round((done / total) * 100);

    const wrapper = document.createElement("div");
    wrapper.className = "milestone-item";

    const header = document.createElement("header");
    const name = document.createElement("span");
    name.textContent = milestone.title;
    const score = document.createElement("span");
    score.textContent = `${done}/${total}`;
    header.appendChild(name);
    header.appendChild(score);

    const track = document.createElement("div");
    track.className = "progress-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    fill.style.width = `${ratio}%`;
    track.appendChild(fill);

    wrapper.appendChild(header);
    wrapper.appendChild(track);
    el.milestoneProgress.appendChild(wrapper);
  }
}

function createCardNode(board, card) {
  const fragment = el.cardTemplate.content.cloneNode(true);
  const node = fragment.querySelector(".card");

  node.dataset.cardId = card.id;
  node.draggable = true;

  const milestone = node.querySelector(".milestone-badge");
  milestone.textContent = milestoneTitle(board, card.milestoneId);

  const priority = node.querySelector(".priority-badge");
  priority.textContent = card.priority || "P2";
  priority.classList.add(priorityClass(card.priority));

  node.querySelector("h4").textContent = card.title;
  node.querySelector(".description").textContent = card.description || "No description";
  node.querySelector(".issue-badge").textContent = card.issueNumber || "—";
  node.querySelector(".owner").textContent = card.owner ? `@${card.owner}` : "";
  node.querySelector(".target-date").textContent = card.targetDate ? `Due ${formatDate(card.targetDate)}` : "";

  node.addEventListener("dragstart", (event) => {
    state.dragCardId = card.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.id);
  });

  node.addEventListener("click", () => {
    openCardDialog(card.id);
  });

  return fragment;
}

function renderColumns() {
  const board = getActiveBoard();
  if (!board) return;

  el.kanbanColumns.innerHTML = "";

  const orderedLists = sorted(board.lists);
  for (const list of orderedLists) {
    const column = document.createElement("section");
    column.className = "column";
    column.dataset.listId = list.id;

    const header = document.createElement("header");
    const title = document.createElement("h3");
    title.textContent = list.title;
    title.title = "Double-click to rename column";
    title.addEventListener("dblclick", async () => {
      const next = prompt("Rename column", list.title);
      if (!next || !next.trim()) return;
      await api(`/api/lists/${list.id}`, "PATCH", { title: next.trim() });
      await refresh();
    });

    const count = document.createElement("span");
    const listCards = sorted(board.cards.filter((card) => card.listId === list.id));
    count.textContent = `${listCards.length}`;

    header.appendChild(title);
    header.appendChild(count);

    const body = document.createElement("div");
    body.className = "column-body";
    body.dataset.listId = list.id;

    body.addEventListener("dragover", (event) => {
      event.preventDefault();
      body.classList.add("drag-target");
    });

    body.addEventListener("dragleave", () => {
      body.classList.remove("drag-target");
    });

    body.addEventListener("drop", async (event) => {
      event.preventDefault();
      body.classList.remove("drag-target");
      const cardId = event.dataTransfer.getData("text/plain") || state.dragCardId;
      if (!cardId) return;
      await api(`/api/cards/${cardId}/move`, "POST", { listId: list.id });
      await refresh();
    });

    const visibleCards = listCards.filter((card) => cardMatchesFilter(board, card));
    if (!visibleCards.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No tasks in this column";
      body.appendChild(empty);
    } else {
      for (const card of visibleCards) {
        body.appendChild(createCardNode(board, card));
      }
    }

    const footer = document.createElement("footer");
    const addButton = document.createElement("button");
    addButton.className = "btn";
    addButton.textContent = "+ Add Task";
    addButton.addEventListener("click", () => openCardDialog("", list.id));
    footer.appendChild(addButton);

    column.appendChild(header);
    column.appendChild(body);
    column.appendChild(footer);
    el.kanbanColumns.appendChild(column);
  }
}

function populateCardSelects(board) {
  el.cardMilestone.innerHTML = "";
  const noneOption = document.createElement("option");
  noneOption.value = "";
  noneOption.textContent = "No milestone";
  el.cardMilestone.appendChild(noneOption);

  for (const milestone of sorted(board.milestones)) {
    const option = document.createElement("option");
    option.value = milestone.id;
    option.textContent = milestone.title;
    el.cardMilestone.appendChild(option);
  }

  el.cardList.innerHTML = "";
  for (const list of sorted(board.lists)) {
    const option = document.createElement("option");
    option.value = list.id;
    option.textContent = list.title;
    el.cardList.appendChild(option);
  }
}

function openCardDialog(cardId = "", defaultListId = "") {
  const board = getActiveBoard();
  if (!board) return;
  populateCardSelects(board);

  if (cardId) {
    const card = board.cards.find((item) => item.id === cardId);
    if (!card) return;

    el.cardDialogTitle.textContent = "Edit Task";
    el.cardId.value = card.id;
    el.cardTitle.value = card.title;
    el.cardMilestone.value = card.milestoneId || "";
    el.cardPriority.value = card.priority || "P2";
    el.cardList.value = card.listId;
    el.cardTargetDate.value = card.targetDate || "";
    el.cardOwner.value = card.owner || "";
    el.cardDescription.value = card.description || "";
    el.cardAcceptance.value = card.acceptance || "";
    if (el.cardDialogIssueNumber) {
      el.cardDialogIssueNumber.textContent = card.issueNumber || "—";
      el.cardDialogIssueNumber.classList.remove("is-hidden");
    }
    el.btnDeleteCard.style.display = "inline-block";
  } else {
    const fallbackListId = defaultListId || sorted(board.lists)[0]?.id || "";
    el.cardDialogTitle.textContent = "New Task";
    el.cardId.value = "";
    el.cardTitle.value = "";
    el.cardMilestone.value = "";
    el.cardPriority.value = "P1";
    el.cardList.value = fallbackListId;
    el.cardTargetDate.value = "";
    el.cardOwner.value = "";
    el.cardDescription.value = "";
    el.cardAcceptance.value = "";
    if (el.cardDialogIssueNumber) {
      el.cardDialogIssueNumber.textContent = "—";
      el.cardDialogIssueNumber.classList.add("is-hidden");
    }
    el.btnDeleteCard.style.display = "none";
  }

  el.cardDialog.showModal();
}

async function saveCardFromDialog() {
  const board = getActiveBoard();
  if (!board) return;

  const payload = {
    boardId: board.id,
    listId: el.cardList.value,
    title: el.cardTitle.value.trim(),
    milestoneId: el.cardMilestone.value,
    priority: el.cardPriority.value,
    targetDate: el.cardTargetDate.value,
    owner: el.cardOwner.value.trim(),
    description: el.cardDescription.value.trim(),
    acceptance: el.cardAcceptance.value.trim(),
  };

  if (!payload.title) {
    alert("Task title is required.");
    return;
  }

  if (el.cardId.value) {
    await api(`/api/cards/${el.cardId.value}`, "PATCH", payload);
  } else {
    await api("/api/cards", "POST", payload);
  }

  el.cardDialog.close();
  await refresh();
}

async function refresh() {
  const payload = await api("/api/state");
  state.data = payload.state;

  loadChartsFromState();
  if (state.selectedChartId && !state.charts.some((item) => item.id === state.selectedChartId)) {
    state.selectedChartId = "";
  }

  try {
    const vRes = await api("/api/state/version");
    state.lastVersion = vRes.version;
  } catch (e) { }

  render();
}

function render() {
  const board = getActiveBoard();
  if (!board) return;
  renderBoardList();
  renderBoardMeta();
  renderMilestoneProgress();

  // Update Tab UI State
  el.navTabs.forEach(tab => {
    tab.classList.toggle("active", tab.dataset.view === state.currentView);
  });

  el.boardView.style.display = "none";
  el.dashboardView.style.display = "none";
  el.chartsView.style.display = "none";
  el.guideView.style.display = "none";

  if (state.currentView === "dashboard") {
    el.dashboardView.style.display = "block";
    renderDashboard();
  } else if (state.currentView === "charts") {
    el.chartsView.style.display = "grid";
    renderCharts();
  } else if (state.currentView === "guide") {
    el.guideView.style.display = "block";
    renderGuide();
  } else {
    el.boardView.style.display = "grid";
    renderMilestoneFilter();
    renderColumns();
  }
}

async function renderGuide() {
  try {
    const res = await api("/api/docs/playbook");
    if (window.marked) {
      el.guideContent.innerHTML = window.marked.parse(res.content);
      renderMermaidBlocks(el.guideContent);
    } else {
      el.guideContent.innerHTML = `<pre style="white-space:pre-wrap; font-family:var(--font);">${res.content}</pre>`;
    }
  } catch (e) {
    el.guideContent.innerHTML = `<span style="color:var(--danger)">Failed to load playbook: ${e.message}</span>`;
  }
}

async function renderDashboard() {
  const board = getActiveBoard();
  if (!board) return;

  // 1. Vitals
  const activeLists = board.lists.filter(l => ["active", "qa"].includes(l.key));
  const blockedList = board.lists.find(l => l.key === "blocked");

  let phaseText = "Planning / Backlog";
  if (board.cards.some(c => activeLists.some(l => l.id === c.listId))) {
    phaseText = "Execute";
  } else if (board.cards.some(c => blockedList && c.listId === blockedList.id)) {
    phaseText = "Blocked";
  } else if (board.cards.every(c => board.lists.find(l => l.id === c.listId)?.key === "done")) {
    phaseText = "Closeout Ready";
  }
  el.dashboardPhase.textContent = `Active Phase: ${phaseText}`;

  // Burn-down (Current Milestone)
  const ms = board.milestones[0];
  if (ms) {
    const msCards = board.cards.filter(c => c.milestoneId === ms.id);
    const doneCards = msCards.filter(c => board.lists.find(l => l.id === c.listId)?.key === "done").length;
    el.dashboardBurndown.innerHTML = `<strong>${ms.title}</strong><br/>${doneCards} / ${msCards.length} tasks completed`;
  } else {
    el.dashboardBurndown.textContent = "No active milestone";
  }

  // Blockers
  const blockedCards = board.cards.filter(c => blockedList && c.listId === blockedList.id);
  if (blockedCards.length > 0) {
    el.dashboardBlockers.innerHTML = blockedCards.map(c => `• ${c.title}`).join("<br/>");
  } else {
    el.dashboardBlockers.textContent = "None";
  }

  // Metrics
  el.dashboardMetrics.textContent = `Project Type: ${board.projectType || 'standard'}`;

  // Traceability
  try {
    const logRes = await api("/api/git/log");
    el.dashboardGitLog.textContent = logRes.log || "No git history found.";
  } catch (e) {
    el.dashboardGitLog.textContent = "Could not load git history.";
  }
}

async function showDocument(docId, title) {
  el.docDialogTitle.textContent = title;
  el.docDialogContent.innerHTML = "<em>Loading...</em>";
  el.docDialog.showModal();

  try {
    const res = await api(`/api/docs/${docId}`);
    if (window.marked) {
      el.docDialogContent.innerHTML = window.marked.parse(res.content);
      renderMermaidBlocks(el.docDialogContent);
    } else {
      el.docDialogContent.innerHTML = `<pre style="white-space:pre-wrap; font-family:var(--font);">${res.content}</pre>`;
    }
  } catch (e) {
    el.docDialogContent.innerHTML = `<span style="color:var(--danger)">Failed to load document: ${e.message}</span>`;
  }
}


function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function registerEvents() {
  el.navTabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      const nextView = e.target.dataset.view;
      state.currentView = nextView === "wiki" ? "board" : nextView;
      localStorage.setItem("mcd_current_view", state.currentView);
      document.documentElement.setAttribute('data-current-view', state.currentView);
      render();
    });
  });

  document.querySelectorAll(".btn-doc").forEach(btn => {
    btn.addEventListener("click", (e) => {
      showDocument(e.target.dataset.doc, e.target.textContent);
    });
  });

  el.docDialog.querySelector("button[value='close']").addEventListener("click", (e) => {
    e.preventDefault();
    el.docDialog.close();
  });

  el.btnWhyMcd.addEventListener("click", () => {
    el.whyMcdDialog.showModal();
  });

  el.whyMcdDialog.querySelector("button[value='close']").addEventListener("click", (e) => {
    e.preventDefault();
    el.whyMcdDialog.close();
  });

  if (el.btnNewBoard) el.btnNewBoard.onclick = createNewBoard;

  el.btnCloneBoard.addEventListener("click", async () => {
    const board = getActiveBoard();
    if (!board) return;
    await api(`/api/boards/${board.id}/clone`, "POST", {});
    await refresh();
  });

  el.btnReloadState.addEventListener("click", async () => {
    await api("/api/reload", "POST", {});
    await refresh();
  });

  el.btnSaveBoard.addEventListener("click", async () => {
    const board = getActiveBoard();
    if (!board) return;
    await api(`/api/boards/${board.id}`, "PATCH", {
      name: el.boardName.value.trim(),
      description: el.boardDescription.value.trim(),
    });
    await refresh();
  });

  el.btnDeleteBoard.addEventListener("click", async () => {
    const board = getActiveBoard();
    if (!board) return;
    if (!confirm(`Delete board \"${board.name}\"?`)) return;
    await api(`/api/boards/${board.id}`, "DELETE");
    await refresh();
  });

  el.btnAddMilestone.addEventListener("click", async () => {
    const board = getActiveBoard();
    if (!board) return;
    const title = prompt("Milestone title");
    if (!title || !title.trim()) return;
    await api("/api/milestones", "POST", {
      boardId: board.id,
      title: title.trim(),
    });
    await refresh();
  });

  el.btnAddList.addEventListener("click", async () => {
    const board = getActiveBoard();
    if (!board) return;
    const title = prompt("Column title");
    if (!title || !title.trim()) return;
    await api("/api/lists", "POST", {
      boardId: board.id,
      title: title.trim(),
    });
    await refresh();
  });

  el.btnAddCard.addEventListener("click", () => {
    const board = getActiveBoard();
    if (!board) return;
    const backlog = sorted(board.lists)[0]?.id;
    openCardDialog("", backlog);
  });

  el.btnExportBoard.addEventListener("click", () => {
    const board = getActiveBoard();
    if (!board) return;
    const safeName = board.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    download(`${safeName}.json`, JSON.stringify(board, null, 2));
  });

  el.btnImportBoard.addEventListener("click", () => {
    el.importFile.click();
  });



  el.importFile.addEventListener("change", async () => {
    const file = el.importFile.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const board = JSON.parse(raw);
      await api("/api/boards/import", "POST", { board });
      await refresh();
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    } finally {
      el.importFile.value = "";
    }
  });

  el.milestoneFilter.addEventListener("change", () => {
    state.filters.milestoneId = el.milestoneFilter.value;
    renderColumns();
  });

  el.searchInput.addEventListener("input", () => {
    state.filters.search = el.searchInput.value;
    renderColumns();
  });

  el.cardForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveCardFromDialog();
    } catch (error) {
      alert(error.message);
    }
  });

  el.btnCancelCard.addEventListener("click", () => {
    el.cardDialog.close();
  });

  el.btnDeleteCard.addEventListener("click", async () => {
    if (!el.cardId.value) return;
    if (!confirm("Delete this task?")) return;
    await api(`/api/cards/${el.cardId.value}`, "DELETE");
    el.cardDialog.close();
    await refresh();
  });

  if (el.btnCloseChartsPanel) {
    el.btnCloseChartsPanel.addEventListener("click", () => {
      state.selectedChartId = "";
      renderCharts();
    });
  }

  if (el.btnThemeToggle) el.btnThemeToggle.onclick = toggleTheme;
  if (el.btnToggleSidebar) el.btnToggleSidebar.onclick = toggleSidebar;
  if (el.btnNewBoard) el.btnNewBoard.onclick = createNewBoard;
}

function startPolling() {
  if (state.pollInterval) clearInterval(state.pollInterval);
  state.pollInterval = setInterval(async () => {
    try {
      const vRes = await api("/api/state/version");
      if (vRes.ok && vRes.version && state.lastVersion && vRes.version !== state.lastVersion) {
        console.log("State mutation detected. Hot reloading...");
        await refresh();
      }
    } catch (e) {
      // fail silently
    }
  }, 2000);
}

async function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("mcd_theme", next);
  el.btnThemeToggle.textContent = next === "light" ? "Dark Mode" : "Light Mode";

  configureMermaidTheme();
  if (state.currentView === "guide") {
    renderMermaidBlocks(el.guideContent);
  }
  if (state.currentView === "charts") {
    renderChartsPreview();
  }
  if (el.docDialog && el.docDialog.open) {
    renderMermaidBlocks(el.docDialogContent);
  }
}

async function createNewBoard() {
  const name = prompt("Board name");
  if (!name || !name.trim()) return;
  const useTemplate = confirm("Seed with launch template?\nOK = yes, Cancel = empty board");
  await api("/api/boards", "POST", {
    name: name.trim(),
    description: "",
    seedTemplate: useTemplate,
  });
  await refresh();
}

function toggleSidebar() {
  const isCollapsed = document.documentElement.getAttribute("data-sidebar-collapsed") === "true";
  const nextState = !isCollapsed;
  if (nextState) {
    document.documentElement.setAttribute("data-sidebar-collapsed", "true");
    el.btnToggleSidebar.textContent = "»";
  } else {
    document.documentElement.removeAttribute("data-sidebar-collapsed");
    el.btnToggleSidebar.textContent = "«";
  }
  localStorage.setItem("mcd_sidebar_collapsed", nextState);
}

async function bootstrap() {
  registerEvents();
  if (el.btnThemeToggle) {
    const theme = localStorage.getItem("mcd_theme") || "dark";
    el.btnThemeToggle.textContent = theme === "light" ? "Dark Mode" : "Light Mode";
  }
  if (localStorage.getItem("mcd_theme") === "light") {
    el.btnThemeToggle.textContent = "Dark Mode";
  }
  if (localStorage.getItem("mcd_sidebar_collapsed") === "true") {
    el.btnToggleSidebar.textContent = "»";
  }
  configureMermaidTheme();
  try {
    await refresh();
    startPolling();
  } catch (error) {
    alert(`Failed to load board: ${error.message}`);
  }
}

bootstrap();
