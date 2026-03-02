/**
 * ============================================
 * MEDICAL ANNOTATION TEMPLATE - APP.JS
 * Main application logic for WSI annotation
 * ============================================
 */

// ============================================
// DATA DEFINITIONS
// ============================================

// Orgány a ich systémy
const ORGANS_DATA = {
    'Prsník': 'Reprodukčný systém',
    'Vaječníky': 'Reprodukčný systém',
    'Maternica': 'Reprodukčný systém',
    'Semenníky': 'Reprodukčný systém',
    'Pľúca': 'Respiračný systém',
    'Močový mechúr': 'Urogenitálny trakt',
    'Obličky': 'Urogenitálny trakt',
    'Pečeň': 'Tráviaci systém',
    'Žlčník': 'Tráviaci systém',
    'Žalúdok': 'Tráviaci systém',
    'Tenké črevo': 'Tráviaci systém',
    'Hrubé črevo': 'Tráviaci systém'
};

// Lézie pre prsník
const BREAST_LESIONS = [
    'Invazívny karcinóm',
    'Fibroadenóm',
    'Phyllodes tumor',
    'Papilóm',
    'Fibrocystické zmeny',
    'Adenóza',
    'Radiálna jazva',
    'Tubulárny adenóm',
    'Lipóm',
    'Hamartóm',
    'Atypická duktálna hyperplázia (ADH)',
    'Atypická lobulárna hyperplázia (ALH)',
    'Plochá epiteliálna atypia (FEA)'
];

// Histopatologické typy pre invazívny karcinóm
const HISTOPATHOLOGICAL_TYPES = [
    'Invazívny duktálny karcinóm (NST)',
    'Invazívny lobulárny karcinóm',
    'Tubulárny karcinóm',
    'Mucinózny karcinóm',
    'Medulárny karcinóm',
    'Papilárny karcinóm',
    'Kribriformný karcinóm',
    'Metaplastický karcinóm',
    'Apokrinný karcinóm',
    'Adenoidný cystický karcinóm',
    'Sekretorický karcinóm',
    'Mikropapilárny karcinóm',
    'Zmiešaný typ'
];

// ============================================
// APPLICATION STATE
// ============================================

const AppState = {
    // WSI Viewer state
    wsiImage: null,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,

    // Annotation mode
    isAnnotating: false,
    annotationType: 'region', // 'region' or 'cell'
    isDrawing: false,
    drawStartX: 0,
    drawStartY: 0,
    currentBox: null,

    // Data storage
    caseData: null,
    regions: [],
    currentRegionIndex: -1,

    // Editing state
    isEditingRegion: false,
    editingRegionIndex: -1,
    isEditingCell: false,
    editingCellIndex: -1,

    // Active modals
    activeModal: null,

    // Nottingham Grading System - global score
    nottingham: { tubules: 0, nuclei: 0, mitoses: 0 }
};

// ============================================
// DOM ELEMENTS
// ============================================

const DOM = {
    // Canvas and containers
    wsiContainer: null,
    wsiCanvas: null,
    ctx: null,
    annotationLayer: null,

    // Buttons
    btnCaseLevel: null,
    btnAnnotate: null,
    btnCellAnnotate: null,
    btnShowAll: null,

    // Modals
    caseLevelModal: null,
    regionLevelModal: null,
    cellLevelModal: null,
    summaryModal: null,

    // Form elements
    organSelect: null,
    organDropdown: null,
    systemDisplay: null,
    btnCaseSave: null,

    // Zoom
    btnZoomIn: null,
    btnZoomOut: null,
    btnReset: null,
    zoomLevel: null,

    // Status
    statusIndicator: null,
    statusText: null,

    // Overlay
    annotationOverlay: null
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDOMReferences();
    initializeWSIViewer();
    initializeEventListeners();
    initializeAutocomplete();

    // Show Case Level modal on start
    setTimeout(() => {
        openModal('caseLevelModal');
    }, 500);
});

function initializeDOMReferences() {
    // Canvas and containers
    DOM.wsiContainer = document.getElementById('wsiContainer');
    DOM.wsiCanvas = document.getElementById('wsiCanvas');
    DOM.ctx = DOM.wsiCanvas.getContext('2d');
    DOM.annotationLayer = document.getElementById('annotationLayer');

    // Buttons
    DOM.btnCaseLevel = document.getElementById('btnCaseLevel');
    DOM.btnAnnotate = document.getElementById('btnAnnotate');
    DOM.btnCellAnnotate = document.getElementById('btnCellAnnotate');
    DOM.btnShowAll = document.getElementById('btnShowAll');

    // Modals
    DOM.caseLevelModal = document.getElementById('caseLevelModal');
    DOM.regionLevelModal = document.getElementById('regionLevelModal');
    DOM.cellLevelModal = document.getElementById('cellLevelModal');
    DOM.summaryModal = document.getElementById('summaryModal');

    // Form elements
    DOM.organSelect = document.getElementById('organSelect');
    DOM.organDropdown = document.getElementById('organDropdown');
    DOM.systemDisplay = document.getElementById('systemDisplay');
    DOM.btnCaseSave = document.getElementById('btnCaseSave');

    // Zoom
    DOM.btnZoomIn = document.getElementById('btnZoomIn');
    DOM.btnZoomOut = document.getElementById('btnZoomOut');
    DOM.btnReset = document.getElementById('btnReset');
    DOM.zoomLevel = document.getElementById('zoomLevel');

    // Status
    DOM.statusIndicator = document.querySelector('.status-indicator');
    DOM.statusText = document.querySelector('.status-text');

    // Overlay
    DOM.annotationOverlay = document.getElementById('annotationOverlay');
}

