/* ============================================================
   DOMAIN TRANSFER – FRUIT ANNOTATION TOOL
   fruit_app.js — Phase 1 implementation
   ============================================================ */

'use strict';

// ============================================================
// CONFIGURATION
// ============================================================

const PHASE_IMAGES = {
    1: {
        1: '1.1.jpg',
        2: '1.2..jpg',
        3: '1.3...jpg',
    },
    2: {
        1: '2.1.jpg',
        2: '2.2...jpg',
        3: '2.3.jpg',
    },
    3: {
        1: '3.1.jpg',
        2: '3.2.jpg',
        3: '3.3.jpg',
    },
};

const PHASE_INSTRUCTIONS = {
    1: `Pred vami je obrázok a vašou úlohou je vyznačiť všetky objekty a do textového poľa
        ich čo najdetailnejšie opísať vlastnými slovami tak, aby si to vedelo presne predstaviť aj malé dieťa, ktoré daný obrázok nevidelo.
        Zamerajte sa na všetky dôležité vlastnosti, ktoré daný objekt má.`,
    2: `Vyznačte objekt na obrázku a do textového poľa vypíšte jeho vlastnosti, ktoré musíte manuálne vyhľadať v priloženom Word protokole.`,
    3: `Vyznačte objekt a vyplňte digitálnu šablónu, ktorá sa po výbere druhu ovocia automaticky prispôsobí a ponúkne vám konkrétne možnosti na zakliknutie.`,
};

const PHASE_BADGE_COLORS = {
    1: '#2563eb',
    2: '#10b981',
    3: '#8b5cf6',
};

