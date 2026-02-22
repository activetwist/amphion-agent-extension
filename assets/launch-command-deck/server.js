#!/usr/bin/env node
/**
 * Launch Command Deck Kanban micro-service (Node.js port).
 *
 * Local, file-backed Kanban system with a minimal JSON API and static UI.
 * Zero external dependencies — Node.js stdlib only.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { randomBytes } = require('crypto');
const { URL } = require('url');

// ---------- paths ----------
const BASE_DIR = __dirname;
const PUBLIC_DIR = path.join(BASE_DIR, 'public');
const DATA_DIR = path.join(BASE_DIR, 'data');
const DOCS_DIR = path.resolve(BASE_DIR, '..', '..', 'referenceDocs');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

// ---------- helpers ----------
function nowIso() {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function newId(prefix) {
    return `${prefix}_${randomBytes(5).toString('hex')}`;
}

function sortByOrder(items) {
    return [...items].sort((a, b) => {
        const oa = a.order ?? 0;
        const ob = b.order ?? 0;
        if (oa !== ob) return oa - ob;
        return (a.title || '').localeCompare(b.title || '');
    });
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

// ---------- state store ----------
function writeJsonAtomic(filePath, payload) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = filePath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(payload, null, 2) + '\n', 'utf8');
    fs.renameSync(tmp, filePath);
}

function boardStatusLists() {
    const statuses = [
        ['backlog', 'Backlog'],
        ['active', 'In Progress'],
        ['blocked', 'Blocked'],
        ['qa', 'QA / Review'],
        ['done', 'Done'],
    ];
    return statuses.map(([key, title], idx) => ({
        id: newId('list'),
        key,
        title,
        order: idx,
        createdAt: nowIso(),
        updatedAt: nowIso(),
    }));
}

function emptyBoard(name, description = '', codename = 'PRJ') {
    return {
        id: newId('board'),
        name,
        codename: codename.toUpperCase().slice(0, 3),
        nextIssueNumber: 1,
        description,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        lists: boardStatusLists(),
        milestones: [],
        cards: [],
    };
}

function seededLaunchBoard(name) {
    const board = emptyBoard(
        name || 'Launch Command Deck',
        'Single source of truth for evaluation, contracts, execution, and release readiness.'
    );

    const milestoneSpecs = [
        ['ops', 'Program Ops'],
        ['m1', 'M1 Evaluate + Scope'],
        ['m2', 'M2 Contract + Plan'],
        ['m3', 'M3 Build + Verify'],
        ['m4', 'M4 Release Readiness'],
    ];

    const milestoneIdByCode = {};
    milestoneSpecs.forEach(([code, title], order) => {
        const msId = newId('ms');
        milestoneIdByCode[code] = msId;
        board.milestones.push({
            id: msId,
            code,
            title,
            order,
            createdAt: nowIso(),
            updatedAt: nowIso(),
        });
    });

    const listIdByKey = {};
    board.lists.forEach((l) => { listIdByKey[l.key] = l.id; });
    const backlogId = listIdByKey['backlog'];
    const activeId = listIdByKey['active'];

    const taskSpecs = [
        ['ops', 'Establish guardrails and workflow baseline', 'P0', 'Confirm Evaluate -> Contract -> Execute loop and closeout rules.'],
        ['m1', 'Document project charter and scope boundaries', 'P0', 'Capture target users, value, and hard non-goals.'],
        ['m1', 'Create first evaluation card set', 'P1', 'Break scope into milestone cards with dependencies and acceptance criteria.'],
        ['m2', 'Write initial build contracts', 'P0', 'Draft contract files for first implementation slice.'],
        ['m3', 'Execute first contract and verify acceptance', 'P0', 'Implement changes and validate against contract criteria.'],
        ['m4', 'Prepare release checklist and QA matrix', 'P1', 'Define go/no-go gates, metadata requirements, and test matrix.'],
    ];

    const codename = 'AM';
    board.codename = codename;
    board.nextIssueNumber = taskSpecs.length + 1;

    taskSpecs.forEach(([msCode, title, priority, description], index) => {
        const listId = index === 0 ? activeId : backlogId;
        const issueNumber = index + 1;
        board.cards.push({
            id: newId('card'),
            issueNumber: `${codename}-${String(issueNumber).padStart(3, '0')}`,
            title,
            description,
            acceptance: '',
            milestoneId: milestoneIdByCode[msCode],
            listId,
            priority,
            owner: '',
            targetDate: '',
            order: index,
            createdAt: nowIso(),
            updatedAt: nowIso(),
        });
    });

    board.updatedAt = nowIso();
    return board;
}

function maxOrder(cards, listId) {
    const subset = cards.filter((c) => c.listId === listId).map((c) => c.order ?? 0);
    return subset.length === 0 ? 0 : Math.max(...subset) + 1;
}

function normalizeBoardOrders(board) {
    board.lists = sortByOrder(board.lists || []);
    board.lists.forEach((item, order) => { item.order = order; });

    board.milestones = sortByOrder(board.milestones || []);
    board.milestones.forEach((item, order) => { item.order = order; });

    const cards = board.cards || [];
    if (!board.lists.length) { board.cards = cards; return; }

    const validListIds = new Set(board.lists.map((l) => l.id));
    const fallbackListId = board.lists[0].id;
    cards.forEach((card) => {
        if (!validListIds.has(card.listId)) card.listId = fallbackListId;
    });

    board.lists.forEach((listItem) => {
        const listCards = sortByOrder(cards.filter((c) => c.listId === listItem.id));
        listCards.forEach((card, order) => { card.order = order; });
    });

    board.cards = cards;
}

function normalizeStateOrders(state) {
    (state.boards || []).forEach(normalizeBoardOrders);
}

// ---------- state manager ----------
class StateStore {
    constructor(filePath) {
        this.filePath = filePath;
        this.state = this._loadOrCreate();
    }

    _loadOrCreate() {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        if (fs.existsSync(this.filePath)) {
            const state = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
            normalizeStateOrders(state);
            this._write(state);
            return state;
        }
        const board = seededLaunchBoard();
        const state = {
            version: 1,
            updatedAt: nowIso(),
            activeBoardId: board.id,
            boards: [board],
        };
        this._write(state);
        return state;
    }

    _write(payload) {
        const tmp = this.filePath + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(payload, null, 2) + '\n', 'utf8');
        fs.renameSync(tmp, this.filePath);
    }

    snapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }

    mutate(fn) {
        fn(this.state);
        normalizeStateOrders(this.state);
        this.state.updatedAt = nowIso();
        this._write(this.state);
        return this.snapshot();
    }

    reload() {
        this.state = this._loadOrCreate();
        return this.snapshot();
    }
}

// ---------- finders ----------
function findBoard(state, boardId) {
    const board = state.boards.find((b) => b.id === boardId);
    if (!board) throw new Error(`board not found: ${boardId}`);
    return board;
}

function findList(state, listId) {
    for (const board of state.boards) {
        const item = board.lists.find((l) => l.id === listId);
        if (item) return { board, item };
    }
    throw new Error(`list not found: ${listId}`);
}

function findMilestone(state, milestoneId) {
    for (const board of state.boards) {
        const item = board.milestones.find((m) => m.id === milestoneId);
        if (item) return { board, item };
    }
    throw new Error(`milestone not found: ${milestoneId}`);
}

function findCard(state, cardId) {
    for (const board of state.boards) {
        const item = board.cards.find((c) => c.id === cardId);
        if (item) return { board, item };
    }
    throw new Error(`card not found: ${cardId}`);
}

// ---------- import/sanitize ----------
function sanitizeImportedBoard(payload) {
    const title = String(payload.name || payload.title || 'Imported Board').trim();
    const board = emptyBoard(title);
    board.description = String(payload.description || '');

    const incomingLists = payload.lists || [];
    const incomingMilestones = payload.milestones || [];
    const incomingCards = payload.cards || [];

    const listIdMap = {};
    if (incomingLists.length) {
        board.lists = [];
        sortByOrder(incomingLists).forEach((item, order) => {
            const oldId = String(item.id || newId('legacy_list'));
            const newListId = newId('list');
            listIdMap[oldId] = newListId;
            board.lists.push({
                id: newListId,
                key: String(item.key || '').trim().toLowerCase(),
                title: String(item.title || 'List').trim(),
                order,
                createdAt: nowIso(),
                updatedAt: nowIso(),
            });
        });
    } else {
        board.lists.forEach((l) => { listIdMap[l.id] = l.id; });
    }

    const milestoneIdMap = {};
    sortByOrder(incomingMilestones).forEach((item, order) => {
        const oldId = String(item.id || newId('legacy_ms'));
        const newMsId = newId('ms');
        milestoneIdMap[oldId] = newMsId;
        board.milestones.push({
            id: newMsId,
            code: String(item.code || '').trim().toLowerCase(),
            title: String(item.title || 'Milestone').trim(),
            order,
            createdAt: nowIso(),
            updatedAt: nowIso(),
        });
    });

    if (!incomingLists.length) {
        listIdMap[''] = board.lists[0].id;
    }

    const fallbackList = board.lists[0].id;
    incomingCards.forEach((item, order) => {
        const sourceListId = String(item.listId || '');
        const sourceMsId = String(item.milestoneId || '');
        board.cards.push({
            id: newId('card'),
            title: String(item.title || 'Untitled Card').trim(),
            description: String(item.description || ''),
            acceptance: String(item.acceptance || ''),
            milestoneId: milestoneIdMap[sourceMsId] || '',
            listId: listIdMap[sourceListId] || fallbackList,
            priority: String(item.priority || 'P2'),
            owner: String(item.owner || ''),
            targetDate: String(item.targetDate || ''),
            order,
            createdAt: nowIso(),
            updatedAt: nowIso(),
        });
    });

    board.updatedAt = nowIso();
    return board;
}

// ---------- docs resolver ----------
function resolveDoc(docId) {
    let header = '';
    let filePath = null;

    if (docId === 'charter') {
        const dir = path.join(DOCS_DIR, '01_Strategy');
        filePath = findLatestGlob(dir, 'PROJECT_CHARTER.md');
    } else if (docId === 'prd') {
        const dir = path.join(DOCS_DIR, '01_Strategy');
        filePath = findLatestGlob(dir, 'HIGH_LEVEL_PRD.md');
    } else if (docId === 'guardrails') {
        filePath = path.join(DOCS_DIR, '00_Governance', 'GUARDRAILS.md');
    } else if (docId === 'playbook') {
        filePath = path.join(DOCS_DIR, '00_Governance', 'MCD_PLAYBOOK.md');
    } else if (docId === 'contract') {
        const activeDir = path.join(DOCS_DIR, '03_Contracts', 'active');
        const archiveDir = path.join(DOCS_DIR, '03_Contracts', 'archive');
        const activeFiles = listMdFiles(activeDir);
        const archiveFiles = listMdFiles(archiveDir);
        if (activeFiles.length) {
            filePath = activeFiles[0];
            header = '> **[STATUS: ACTIVE CONTRACT]**\n\n';
        } else if (archiveFiles.length) {
            filePath = archiveFiles[0];
            header = '> **[STATUS: ARCHIVED]**\n\n';
        } else {
            return '*No active or archived contracts found.*';
        }
    } else {
        return null;
    }

    if (!filePath || !fs.existsSync(filePath)) return '*Not generated or not found.*';
    return header + fs.readFileSync(filePath, 'utf8');
}

function findLatestGlob(dir, suffix) {
    const files = listMdFiles(dir).filter((f) => f.endsWith(suffix));
    return files.length ? files[0] : path.join(dir, suffix);
}

function listMdFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .sort()
        .reverse()
        .map((f) => path.join(dir, f));
}

// ---------- git log ----------
function getGitLog() {
    try {
        const projectRoot = path.resolve(BASE_DIR, '..', '..');
        const result = execSync('git log -n 8 --oneline', {
            cwd: projectRoot,
            encoding: 'utf8',
            timeout: 5000,
        });
        return result.trim();
    } catch {
        return 'Git not initialized or available';
    }
}

// ---------- HTTP helpers ----------
function sendJson(res, payload, status = 200) {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store',
    });
    res.end(body);
}

function sendError(res, message, status = 400) {
    sendJson(res, { ok: false, error: message }, status);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf8');
            if (!raw) return resolve({});
            try {
                const body = JSON.parse(raw);
                if (typeof body !== 'object' || Array.isArray(body)) {
                    return reject(new Error('JSON body must be an object'));
                }
                resolve(body);
            } catch (e) {
                reject(new Error(`Malformed JSON: ${e.message}`));
            }
        });
        req.on('error', reject);
    });
}

function serveStatic(res, route) {
    let sanitized = decodeURIComponent(route).replace(/^\/+/, '');
    if (!sanitized) sanitized = 'index.html';
    const fsPath = path.resolve(PUBLIC_DIR, sanitized);

    if (!fsPath.startsWith(path.resolve(PUBLIC_DIR)) || !fs.existsSync(fsPath) || fs.statSync(fsPath).isDirectory()) {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }

    const ext = path.extname(fsPath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const payload = fs.readFileSync(fsPath);

    res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': payload.length,
        'Cache-Control': 'no-store',
    });
    res.end(payload);
}

// ---------- route handlers ----------
function handleGet(req, res, route, store) {
    if (route === '/api/health') {
        return sendJson(res, { ok: true, time: nowIso() });
    }

    if (route === '/api/state') {
        return sendJson(res, { ok: true, state: store.snapshot() });
    }

    if (route.startsWith('/api/docs/')) {
        const docId = route.split('/').pop();
        const content = resolveDoc(docId);
        if (content === null) return sendError(res, 'Unknown doc', 404);
        return sendJson(res, { ok: true, content });
    }

    if (route === '/api/git/log') {
        return sendJson(res, { ok: true, log: getGitLog() });
    }

    if (route.startsWith('/api/')) {
        return sendError(res, 'Route not found', 404);
    }

    serveStatic(res, route);
}

async function handlePost(req, res, route, store) {
    let body;
    try { body = await readBody(req); } catch (e) { return sendError(res, e.message); }

    try {
        // POST /api/boards
        if (route === '/api/boards') {
            const name = String(body.name || '').trim();
            if (!name) return sendError(res, 'Board name is required');
            const description = String(body.description || '');
            const codename = String(body.codename || 'PRJ').trim().toUpperCase().slice(0, 3);
            const seedTemplate = Boolean(body.seedTemplate);
            const state = store.mutate((s) => {
                const board = seedTemplate ? seededLaunchBoard(name) : emptyBoard(name, description, codename);
                if (seedTemplate && description) board.description = description;
                s.boards.push(board);
                s.activeBoardId = board.id;
            });
            return sendJson(res, { ok: true, state });
        }

        // POST /api/boards/import
        if (route === '/api/boards/import') {
            if (!body.board || typeof body.board !== 'object') return sendError(res, 'Import requires a board object');
            const state = store.mutate((s) => {
                const board = sanitizeImportedBoard(body.board);
                s.boards.push(board);
                s.activeBoardId = board.id;
            });
            return sendJson(res, { ok: true, state });
        }

        // POST /api/boards/:id/activate
        if (route.endsWith('/activate') && route.startsWith('/api/boards/')) {
            const boardId = route.split('/')[3];
            const state = store.mutate((s) => {
                findBoard(s, boardId);
                s.activeBoardId = boardId;
            });
            return sendJson(res, { ok: true, state });
        }

        // POST /api/boards/:id/clone
        if (route.endsWith('/clone') && route.startsWith('/api/boards/')) {
            const boardId = route.split('/')[3];
            const state = store.mutate((s) => {
                const source = findBoard(s, boardId);
                const clone = sanitizeImportedBoard(source);
                clone.name = `${source.name} (Clone)`;
                s.boards.push(clone);
                s.activeBoardId = clone.id;
            });
            return sendJson(res, { ok: true, state });
        }

        // POST /api/lists
        if (route === '/api/lists') {
            const boardId = String(body.boardId || '');
            const title = String(body.title || '').trim();
            if (!boardId || !title) return sendError(res, 'boardId and title are required');
            const state = store.mutate((s) => {
                const board = findBoard(s, boardId);
                board.lists.push({
                    id: newId('list'), key: '', title, order: board.lists.length,
                    createdAt: nowIso(), updatedAt: nowIso(),
                });
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        // POST /api/milestones
        if (route === '/api/milestones') {
            const boardId = String(body.boardId || '');
            const title = String(body.title || '').trim();
            if (!boardId || !title) return sendError(res, 'boardId and title are required');
            const state = store.mutate((s) => {
                const board = findBoard(s, boardId);
                board.milestones.push({
                    id: newId('ms'), code: '', title, order: board.milestones.length,
                    createdAt: nowIso(), updatedAt: nowIso(),
                });
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        // POST /api/cards
        if (route === '/api/cards') {
            const required = ['boardId', 'listId', 'title'];
            if (required.some((k) => !String(body[k] || '').trim())) {
                return sendError(res, 'boardId, listId, and title are required');
            }
            const state = store.mutate((s) => {
                const board = findBoard(s, String(body.boardId));
                const listId = String(body.listId);
                if (!board.lists.some((l) => l.id === listId)) throw new Error('Target list does not exist on board');
                const milestoneId = String(body.milestoneId || '');
                if (milestoneId && !board.milestones.some((m) => m.id === milestoneId)) {
                    throw new Error('Milestone does not exist on board');
                }

                const codename = board.codename || 'PRJ';
                const nextNum = board.nextIssueNumber || 1;
                const issueNumber = `${codename}-${String(nextNum).padStart(3, '0')}`;
                board.nextIssueNumber = nextNum + 1;

                board.cards.push({
                    id: newId('card'),
                    issueNumber,
                    title: String(body.title).trim(),
                    description: String(body.description || ''),
                    acceptance: String(body.acceptance || ''),
                    milestoneId,
                    listId,
                    priority: String(body.priority || 'P2'),
                    owner: String(body.owner || ''),
                    targetDate: String(body.targetDate || ''),
                    order: maxOrder(board.cards, listId),
                    createdAt: nowIso(),
                    updatedAt: nowIso(),
                });
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        // POST /api/cards/:id/move
        if (route.endsWith('/move') && route.startsWith('/api/cards/')) {
            const cardId = route.split('/')[3];
            const listId = String(body.listId || '');
            if (!listId) return sendError(res, 'listId is required');
            const state = store.mutate((s) => {
                const { board, item } = findCard(s, cardId);
                if (!board.lists.some((l) => l.id === listId)) throw new Error('Target list not found');
                item.listId = listId;
                item.order = maxOrder(board.cards, listId);
                item.updatedAt = nowIso();
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        // POST /api/reload
        if (route === '/api/reload') {
            const state = store.reload();
            return sendJson(res, { ok: true, state });
        }

        sendError(res, 'Route not found', 404);
    } catch (e) {
        sendError(res, e.message, 404);
    }
}

async function handlePatch(req, res, route, store) {
    let body;
    try { body = await readBody(req); } catch (e) { return sendError(res, e.message); }

    try {
        // PATCH /api/boards/:id
        if (route.startsWith('/api/boards/')) {
            const boardId = route.split('/')[3];
            const state = store.mutate((s) => {
                const board = findBoard(s, boardId);
                if ('name' in body) { const v = String(body.name).trim(); if (v) board.name = v; }
                if ('description' in body) board.description = String(body.description || '');
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        // PATCH /api/lists/:id
        if (route.startsWith('/api/lists/')) {
            const listId = route.split('/')[3];
            const state = store.mutate((s) => {
                const { board, item } = findList(s, listId);
                if ('title' in body) { const v = String(body.title).trim(); if (v) item.title = v; }
                if ('order' in body) item.order = parseInt(body.order, 10);
                item.updatedAt = nowIso();
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        // PATCH /api/milestones/:id
        if (route.startsWith('/api/milestones/')) {
            const milestoneId = route.split('/')[3];
            const state = store.mutate((s) => {
                const { board, item } = findMilestone(s, milestoneId);
                if ('title' in body) { const v = String(body.title).trim(); if (v) item.title = v; }
                if ('order' in body) item.order = parseInt(body.order, 10);
                item.updatedAt = nowIso();
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        // PATCH /api/cards/:id
        if (route.startsWith('/api/cards/')) {
            const cardId = route.split('/')[3];
            const state = store.mutate((s) => {
                const { board, item: card } = findCard(s, cardId);
                for (const field of ['title', 'description', 'acceptance', 'owner', 'targetDate', 'priority']) {
                    if (field in body) card[field] = String(body[field] || '');
                }
                if ('milestoneId' in body) {
                    const msId = String(body.milestoneId || '');
                    if (msId && !board.milestones.some((m) => m.id === msId)) throw new Error('Milestone not found');
                    card.milestoneId = msId;
                }
                if ('listId' in body) {
                    const lid = String(body.listId || '');
                    if (!board.lists.some((l) => l.id === lid)) throw new Error('List not found');
                    card.listId = lid;
                    card.order = maxOrder(board.cards, lid);
                }
                card.updatedAt = nowIso();
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        sendError(res, 'Route not found', 404);
    } catch (e) {
        sendError(res, e.message, 404);
    }
}

function handleDelete(req, res, route, store) {
    try {
        // DELETE /api/boards/:id
        if (route.startsWith('/api/boards/')) {
            const boardId = route.split('/')[3];
            const state = store.mutate((s) => {
                s.boards = s.boards.filter((b) => b.id !== boardId);
                if (!s.boards.length) {
                    const board = seededLaunchBoard();
                    s.boards = [board];
                    s.activeBoardId = board.id;
                } else if (s.activeBoardId === boardId) {
                    s.activeBoardId = s.boards[0].id;
                }
            });
            return sendJson(res, { ok: true, state });
        }

        // DELETE /api/lists/:id
        if (route.startsWith('/api/lists/')) {
            const listId = route.split('/')[3];
            const state = store.mutate((s) => {
                const { board } = findList(s, listId);
                if (board.lists.length === 1) throw new Error('Cannot delete the last list');
                const fallback = sortByOrder(board.lists.filter((l) => l.id !== listId))[0].id;
                board.cards.forEach((card) => {
                    if (card.listId === listId) {
                        card.listId = fallback;
                        card.order = maxOrder(board.cards, fallback);
                    }
                });
                board.lists = board.lists.filter((l) => l.id !== listId);
                sortByOrder(board.lists).forEach((item, order) => { item.order = order; });
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        // DELETE /api/milestones/:id
        if (route.startsWith('/api/milestones/')) {
            const milestoneId = route.split('/')[3];
            const state = store.mutate((s) => {
                const { board } = findMilestone(s, milestoneId);
                board.milestones = board.milestones.filter((m) => m.id !== milestoneId);
                board.cards.forEach((card) => {
                    if (card.milestoneId === milestoneId) card.milestoneId = '';
                });
                sortByOrder(board.milestones).forEach((item, order) => { item.order = order; });
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        // DELETE /api/cards/:id
        if (route.startsWith('/api/cards/')) {
            const cardId = route.split('/')[3];
            const state = store.mutate((s) => {
                const { board } = findCard(s, cardId);
                board.cards = board.cards.filter((c) => c.id !== cardId);
                board.updatedAt = nowIso();
            });
            return sendJson(res, { ok: true, state });
        }

        sendError(res, 'Route not found', 404);
    } catch (e) {
        sendError(res, e.message, 404);
    }
}

// ---------- main ----------
function parseArgs() {
    const args = { host: '127.0.0.1', port: 8765 };
    const argv = process.argv.slice(2);
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--host' && argv[i + 1]) { args.host = argv[++i]; }
        if (argv[i] === '--port' && argv[i + 1]) { args.port = parseInt(argv[++i], 10); }
    }
    return args;
}

function main() {
    const args = parseArgs();
    const store = new StateStore(STATE_FILE);

    const server = http.createServer(async (req, res) => {
        const parsed = new URL(req.url, `http://${req.headers.host}`);
        const route = parsed.pathname;
        const method = req.method.toUpperCase();

        if (method === 'OPTIONS') {
            res.writeHead(204, { Allow: 'GET,POST,PATCH,DELETE,OPTIONS' });
            res.end();
            return;
        }

        if (method === 'GET') return handleGet(req, res, route, store);
        if (method === 'POST') return handlePost(req, res, route, store);
        if (method === 'PATCH') return handlePatch(req, res, route, store);
        if (method === 'DELETE') return handleDelete(req, res, route, store);

        sendError(res, 'Method not allowed', 405);
    });

    server.listen(args.port, args.host, () => {
        console.log(`Kanban running at http://${args.host}:${args.port}`);
    });
}

main();