function initializeWSIViewer() {
    // Load WSI image
    AppState.wsiImage = new Image();
    AppState.wsiImage.onload = () => {
        resizeCanvas();
        // Center image initially
        centerImage();
        renderWSI();
    };
    AppState.wsiImage.src = 'WSI-prosim.jpg';

    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        renderWSI();
    });
}

// Center the image in the canvas
function centerImage() {
    const canvas = DOM.wsiCanvas;
    const imgWidth = AppState.wsiImage.width * AppState.scale;
    const imgHeight = AppState.wsiImage.height * AppState.scale;
    AppState.offsetX = (canvas.width - imgWidth) / 2;
    AppState.offsetY = (canvas.height - imgHeight) / 2;
}

function resizeCanvas() {
    const rect = DOM.wsiContainer.getBoundingClientRect();
    DOM.wsiCanvas.width = rect.width;
    DOM.wsiCanvas.height = rect.height;
}

function renderWSI() {
    if (!AppState.wsiImage || !AppState.wsiImage.complete) return;

    const ctx = DOM.ctx;
    const canvas = DOM.wsiCanvas;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate image dimensions
    const imgWidth = AppState.wsiImage.width * AppState.scale;
    const imgHeight = AppState.wsiImage.height * AppState.scale;

    // Use offset for panning - always allow free movement
    let drawX = AppState.offsetX;
    let drawY = AppState.offsetY;

    // Draw image
    ctx.drawImage(AppState.wsiImage, drawX, drawY, imgWidth, imgHeight);

    // Update annotation layer position
    updateAnnotationLayer(drawX, drawY);
}

function updateAnnotationLayer(offsetX, offsetY) {
    // Update bounding box positions based on current scale and offset
    const boxes = DOM.annotationLayer.querySelectorAll('.bounding-box');
    boxes.forEach(box => {
        const data = box.dataset;
        const x = parseFloat(data.originalX) * AppState.scale + offsetX;
        const y = parseFloat(data.originalY) * AppState.scale + offsetY;
        const width = parseFloat(data.originalWidth) * AppState.scale;
        const height = parseFloat(data.originalHeight) * AppState.scale;

        box.style.left = x + 'px';
        box.style.top = y + 'px';
        box.style.width = width + 'px';
        box.style.height = height + 'px';
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Toolbar buttons
    DOM.btnCaseLevel.addEventListener('click', () => openModal('caseLevelModal'));
    DOM.btnAnnotate.addEventListener('click', startRegionAnnotation);
    DOM.btnCellAnnotate.addEventListener('click', startCellAnnotation);
    DOM.btnShowAll.addEventListener('click', showFullAnnotation);

    // Cancel annotation button
    document.getElementById('btnCancelAnnotation').addEventListener('click', (e) => {
        e.stopPropagation();
        exitAnnotationMode();
    });

    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.close;
            closeModal(modalId);
        });
    });

    // Modal background click to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Zoom controls
    DOM.btnZoomIn.addEventListener('click', () => zoom(1.2));
    DOM.btnZoomOut.addEventListener('click', () => zoom(0.8));
    DOM.btnReset.addEventListener('click', resetView);

    // WSI Container - Pan and Draw
    DOM.wsiContainer.addEventListener('mousedown', handleMouseDown);
    DOM.wsiContainer.addEventListener('mousemove', handleMouseMove);
    DOM.wsiContainer.addEventListener('mouseup', handleMouseUp);
    DOM.wsiContainer.addEventListener('mouseleave', handleMouseUp);
    DOM.wsiContainer.addEventListener('wheel', handleWheel);

    // Also add global mouseup to catch events even if mouse leaves container
    document.addEventListener('mouseup', handleMouseUp);

    // Pointer events for better compatibility (touch, pen, automation tools)
    DOM.wsiContainer.addEventListener('pointerdown', handleMouseDown);
    DOM.wsiContainer.addEventListener('pointermove', handleMouseMove);
    DOM.wsiContainer.addEventListener('pointerup', handleMouseUp);
    document.addEventListener('pointerup', handleMouseUp);

    // Case Level save
    DOM.btnCaseSave.addEventListener('click', (e) => {
        e.stopPropagation();
        saveCaseLevel();
    });

    // Region Level save
    document.getElementById('btnRegionSave').addEventListener('click', (e) => {
        e.stopPropagation();
        saveRegionLevel();
    });

    // Cell Level save
    document.getElementById('btnCellSave').addEventListener('click', (e) => {
        e.stopPropagation();
        saveCellLevel();
    });

    // Region category change - show/hide score fields
    document.getElementById('regionCategory').addEventListener('change', handleCategoryChange);

    // Cell Level save & continue
    document.getElementById('btnCellSaveContinue').addEventListener('click', (e) => {
        e.stopPropagation();
        saveCellLevel(true); // true = continue annotating
    });

    // Summary modal buttons
    document.getElementById('btnSave').addEventListener('click', saveAnnotation);
    document.getElementById('btnExport').addEventListener('click', exportAnnotation);
    document.getElementById('btnSummaryClose').addEventListener('click', () => closeModal('summaryModal'));

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyDown);
}