const ANNOTATION_COLORS = [
    '#f59e0b', '#3b82f6', '#10b981', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

// ============================================================
// STATE
// ============================================================

const state = {
    currentPhase: 1,
    currentImage: 1,

    // annotations[phase][image] = array of annotation objects
    annotations: {
        1: { 1: [], 2: [], 3: [] },
        2: { 1: [], 2: [], 3: [] },
        3: { 1: [], 2: [], 3: [] },
    },

    // Currently selected annotation index (or null)
    selectedAnnotationId: null,

    // Drawing mode
    isAnnotating: false,
    isDrawing: false,
    drawStart: null,

    // Next annotation ID (global, keeps uniqueness)
    nextId: 1,

    // Zoom & Pan
    zoom: 1.0,
    panX: 0,
    panY: 0,
    isPanning: false,
    lastPanPoint: null,

    // Loaded image element
    loadedImage: null,
    imageLoaded: false,

    // Flag to prevent immediate click from closing panel after draw
    preventNextClickClose: false,
};

// ============================================================
// DOM REFERENCES
// ============================================================

const $ = id => document.getElementById(id);

const el = {
    // Phase buttons
    btnPhase1: $('btnPhase1'),
    btnPhase2: $('btnPhase2'),
    btnPhase3: $('btnPhase3'),

    // Image buttons
    btnImg1: $('btnImg1'),
    btnImg2: $('btnImg2'),
    btnImg3: $('btnImg3'),

    // Toolbar
    btnAnnotate: $('btnAnnotate'),
    btnZoomIn: $('btnZoomIn'),
    btnZoomOut: $('btnZoomOut'),
    btnReset: $('btnReset'),
    zoomLevel: $('zoomLevel'),

    // Instruction
    taskPhaseBadge: $('taskPhaseBadge'),
    taskInstructionText: $('taskInstructionText'),

    // Canvas
    imageContainer: $('imageContainer'),
    mainCanvas: $('mainCanvas'),
    drawingCanvas: $('drawingCanvas'),
    annotationLayer: $('annotationLayer'),
    noImagePlaceholder: $('noImagePlaceholder'),

    // Panel
    annotationPanel: $('annotationPanel'),
    panelBadge: $('panelBadge'),
    annotationText: $('annotationText'),
    btnSaveAnnotation: $('btnSaveAnnotation'),
    btnDeleteAnnotation: $('btnDeleteAnnotation'),
    btnPanelClose: $('btnPanelClose'),

    // Drawing hint
    drawingHint: $('drawingHint'),
    btnCancelDraw: $('btnCancelDraw'),
};

const ctx = el.mainCanvas.getContext('2d');
const drawCtx = el.drawingCanvas.getContext('2d');

// ============================================================
// HELPERS
// ============================================================

function getAnnotationColor(index) {
    return ANNOTATION_COLORS[index % ANNOTATION_COLORS.length];
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function currentAnnotations() {
    return state.annotations[state.currentPhase][state.currentImage];
}

function updateCounter() {
    // No-op
}

function updateZoomDisplay() {
    el.zoomLevel.textContent = Math.round(state.zoom * 100) + '%';
}

// ============================================================
// CANVAS SIZE
// ============================================================

function resizeCanvases() {
    const container = el.imageContainer;
    const w = container.clientWidth;
    const h = container.clientHeight;

    el.mainCanvas.width = w;
    el.mainCanvas.height = h;
    el.drawingCanvas.width = w;
    el.drawingCanvas.height = h;

    redrawAll();
}

// ============================================================
// IMAGE LOADING
// ============================================================

function loadImage(src) {
    state.imageLoaded = false;
    state.loadedImage = null;
    el.noImagePlaceholder.classList.add('hidden');

    const img = new Image();
    img.onload = () => {
        state.loadedImage = img;
        state.imageLoaded = true;
        fitImageToCanvas();
        redrawAll();
        el.noImagePlaceholder.classList.add('hidden');
    };
    img.onerror = () => {
        state.loadedImage = null;
        el.noImagePlaceholder.classList.remove('hidden');
        el.mainCanvas.getContext('2d').clearRect(0, 0, el.mainCanvas.width, el.mainCanvas.height);
    };
    img.src = src;
}

function fitImageToCanvas() {
    if (!state.loadedImage) return;
    const cw = el.mainCanvas.width;
    const ch = el.mainCanvas.height;
    const iw = state.loadedImage.width;
    const ih = state.loadedImage.height;

    const scaleX = cw / iw;
    const scaleY = ch / ih;
    state.zoom = Math.min(scaleX, scaleY) * 0.92;

    state.panX = (cw - iw * state.zoom) / 2;
    state.panY = (ch - ih * state.zoom) / 2;

    updateZoomDisplay();
}

// ============================================================
// RENDER
// ============================================================

function redrawAll() {
    const canvas = el.mainCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (state.imageLoaded && state.loadedImage) {
        ctx.save();
        ctx.translate(state.panX, state.panY);
        ctx.scale(state.zoom, state.zoom);
        ctx.drawImage(state.loadedImage, 0, 0);
        ctx.restore();
    }

    renderAnnotationBoxes();
}

function renderAnnotationBoxes() {
    // Clear annotation layer
    el.annotationLayer.innerHTML = '';

    const anns = currentAnnotations();
    const zoom = state.zoom;
    const px = state.panX;
    const py = state.panY;

    anns.forEach((ann, idx) => {
        const color = getAnnotationColor(idx);

        // Compute screen position
        const sx = ann.rect.x * zoom + px;
        const sy = ann.rect.y * zoom + py;
        const sw = ann.rect.w * zoom;
        const sh = ann.rect.h * zoom;

        // Box div
        const box = document.createElement('div');
        box.className = 'fruit-box';
        box.dataset.annId = ann.id;
        box.style.left = sx + 'px';
        box.style.top = sy + 'px';
        box.style.width = sw + 'px';
        box.style.height = sh + 'px';
        box.style.borderColor = color;
        box.style.background = hexToRgba(color, 0.08);

        if (ann.id === state.selectedAnnotationId) {
            box.classList.add('selected');
        }

        // Label
        const label = document.createElement('div');
        label.className = 'fruit-box-label';
        label.style.background = color;

        const shortText = ann.text
            ? ann.text.trim().slice(0, 30) + (ann.text.length > 30 ? '…' : '')
            : `Objekt ${idx + 1}`;
        label.textContent = `#${idx + 1} ${shortText}`;

        box.appendChild(label);

        box.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!state.isAnnotating) {
                selectAnnotation(ann.id);
            }
        });

        el.annotationLayer.appendChild(box);
    });
}

// ============================================================
// PHASE / IMAGE SWITCHING
// ============================================================

function switchPhase(phase) {
    if (phase === state.currentPhase) return;
    closePanel();
    state.currentPhase = phase;
    state.selectedAnnotationId = null;
    updatePhaseUI();
    loadCurrentImage();
}

