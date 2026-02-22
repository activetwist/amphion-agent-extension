const state = {
  data: null,
  filters: {
    milestoneId: "",
    search: "",
  },
  dragCardId: "",
  currentView: localStorage.getItem("mcd_current_view") || "board",
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

  dashboardView: document.querySelector("#dashboardView"),
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

  importFile: document.querySelector("#importFile"),
  btnSaveBoard: document.querySelector("#btnSaveBoard"),
  btnDeleteBoard: document.querySelector("#btnDeleteBoard"),
  btnAddCard: document.querySelector("#btnAddCard"),
  btnAddMilestone: document.querySelector("#btnAddMilestone"),
  btnAddList: document.querySelector("#btnAddList"),
  cardDialog: document.querySelector("#cardDialog"),
  cardDialogTitle: document.querySelector("#cardDialogTitle"),
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
  el.guideView.style.display = "none";

  if (state.currentView === "dashboard") {
    el.dashboardView.style.display = "block";
    renderDashboard();
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
      if (window.mermaid) {
        window.mermaid.init(undefined, el.guideContent.querySelectorAll('.language-mermaid'));
      }
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
      if (window.mermaid) {
        window.mermaid.init(undefined, el.docDialogContent.querySelectorAll('.language-mermaid'));
      }
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
      state.currentView = e.target.dataset.view;
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

  el.btnNewBoard.addEventListener("click", async () => {
    const name = prompt("Board name");
    if (!name || !name.trim()) return;
    const useTemplate = confirm("Seed with launch template?\nOK = yes, Cancel = empty board");
    await api("/api/boards", "POST", {
      name: name.trim(),
      description: "",
      seedTemplate: useTemplate,
    });
    await refresh();
  });

  el.btnCloneBoard.addEventListener("click", async () => {
    const board = getActiveBoard();
    if (!board) return;
    await api(`/api/boards/${board.id}/clone`, "POST", {});
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
}

async function bootstrap() {
  registerEvents();

  const welcomeToast = document.getElementById("mcdWelcomeToast");
  const btnDismissToast = document.getElementById("btnDismissToast");

  if (!localStorage.getItem("mcd_welcome_shown") && welcomeToast) {
    welcomeToast.style.display = "block";

    const dismissToast = () => {
      welcomeToast.style.display = "none";
      localStorage.setItem("mcd_welcome_shown", "true");
    };

    btnDismissToast.addEventListener("click", dismissToast);
    setTimeout(dismissToast, 15000);
  }

  try {
    await refresh();
  } catch (error) {
    alert(`Failed to load board: ${error.message}`);
  }
}

bootstrap();