// ============================================
// MOUSE HANDLERS
// ============================================

function handleMouseDown(e) {
    if (AppState.activeModal) return;

    const rect = DOM.wsiContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (AppState.isAnnotating) {
        // Start drawing bounding box
        AppState.isDrawing = true;
        AppState.drawStartX = x;
        AppState.drawStartY = y;

        // Create temporary box element
        const box = document.createElement('div');
        box.className = 'bounding-box drawing';
        if (AppState.annotationType === 'cell') {
            box.classList.add('cell-box');
        }
        box.style.left = x + 'px';
        box.style.top = y + 'px';
        box.style.width = '0px';
        box.style.height = '0px';
        box.style.border = '3px dashed ' + (AppState.annotationType === 'cell' ? '#10b981' : '#3b82f6');
        DOM.annotationLayer.appendChild(box);
        AppState.currentBox = box;
    } else {
        // Start panning
        AppState.isDragging = true;
        AppState.dragStartX = e.clientX - AppState.offsetX;
        AppState.dragStartY = e.clientY - AppState.offsetY;
        DOM.wsiContainer.style.cursor = 'grabbing';
    }
}

function handleMouseMove(e) {
    const rect = DOM.wsiContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (AppState.isDrawing && AppState.currentBox) {
        // Update box size
        const width = x - AppState.drawStartX;
        const height = y - AppState.drawStartY;

        // Handle negative dimensions (drawing backwards)
        const left = width < 0 ? x : AppState.drawStartX;
        const top = height < 0 ? y : AppState.drawStartY;

        AppState.currentBox.style.left = left + 'px';
        AppState.currentBox.style.top = top + 'px';
        AppState.currentBox.style.width = Math.abs(width) + 'px';
        AppState.currentBox.style.height = Math.abs(height) + 'px';
    } else if (AppState.isDragging) {
        // Pan the image
        AppState.offsetX = e.clientX - AppState.dragStartX;
        AppState.offsetY = e.clientY - AppState.dragStartY;
        renderWSI();
    }
}

function handleMouseUp(e) {
    if (AppState.isDrawing && AppState.currentBox) {
        const rect = DOM.wsiContainer.getBoundingClientRect();
        const boxRect = AppState.currentBox.getBoundingClientRect();

        // Check minimum size
        if (boxRect.width > 20 && boxRect.height > 20) {
            // Finalize the box
            AppState.currentBox.classList.remove('drawing');
            AppState.currentBox.style.border = '';

            // Calculate original coordinates (relative to image)
            const imgWidth = AppState.wsiImage.width * AppState.scale;
            const imgHeight = AppState.wsiImage.height * AppState.scale;
            let imgOffsetX = AppState.offsetX;
            let imgOffsetY = AppState.offsetY;

            const boxLeft = parseFloat(AppState.currentBox.style.left);
            const boxTop = parseFloat(AppState.currentBox.style.top);
            const boxWidth = parseFloat(AppState.currentBox.style.width);
            const boxHeight = parseFloat(AppState.currentBox.style.height);

            // Store original coordinates
            AppState.currentBox.dataset.originalX = (boxLeft - imgOffsetX) / AppState.scale;
            AppState.currentBox.dataset.originalY = (boxTop - imgOffsetY) / AppState.scale;
            AppState.currentBox.dataset.originalWidth = boxWidth / AppState.scale;
            AppState.currentBox.dataset.originalHeight = boxHeight / AppState.scale;

            // Add label
            const label = document.createElement('span');
            label.className = 'box-label';

            if (AppState.annotationType === 'cell') {
                const cellIndex = AppState.regions[AppState.currentRegionIndex].cells.length + 1;
                label.textContent = 'Cell ' + cellIndex;
                AppState.currentBox.dataset.cellIndex = cellIndex - 1;
                AppState.currentBox.dataset.regionIndex = AppState.currentRegionIndex;
            } else {
                const regionIndex = AppState.regions.length + 1;
                label.textContent = 'Region ' + regionIndex;
                AppState.currentBox.dataset.regionIndex = AppState.regions.length;
            }

            AppState.currentBox.appendChild(label);

            // Add click handler to box
            AppState.currentBox.addEventListener('click', handleBoxClick);

            // Exit annotation mode
            exitAnnotationMode();

            // Open appropriate modal
            if (AppState.annotationType === 'cell') {
                // Store reference for later
                AppState.currentCellBox = AppState.currentBox;
                openModal('cellLevelModal');
            } else {
                // Store reference for later
                AppState.currentRegionBox = AppState.currentBox;
                openModal('regionLevelModal');
                updateRegionModalHeader();
            }
        } else {
            // Box too small, remove it
            AppState.currentBox.remove();
        }

        AppState.currentBox = null;
    }

    AppState.isDrawing = false;
    AppState.isDragging = false;
    DOM.wsiContainer.style.cursor = AppState.isAnnotating ? 'crosshair' : 'grab';
}