function switchImage(imgNum) {
    if (imgNum === state.currentImage) return;
    closePanel();
    state.currentImage = imgNum;
    state.selectedAnnotationId = null;
    updateImageUI();
    loadCurrentImage();
}

function loadCurrentImage() {
    const src = PHASE_IMAGES[state.currentPhase][state.currentImage];
    loadImage(src);
    updateCounter();
}

function updatePhaseUI() {
    // Phase buttons
    document.querySelectorAll('.btn-phase').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.phase) === state.currentPhase);
    });

    // Image buttons — reset to 1 when switching phase
    state.currentImage = 1;
    updateImageUI();

    // Instruction text
    el.taskInstructionText.innerHTML = PHASE_INSTRUCTIONS[state.currentPhase];
    el.taskPhaseBadge.textContent = `Fáza ${state.currentPhase}`;
    el.taskPhaseBadge.style.background = PHASE_BADGE_COLORS[state.currentPhase];
}

function updateImageUI() {
    document.querySelectorAll('.btn-imgnum').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.img) === state.currentImage);
    });
}

// ============================================================
// ANNOTATION SELECTION & PANEL
// ============================================================

function selectAnnotation(annId) {
    state.selectedAnnotationId = annId;
    const anns = currentAnnotations();
    const ann = anns.find(a => a.id === annId);
    const idx = anns.indexOf(ann);

    if (!ann) return;

    openPanel(ann, idx);
    renderAnnotationBoxes();
}

function openPanel(ann, idx) {
    el.panelBadge.textContent = `Anotácia #${idx + 1}`;

    if (state.currentPhase === 3) {
        // Render dynamic Phase 3 template
        el.annotationText.style.display = 'none';
        // Clear and use panelBody for template
        let p3Container = el.annotationPanel.querySelector('.p3-body');
        if (!p3Container) {
            p3Container = document.createElement('div');
            p3Container.className = 'p3-body';
            el.annotationPanel.querySelector('.panel-body').prepend(p3Container);
        }
        window.Phase3.renderBody(ann, p3Container);
    } else {
        // Normal phases 1 & 2 — show textarea
        el.annotationText.style.display = '';
        const p3Container = el.annotationPanel.querySelector('.p3-body');
        if (p3Container) p3Container.innerHTML = '';
        el.annotationText.value = ann.text || '';
    }

    el.annotationPanel.classList.add('active');
}

function closePanel() {
    el.annotationPanel.classList.remove('active');
    state.selectedAnnotationId = null;
    renderAnnotationBoxes();
}

function saveCurrentAnnotation() {
    const annId = state.selectedAnnotationId;
    if (annId === null) return;

    const anns = currentAnnotations();
    const ann = anns.find(a => a.id === annId);
    if (!ann) return;

    if (state.currentPhase === 3) {
        const p3Container = el.annotationPanel.querySelector('.p3-body');
        if (p3Container) window.Phase3.save(ann, p3Container);
    } else {
        ann.text = el.annotationText.value;
    }

    renderAnnotationBoxes();
    closePanel();
}

function deleteCurrentAnnotation() {
    const annId = state.selectedAnnotationId;
    if (annId === null) return;

    const anns = currentAnnotations();
    const idx = anns.findIndex(a => a.id === annId);
    if (idx === -1) return;

    anns.splice(idx, 1);
    closePanel();
    updateCounter();
    renderAnnotationBoxes();
}

// ============================================================
// ANNOTATE MODE (draw rectangle)
// ============================================================

function toggleAnnotateMode() {
    state.isAnnotating = !state.isAnnotating;

    if (state.isAnnotating) {
        el.btnAnnotate.classList.add('annotating-active');
        el.btnAnnotate.innerHTML = '<span class="btn-icon">✖</span> Zrušiť označovanie';
        el.imageContainer.classList.add('annotating');
        el.drawingCanvas.classList.add('active');
        el.drawingHint.classList.remove('hidden');
        closePanel();
    } else {
        cancelAnnotating();
    }
}

function cancelAnnotating() {
    state.isAnnotating = false;
    state.isDrawing = false;
    state.drawStart = null;
    el.btnAnnotate.classList.remove('annotating-active');
    el.btnAnnotate.innerHTML = '<span class="btn-icon">✏️</span> Označiť objekt';
    el.imageContainer.classList.remove('annotating');
    el.drawingCanvas.classList.remove('active');
    el.drawingHint.classList.add('hidden');
    drawCtx.clearRect(0, 0, el.drawingCanvas.width, el.drawingCanvas.height);
}