function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoom(delta, e.clientX, e.clientY);
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        if (AppState.isAnnotating) {
            exitAnnotationMode();
        } else if (AppState.activeModal) {
            closeModal(AppState.activeModal);
        }
    }
}

// ============================================
// ZOOM & PAN
// ============================================

function zoom(factor, centerX = null, centerY = null) {
    const oldScale = AppState.scale;
    AppState.scale *= factor;

    // Limit scale
    AppState.scale = Math.max(0.1, Math.min(10, AppState.scale));

    // Update zoom level display
    DOM.zoomLevel.textContent = Math.round(AppState.scale * 100) + '%';

    // Zoom towards mouse position if provided
    if (centerX !== null && centerY !== null) {
        const rect = DOM.wsiContainer.getBoundingClientRect();
        const mouseX = centerX - rect.left;
        const mouseY = centerY - rect.top;

        AppState.offsetX = mouseX - (mouseX - AppState.offsetX) * (AppState.scale / oldScale);
        AppState.offsetY = mouseY - (mouseY - AppState.offsetY) * (AppState.scale / oldScale);
    }

    renderWSI();
}

function resetView() {
    AppState.scale = 1;
    DOM.zoomLevel.textContent = '100%';
    centerImage();
    renderWSI();
}

// ============================================
// MODAL MANAGEMENT
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        AppState.activeModal = modalId;
        updateStatus('Vyplňte formulár');
        // Shift WSI container to the left so main image is fully visible
        if (DOM.wsiContainer) {
            DOM.wsiContainer.classList.add('modal-open');
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        if (AppState.activeModal === modalId) {
            AppState.activeModal = null;
        }

        // Reset editing state when closing modals
        if (modalId === 'regionLevelModal') {
            AppState.isEditingRegion = false;
            AppState.editingRegionIndex = -1;
            clearRegionForm();
        } else if (modalId === 'cellLevelModal') {
            AppState.isEditingCell = false;
            AppState.editingCellIndex = -1;
            clearCellForm();
        }

        // Remove WSI container shift when no modal is active
        if (DOM.wsiContainer && AppState.activeModal === null) {
            DOM.wsiContainer.classList.remove('modal-open');
        }

        updateStatus('Pripravené');
    }
}

// ============================================
// AUTOCOMPLETE
// ============================================

function initializeAutocomplete() {
    // Organ autocomplete
    setupAutocomplete('organSelect', 'organDropdown', Object.keys(ORGANS_DATA), (value) => {
        DOM.systemDisplay.value = ORGANS_DATA[value] || '';
        DOM.btnCaseSave.disabled = !value;
    });
}

function setupAutocomplete(inputId, dropdownId, options, onChange) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);

    if (!input || !dropdown) return;

    let selectedIndex = -1;

    // Input handler
    input.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        const filtered = options.filter(opt => opt.toLowerCase().includes(value));

        renderDropdown(dropdown, filtered, (selected) => {
            input.value = selected;
            dropdown.classList.remove('active');
            if (onChange) onChange(selected);
        });

        dropdown.classList.toggle('active', filtered.length > 0 && value.length > 0);
        selectedIndex = -1;
    });

    // Focus handler
    input.addEventListener('focus', () => {
        if (input.value.length === 0) {
            renderDropdown(dropdown, options, (selected) => {
                input.value = selected;
                dropdown.classList.remove('active');
                if (onChange) onChange(selected);
            });
            dropdown.classList.add('active');
        }
    });

    // Blur handler
    input.addEventListener('blur', () => {
        // Delay to allow click on dropdown
        setTimeout(() => {
            dropdown.classList.remove('active');
        }, 200);
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.autocomplete-option');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateHighlight(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateHighlight(items, selectedIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                items[selectedIndex].click();
            }
        }
    });
}

function renderDropdown(dropdown, options, onSelect) {
    dropdown.innerHTML = '';
    options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'autocomplete-option';
        div.textContent = opt;
        div.addEventListener('click', () => onSelect(opt));
        dropdown.appendChild(div);
    });
}

function updateHighlight(items, index) {
    items.forEach((item, i) => {
        item.classList.toggle('highlighted', i === index);
    });
    if (items[index]) {
        items[index].scrollIntoView({ block: 'nearest' });
    }
}

// ============================================
// ANNOTATION MODE
// ============================================

function startRegionAnnotation() {
    if (!AppState.caseData) {
        alert('Najprv vyplňte Case Level informácie!');
        openModal('caseLevelModal');
        return;
    }

    AppState.isAnnotating = true;
    AppState.annotationType = 'region';
    DOM.wsiContainer.classList.add('annotating');
    DOM.annotationOverlay.classList.remove('hidden');

    // Set dynamic text
    const modeLabel = document.getElementById('annotationModeLabel');
    if (modeLabel) modeLabel.textContent = 'Vyznačenie Regiónu';

    updateStatus('Kresli región...');
}

function startCellAnnotation() {
    if (!AppState.caseData) {
        alert('Najprv vyplňte Zvolenie organu (Case Level)!');
        openModal('caseLevelModal');
        return;
    }

    // If no regions exist, create a default "Global" region
    if (AppState.regions.length === 0) {
        const globalRegion = {
            description: 'Global / Unassigned',
            category: '',
            score: 0,
            comment: '',
            cells: [],
            boxElement: null // No visual box for global region
        };
        AppState.regions.push(globalRegion);
        AppState.currentRegionIndex = 0;
    }

    AppState.isAnnotating = true;
    AppState.annotationType = 'cell';
    DOM.wsiContainer.classList.add('annotating');
    DOM.annotationOverlay.classList.remove('hidden');

    // Set dynamic text
    const modeLabel = document.getElementById('annotationModeLabel');
    if (modeLabel) modeLabel.textContent = 'Vyznačenie Buniek';

    updateStatus('Kresli bunky...');
}

function exitAnnotationMode() {
    AppState.isAnnotating = false;
    DOM.wsiContainer.classList.remove('annotating');
    DOM.annotationOverlay.classList.add('hidden');
    // Text resets automatically on next start
    updateStatus('Pripravené');
}

// ============================================
// FORM HANDLERS
// ============================================

function saveCaseLevel() {
    const organ = DOM.organSelect.value;
    const system = DOM.systemDisplay.value;

    if (!organ) {
        alert('Vyberte orgán!');
        return;
    }

    AppState.caseData = {
        organ: organ,
        system: system,
        timestamp: new Date().toISOString()
    };

    closeModal('caseLevelModal');
    updateStatus('Case Level uložený');

    // Enable all annotation buttons
    DOM.btnAnnotate.disabled = false;
    DOM.btnCellAnnotate.disabled = false;
    DOM.btnShowAll.disabled = false;
}

function updateRegionModalHeader() {
    const label = document.getElementById('regionOrganLabel');
    if (label && AppState.caseData) {
        label.textContent = '• ' + AppState.caseData.organ;
    }
}

function handleCategoryChange() {
    const category = document.getElementById('regionCategory').value;
    const scoreFields = document.getElementById('regionScoreFields');
    const scoreLabel = document.getElementById('regionScoreLabel');

    if (category) {
        scoreFields.classList.remove('hidden');
        // Update label based on category
        const labels = {
            'tubular': 'Tubulárna diferenciácia – skóre:',
            'nuclear': 'Nukleárny pleomorfizmus – skóre:',
            'mitotic': 'Mitotický počet – skóre:'
        };
        scoreLabel.textContent = labels[category] || 'Skóre:';
    } else {
        scoreFields.classList.add('hidden');
    }
}