// ============================================================
// MOUSE / DRAWING EVENTS
// ============================================================

function getCanvasPoint(e) {
    const rect = el.imageContainer.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

// Convert screen coords to image coords
function screenToImage(sx, sy) {
    return {
        x: (sx - state.panX) / state.zoom,
        y: (sy - state.panY) / state.zoom,
    };
}

el.imageContainer.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const pt = getCanvasPoint(e);

    if (state.isAnnotating) {
        state.isDrawing = true;
        state.drawStart = pt;
    } else {
        // Pan start
        state.isPanning = true;
        state.lastPanPoint = pt;
        el.imageContainer.style.cursor = 'grabbing';
    }
});

el.imageContainer.addEventListener('mousemove', (e) => {
    const pt = getCanvasPoint(e);

    if (state.isAnnotating && state.isDrawing) {
        // Draw live rectangle
        drawCtx.clearRect(0, 0, el.drawingCanvas.width, el.drawingCanvas.height);
        const x = Math.min(pt.x, state.drawStart.x);
        const y = Math.min(pt.y, state.drawStart.y);
        const w = Math.abs(pt.x - state.drawStart.x);
        const h = Math.abs(pt.y - state.drawStart.y);

        drawCtx.strokeStyle = '#f59e0b';
        drawCtx.lineWidth = 2;
        drawCtx.setLineDash([6, 3]);
        drawCtx.strokeRect(x, y, w, h);
        drawCtx.fillStyle = 'rgba(245,158,11,0.08)';
        drawCtx.fillRect(x, y, w, h);
        return;
    }

    if (state.isPanning && state.lastPanPoint) {
        const dx = pt.x - state.lastPanPoint.x;
        const dy = pt.y - state.lastPanPoint.y;
        state.panX += dx;
        state.panY += dy;
        state.lastPanPoint = pt;
        redrawAll();
    }
});

el.imageContainer.addEventListener('mouseup', (e) => {
    const pt = getCanvasPoint(e);

    if (state.isAnnotating && state.isDrawing) {
        state.isDrawing = false;
        drawCtx.clearRect(0, 0, el.drawingCanvas.width, el.drawingCanvas.height);

        const sx = Math.min(pt.x, state.drawStart.x);
        const sy = Math.min(pt.y, state.drawStart.y);
        const sw = Math.abs(pt.x - state.drawStart.x);
        const sh = Math.abs(pt.y - state.drawStart.y);

        // Require minimum size
        if (sw < 10 || sh < 10) {
            state.drawStart = null;
            return;
        }

        // Convert to image coordinates
        const imgStart = screenToImage(sx, sy);
        const imgEnd = screenToImage(sx + sw, sy + sh);

        const newAnn = {
            id: state.nextId++,
            rect: {
                x: imgStart.x,
                y: imgStart.y,
                w: imgEnd.x - imgStart.x,
                h: imgEnd.y - imgStart.y,
            },
            text: '',
        };

        if (window.pendingAutoFruit) {
            newAnn.p3 = { objectType: 'fruit', surfaceType: null, bowlFull: null, fruit: null, fields: {} };
            window.pendingAutoFruit = false;
        }

        currentAnnotations().push(newAnn);
        updateCounter();
        cancelAnnotating();

        // Auto-open panel for this new annotation
        const idx = currentAnnotations().length - 1;
        state.selectedAnnotationId = newAnn.id;
        state.preventNextClickClose = true;
        openPanel(newAnn, idx);
        renderAnnotationBoxes();
        return;
    }

    if (state.isPanning) {
        state.isPanning = false;
        state.lastPanPoint = null;
        el.imageContainer.style.cursor = state.isAnnotating ? 'crosshair' : 'grab';
    }
});

el.imageContainer.addEventListener('mouseleave', () => {
    if (state.isPanning) {
        state.isPanning = false;
        state.lastPanPoint = null;
    }
    if (state.isAnnotating && state.isDrawing) {
        state.isDrawing = false;
        drawCtx.clearRect(0, 0, el.drawingCanvas.width, el.drawingCanvas.height);
    }
});