function saveRegionLevel() {
    const description = document.getElementById('regionDescription').value;
    const category = document.getElementById('regionCategory').value;
    const score = parseInt(document.querySelector('input[name="regionScore"]:checked')?.value) || 0;
    const comment = document.getElementById('regionComment').value;

    if (AppState.isEditingRegion) {
        // Update existing region
        const existingRegion = AppState.regions[AppState.editingRegionIndex];
        existingRegion.description = description;
        existingRegion.category = category;
        existingRegion.score = score;
        existingRegion.comment = comment;

        // Update box label
        if (existingRegion.boxElement) {
            const label = existingRegion.boxElement.querySelector('.box-label');
            if (label) {
                const categoryLabels = {
                    'tubular': 'Tubulárna dif.',
                    'nuclear': 'Nukl. pleom.',
                    'mitotic': 'Mitotický počet',
                    '': 'Región'
                };
                let displayText = categoryLabels[category] || (description ? description.substring(0, 15) : 'Región');
                label.textContent = displayText + ' ' + (AppState.editingRegionIndex + 1);
            }
        }

        // Reset editing state
        AppState.isEditingRegion = false;
        AppState.editingRegionIndex = -1;

        closeModal('regionLevelModal');
        clearRegionForm();
        updateNottinghamFromRegions();
        updateLiveScore();
        updateStatus('Region Level aktualizovaný');
    } else {
        // Create new region
        const regionData = {
            description: description,
            category: category,
            score: score,
            comment: comment,
            cells: [],
            boxElement: AppState.currentRegionBox
        };

        AppState.regions.push(regionData);
        AppState.currentRegionIndex = AppState.regions.length - 1;

        // Update label on box
        const box = AppState.currentRegionBox || (AppState.regions[AppState.editingRegionIndex] ? AppState.regions[AppState.editingRegionIndex].boxElement : null);
        if (box) {
            const label = box.querySelector('.box-label');
            if (label) {
                const categoryLabels = {
                    'tubular': 'Tubulárna dif.',
                    'nuclear': 'Nukl. pleom.',
                    'mitotic': 'Mitotický počet',
                    '': 'Región'
                };
                // Show category if selected, otherwise description or "Region X"
                let displayText = categoryLabels[category] || (description ? description.substring(0, 15) : 'Región');
                label.textContent = displayText + ' ' + (AppState.isEditingRegion ? (AppState.editingRegionIndex + 1) : AppState.regions.length);
            }
        }

        // Enable cell annotation
        DOM.btnCellAnnotate.disabled = false;

        closeModal('regionLevelModal');
        clearRegionForm();
        updateNottinghamFromRegions();
        updateLiveScore();
        updateStatus('Region Level uložený');
    }
}

function clearRegionForm() {
    document.getElementById('regionDescription').value = '';
    document.getElementById('regionCategory').value = '';
    document.querySelectorAll('input[name="regionScore"]').forEach(r => r.checked = false);
    document.getElementById('regionScoreFields').classList.add('hidden');
    document.getElementById('regionComment').value = '';
}

function saveCellLevel(continueAnnotating = false) {
    const cellType = document.getElementById('cellTypeSelect').value;
    const comment = document.getElementById('cellComment').value;

    const cellTypeLabels = {
        'mitoza': 'Mitóza',
        'jadierko': 'Jadierko',
        'tubularna': 'Tubul. f.',
        'ine': 'Iné'
    };
    const typeLabel = cellTypeLabels[cellType] || cellType;

    if (AppState.isEditingCell) {
        // Update existing cell
        const existingCell = AppState.regions[AppState.currentRegionIndex].cells[AppState.editingCellIndex];
        existingCell.cellType = cellType;
        existingCell.comment = comment;

        // Update box label
        if (existingCell.boxElement) {
            const label = existingCell.boxElement.querySelector('.box-label');
            if (label) {
                label.textContent = typeLabel + ' ' + (AppState.editingCellIndex + 1);
            }
        }

        // Reset editing state
        AppState.isEditingCell = false;
        AppState.editingCellIndex = -1;

        closeModal('cellLevelModal');
        clearCellForm();
        updateStatus('Cell Level aktualizovaný');
    } else {
        // Create new cell
        const cellData = {
            cellType: cellType,
            comment: comment,
            boxElement: AppState.currentCellBox
        };

        AppState.regions[AppState.currentRegionIndex].cells.push(cellData);

        // Update box label
        if (AppState.currentCellBox) {
            const label = AppState.currentCellBox.querySelector('.box-label');
            if (label) {
                const cellIndex = AppState.regions[AppState.currentRegionIndex].cells.length;
                label.textContent = typeLabel + ' ' + cellIndex;
            }
        }

        closeModal('cellLevelModal');
        clearCellForm();
        updateStatus('Cell Level uložený');

        // If "save & continue" was clicked, re-enter cell annotation mode
        if (continueAnnotating) {
            setTimeout(() => startCellAnnotation(), 100);
        }
    }
}

function clearCellForm() {
    document.getElementById('cellTypeSelect').value = 'mitoza';
    document.getElementById('cellComment').value = '';
}

// Scan all regions and extract the latest NGS scores into AppState.nottingham
function updateNottinghamFromRegions() {
    // Reset
    AppState.nottingham.tubules = 0;
    AppState.nottingham.nuclei = 0;
    AppState.nottingham.mitoses = 0;

    // Take the LAST scored region for each category
    AppState.regions.forEach(region => {
        if (region.score > 0) {
            if (region.category === 'tubular') AppState.nottingham.tubules = region.score;
            if (region.category === 'nuclear') AppState.nottingham.nuclei = region.score;
            if (region.category === 'mitotic') AppState.nottingham.mitoses = region.score;
        }
    });
}

// ============================================
// NOTTINGHAM GRADING SYSTEM
// ============================================

function calculateNottingham() {
    const { tubules, nuclei, mitoses } = AppState.nottingham;
    const total = tubules + nuclei + mitoses;
    const complete = tubules > 0 && nuclei > 0 && mitoses > 0;

    let grade = 0;
    let gradeLabel = '-';
    let description = '';

    if (complete) {
        if (total >= 3 && total <= 5) {
            grade = 1;
            gradeLabel = 'G1';
            description = 'Dobre diferencovaný (low grade)';
        } else if (total >= 6 && total <= 7) {
            grade = 2;
            gradeLabel = 'G2';
            description = 'Stredne diferencovaný (intermediate grade)';
        } else if (total >= 8 && total <= 9) {
            grade = 3;
            gradeLabel = 'G3';
            description = 'Zle diferencovaný (high grade)';
        }
    }

    return { total, complete, grade, gradeLabel, description };
}

function updateLiveScore() {
    const display = document.getElementById('liveScoreDisplay');
    if (!display) return;

    const valueSpan = display.querySelector('.live-score-value');
    const result = calculateNottingham();

    // Remove previous grade classes
    display.classList.remove('score-grade-1', 'score-grade-2', 'score-grade-3', 'score-incomplete');

    if (result.complete) {
        valueSpan.textContent = 'Skóre: ' + result.total + ' | ' + result.gradeLabel;
        display.classList.add('score-grade-' + result.grade);
    } else {
        // Show partial info
        const { tubules, nuclei, mitoses } = AppState.nottingham;
        const parts = [];
        if (tubules) parts.push('T:' + tubules);
        if (nuclei) parts.push('N:' + nuclei);
        if (mitoses) parts.push('M:' + mitoses);

        if (parts.length > 0) {
            valueSpan.textContent = 'Neúplné (' + parts.join(' ') + ')';
        } else {
            valueSpan.textContent = 'Neúplné skóre';
        }
        display.classList.add('score-incomplete');
    }
}

// ============================================
// BOX CLICK HANDLER
// ============================================

function handleBoxClick(e) {
    e.stopPropagation();
    const box = e.currentTarget;
    const regionIndex = parseInt(box.dataset.regionIndex);

    if (box.classList.contains('cell-box')) {
        // Cell box clicked - open Cell Level modal for editing
        const cellIndex = parseInt(box.dataset.cellIndex);
        if (AppState.regions[regionIndex] && AppState.regions[regionIndex].cells[cellIndex]) {
            const cellData = AppState.regions[regionIndex].cells[cellIndex];

            // Set editing state
            AppState.isEditingCell = true;
            AppState.editingCellIndex = cellIndex;
            AppState.currentRegionIndex = regionIndex;
            AppState.currentCellBox = box;

            // Populate form with existing data
            populateCellForm(cellData);

            // Open modal
            openModal('cellLevelModal');
        }
    } else {
        // Region box clicked - open Region Level modal for editing
        if (AppState.regions[regionIndex]) {
            const regionData = AppState.regions[regionIndex];

            // Set editing state
            AppState.isEditingRegion = true;
            AppState.editingRegionIndex = regionIndex;
            AppState.currentRegionIndex = regionIndex;
            AppState.currentRegionBox = box;

            // Populate form with existing data
            populateRegionForm(regionData);

            // Open modal
            openModal('regionLevelModal');
            updateRegionModalHeader();
        }
    }
}

// Populate Region Level form with existing data
function populateRegionForm(data) {
    document.getElementById('regionDescription').value = data.description || '';
    document.getElementById('regionCategory').value = data.category || '';
    document.getElementById('regionComment').value = data.comment || '';

    // Show score fields and set score
    if (data.category) {
        handleCategoryChange();
        if (data.score) {
            const radio = document.querySelector(`input[name="regionScore"][value="${data.score}"]`);
            if (radio) radio.checked = true;
        }
    }
}

// Populate Cell Level form with existing data
function populateCellForm(data) {
    document.getElementById('cellTypeSelect').value = data.cellType || 'mitoza';
    document.getElementById('cellComment').value = data.comment || '';
}

// ============================================
// FULL ANNOTATION SUMMARY
// ============================================