// Scroll to zoom
el.imageContainer.addEventListener('wheel', (e) => {
    e.preventDefault();

    const pt = getCanvasPoint(e);
    const delta = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(state.zoom * delta, 0.1), 10);

    // Zoom towards mouse position
    state.panX = pt.x - (pt.x - state.panX) * (newZoom / state.zoom);
    state.panY = pt.y - (pt.y - state.panY) * (newZoom / state.zoom);
    state.zoom = newZoom;

    updateZoomDisplay();
    redrawAll();
}, { passive: false });

// ============================================================
// ZOOM BUTTON EVENTS
// ============================================================

el.btnZoomIn.addEventListener('click', () => {
    const cx = el.mainCanvas.width / 2;
    const cy = el.mainCanvas.height / 2;
    const newZoom = Math.min(state.zoom * 1.2, 10);
    state.panX = cx - (cx - state.panX) * (newZoom / state.zoom);
    state.panY = cy - (cy - state.panY) * (newZoom / state.zoom);
    state.zoom = newZoom;
    updateZoomDisplay();
    redrawAll();
});

el.btnZoomOut.addEventListener('click', () => {
    const cx = el.mainCanvas.width / 2;
    const cy = el.mainCanvas.height / 2;
    const newZoom = Math.max(state.zoom * 0.8, 0.1);
    state.panX = cx - (cx - state.panX) * (newZoom / state.zoom);
    state.panY = cy - (cy - state.panY) * (newZoom / state.zoom);
    state.zoom = newZoom;
    updateZoomDisplay();
    redrawAll();
});

el.btnReset.addEventListener('click', () => {
    fitImageToCanvas();
    redrawAll();
});

// ============================================================
// PHASE / IMAGE BUTTON EVENTS
// ============================================================

document.querySelectorAll('.btn-phase').forEach(btn => {
    btn.addEventListener('click', () => {
        switchPhase(parseInt(btn.dataset.phase));
    });
});

document.querySelectorAll('.btn-imgnum').forEach(btn => {
    btn.addEventListener('click', () => {
        switchImage(parseInt(btn.dataset.img));
    });
});

// ============================================================
// ANNOTATE BUTTON
// ============================================================

el.btnAnnotate.addEventListener('click', toggleAnnotateMode);
el.btnCancelDraw.addEventListener('click', cancelAnnotating);

// ============================================================
// PANEL EVENTS
// ============================================================

el.btnPanelClose.addEventListener('click', () => {
    if (state.selectedAnnotationId !== null) {
        const anns = currentAnnotations();
        const ann = anns.find(a => a.id === state.selectedAnnotationId);
        if (ann) {
            if (state.currentPhase === 3) {
                const p3Container = el.annotationPanel.querySelector('.p3-body');
                if (p3Container && window.Phase3) window.Phase3.save(ann, p3Container);
            } else {
                ann.text = el.annotationText.value;
            }
        }
    }
    closePanel();
});

el.btnSaveAnnotation.addEventListener('click', saveCurrentAnnotation);
el.btnDeleteAnnotation.addEventListener('click', deleteCurrentAnnotation);

// Text length listener removed

// Close panel when clicking on the canvas (not on a box)
el.imageContainer.addEventListener('click', (e) => {
    if (state.preventNextClickClose) {
        state.preventNextClickClose = false;
        return;
    }

    // Only if not in annotating mode and not clicking on a box
    if (!state.isAnnotating && !e.target.closest('.fruit-box')) {
        if (state.selectedAnnotationId !== null) {
            // Auto-save on close
            const anns = currentAnnotations();
            const ann = anns.find(a => a.id === state.selectedAnnotationId);
            if (ann) {
                if (state.currentPhase === 3) {
                    const p3Container = el.annotationPanel.querySelector('.p3-body');
                    if (p3Container && window.Phase3) window.Phase3.save(ann, p3Container);
                } else {
                    ann.text = el.annotationText.value;
                }
            }
            closePanel();
        }
    }
});

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (state.isAnnotating) {
            cancelAnnotating();
        } else if (state.selectedAnnotationId !== null) {
            closePanel();
        }
    }

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        if (state.selectedAnnotationId !== null) {
            saveCurrentAnnotation();
        }
    }
});

// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener('resize', () => {
    resizeCanvases();
});

// ============================================================
// INIT
// ============================================================

function init() {
    resizeCanvases();
    updatePhaseUI();
    updateImageUI();
    loadCurrentImage();
}

init();