function showFullAnnotation() {
    const summaryContent = document.getElementById('summaryContent');
    summaryContent.innerHTML = '';

    // Case Level Summary
    if (AppState.caseData) {
        const caseSection = createSummarySection('📋 CASE LEVEL', 'case', [
            { label: 'Orgán', value: AppState.caseData.organ },
            { label: 'Systém', value: AppState.caseData.system }
        ]);
        summaryContent.appendChild(caseSection);
    }

    // Nottingham Score Summary
    const ngs = calculateNottingham();
    const ngsRows = [
        { label: 'Tubulárna dif.', value: AppState.nottingham.tubules || '—' },
        { label: 'Nukl. pleomorf.', value: AppState.nottingham.nuclei || '—' },
        { label: 'Mitotický počet', value: AppState.nottingham.mitoses || '—' },
        { label: 'Celkové skóre', value: ngs.complete ? ngs.total : 'Neúplné' },
        { label: 'Final Grade', value: ngs.complete ? (ngs.gradeLabel + ' – ' + ngs.description) : '—' }
    ];
    const ngsSection = createSummarySection('🏆 NOTTINGHAM GRADING', 'case', ngsRows);
    summaryContent.appendChild(ngsSection);

    // Region Level Summaries
    AppState.regions.forEach((region, index) => {
        const categoryLabels = {
            'tubular': 'Tubulárna diferenciácia',
            'nuclear': 'Nukleárny pleomorfizmus',
            'mitotic': 'Mitotický počet',
            '': 'Všeobecný'
        };

        const rows = [
            { label: 'Popis', value: region.description || '—' },
            { label: 'Kategória', value: categoryLabels[region.category] || 'Všeobecný' }
        ];

        if (region.score) {
            rows.push({ label: 'Skóre', value: region.score });
        }
        if (region.comment) {
            rows.push({ label: 'Komentár', value: region.comment });
        }

        const regionSection = createSummarySection(`📍 REGION ${index + 1}`, 'region', rows);
        summaryContent.appendChild(regionSection);

        // Cell Level for this region
        const cellTypeLabels = {
            'mitoza': 'Mitóza',
            'jadierko': 'Jadierko',
            'tubularna': 'Tubulárna formácia',
            'ine': 'Iné'
        };

        region.cells.forEach((cell, cellIndex) => {
            const cellRows = [
                { label: 'Typ', value: cellTypeLabels[cell.cellType] || cell.cellType }
            ];
            if (cell.comment) {
                cellRows.push({ label: 'Komentár', value: cell.comment });
            }

            const cellSection = createSummarySection(`🔬 CELL ${cellIndex + 1} (Region ${index + 1})`, 'cell', cellRows);
            summaryContent.appendChild(cellSection);
        });
    });

    if (!AppState.caseData && AppState.regions.length === 0) {
        summaryContent.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Žiadne anotácie zatiaľ...</p>';
    }

    openModal('summaryModal');
}

function createSummarySection(title, type, rows) {
    const section = document.createElement('div');
    section.className = 'summary-section';

    const header = document.createElement('div');
    header.className = 'summary-section-header';
    header.innerHTML = `<span class="level-badge ${type}">${title}</span>`;
    section.appendChild(header);

    const body = document.createElement('div');
    body.className = 'summary-section-body';

    rows.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'summary-row';
        rowEl.innerHTML = `<span class="summary-label">${row.label}</span><span class="summary-value">${row.value}</span>`;
        body.appendChild(rowEl);
    });

    section.appendChild(body);
    return section;
}

// ============================================
// SAVE & EXPORT
// ============================================

function saveAnnotation() {
    const clinicalComment = document.getElementById('clinicalComment').value;

    const ngs = calculateNottingham();
    const saveData = {
        caseLevel: AppState.caseData,
        nottingham: {
            tubules: AppState.nottingham.tubules,
            nuclei: AppState.nottingham.nuclei,
            mitoses: AppState.nottingham.mitoses,
            total: ngs.total,
            grade: ngs.gradeLabel,
            description: ngs.description
        },
        regions: AppState.regions.map(r => ({
            description: r.description,
            category: r.category,
            score: r.score,
            comment: r.comment,
            cells: r.cells.map(c => ({
                cellType: c.cellType,
                comment: c.comment
            }))
        })),
        clinicalComment: clinicalComment,
        savedTimestamp: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem('wsiAnnotation', JSON.stringify(saveData));

    updateStatus('Anotácia uložená');
    alert('Anotácia bola úspešne uložená!');
}

function exportAnnotation() {
    const clinicalComment = document.getElementById('clinicalComment').value;

    const ngs = calculateNottingham();
    const exportData = {
        caseLevel: AppState.caseData,
        nottingham: {
            tubules: AppState.nottingham.tubules,
            nuclei: AppState.nottingham.nuclei,
            mitoses: AppState.nottingham.mitoses,
            total: ngs.total,
            grade: ngs.gradeLabel,
            description: ngs.description
        },
        regions: AppState.regions.map(r => ({
            description: r.description,
            category: r.category,
            score: r.score,
            comment: r.comment,
            cells: r.cells.map(c => ({
                cellType: c.cellType,
                comment: c.comment
            }))
        })),
        clinicalComment: clinicalComment,
        exportTimestamp: new Date().toISOString()
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotation_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    updateStatus('Export dokončený');
}

// ============================================
// STATUS UPDATES
// ============================================

function updateStatus(text) {
    if (DOM.statusText) {
        DOM.statusText.textContent = text;
    }
}
