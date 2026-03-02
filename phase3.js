/* ============================================================
   PHASE 3 – DYNAMIC ANNOTATION TEMPLATE
   phase3.js
   ============================================================ */
'use strict';

const P3_FRUITS = [
    'Banán', 'Ananás', 'Jablko', 'Hruška', 'Mango', 'Maracuja',
    'Pomaranč', 'Jahoda', 'Malina', 'Čerešne', 'Čučoriedky', 'Broskyňa', 'Kiwi'
];

const P3_SCHEMA = {
    'Banán': [
        { id: 'farba', label: 'Farba', options: ['Zelená', 'Zeleno-žltá', 'Žltá', 'Žltá s hnedými bodkami', 'Polohnedá so žltou', 'Úplne hnedá', 'Čierna'] },
        { id: 'zrelost', label: 'Čerstvosť / Zrelosť', options: ['Nezrelý (tvrdý)', 'Ideálne zrelý', 'Prezretý (mäkký)', 'Hnijúci'] },
        { id: 'pocet', label: 'Počet', type: 'bunch' },
        { id: 'povrch', label: 'Povrch', options: ['Hladký', 'Lesklý', 'Matný', 'Poškodená šupka', 'Otlačený'] },
        { id: 'velkost', label: 'Veľkosť', options: ['Mini (baby banán)', 'Štandardný', 'Extra dlhý'] },
    ],
    'Ananás': [
        { id: 'farba', label: 'Farba plodu', options: ['Hnedo-žltá', 'Zelená (nezrelý)', 'Zlatisto-oranžová', 'Sivastá'] },
        { id: 'struktura', label: 'Štruktúra povrchu', options: ['Šesťuholníkové šupiny', 'Ostré výčnelky', 'Hladký (olúpaný)'] },
        { id: 'koruna', label: 'Listová koruna', options: ['Prítomná (zelená)', 'Prítomná (suchá/hnedá)', 'Odstránená', 'Poškodená'] },
        { id: 'stav', label: 'Stav', options: ['Celý plod', 'Plátky (krúžky)', 'Kúsky (kocky)'] },
        { id: 'velkost', label: 'Veľkosť', options: ['Extra malý (baby)', 'Stredný', 'Veľký (nad 2kg)'] },
    ],
    'Jablko': [
        { id: 'farba', label: 'Farba', options: ['Jednofarebná červená', 'Jasne zelená', 'Žltá', 'Červeno-zelená (žíhaná)', 'Vyblednutá'] },
        { id: 'supka', label: 'Typ šupky', options: ['Hladká', 'Voskovaná', 'Drsná', 'S hnedými fľakmi (chrastavitosť)'] },
        { id: 'stav', label: 'Stav', options: ['Celé', 'Rozrezané', 'Ohryzené', 'S listom', 'So stopkou', 'Bez stopky'] },
        { id: 'tvar', label: 'Tvar', options: ['Symetrický', 'Deformovaný', 'Sploštený'] },
        { id: 'velkost', label: 'Veľkosť', options: ['Malé (detské)', 'Stredné', 'Veľké'] },
    ],
    'Hruška': [
        { id: 'farba', label: 'Farba', options: ['Svetlozelená', 'Sýtozelená', 'Žltá', 'Hnedo-hrdzavá'] },
        { id: 'tvar', label: 'Tvar tela', options: ['Klasický hruškovitý', 'Štíhly a chudý', 'Guľatý', 'Asymetrický'] },
        { id: 'stav', label: 'Stav', options: ['Pevná (nezrelá)', 'Mäkká (zrelá)', 'Nahnité miesto (prezretá – hnedý fľak)', 'S listom', 'Bez listu'] },
        { id: 'velkost', label: 'Veľkosť', options: ['Miniatúrna', 'Štandardná', 'Nadrozmerná'] },
    ],
    'Mango': [
        { id: 'farba', label: 'Odtieň šupky', options: ['Sýtozelená', 'Žlto-oranžová', 'Červeno-zelená', 'Bordová', 'Čierna (hnijúca)'] },
        { id: 'tvar', label: 'Tvar', options: ['Oválny', 'Obličkovitý', 'Guľatý'] },
        { id: 'konzistencia', label: 'Konzistencia na pohľad', options: ['Lesklá a napnutá', 'Zvráskavená (prezreté)', 'Vytečená šťava'] },
        { id: 'rez', label: 'Rez', options: ['Celé', 'Prerezané s viditeľnou plochou kôstkou', 'Nakrájané na „ježka"'] },
    ],
    'Maracuja': [
        { id: 'farba', label: 'Farba povrchu', options: ['Tmavofialová', 'Žltá (zlatá)', 'Hnedastá'] },
        { id: 'supka', label: 'Vzhľad šupky', options: ['Hladká (čerstvá)', 'Extrémne zvráskavená (zrelá)', 'Popraskaná'] },
        { id: 'vnutro', label: 'Vnútro (ak prerezaná)', options: ['Žltý rôsol so semenami', 'Vyschnuté vnútro', 'Prázdna dutina'] },
    ],
    'Pomaranč': [
        { id: 'supka', label: 'Typ šupky', options: ['Hrubá (pórovitá)', 'Tenká (hladká)', 'So zvyškami stopky'] },
        { id: 'farba', label: 'Farba', options: ['Jasnooranžová', 'Svetložltá', 'Červenkastá (krvavý pomaranč)'] },
        { id: 'stav', label: 'Stav', options: ['Celý', 'Prerezaný (priečny rez)', 'Prerezaný (pozdĺžny rez)', 'Mesiačiky'] },
        { id: 'semena', label: 'Počet semien (ak prerezaný)', options: ['Bez semien', '1–3 semená', 'Viac ako 3 semená'] },
    ],
    'Jahoda': [
        { id: 'farba', label: 'Farba', options: ['Svetločervená', 'Sýtočervená', 'Tmavočervená (vínová)', 'Zelenkastá pri stopke'] },
        { id: 'povrch', label: 'Povrch', options: ['S viditeľnými semiačkami', 'Hladká', 'Mäkká', 'Vyschnutá'] },
        { id: 'prislusenstvo', label: 'Príslušenstvo', options: ['So zelenými lístkami', 'Bez lístkov', 'S bielou stopkou'] },
        { id: 'tvar', label: 'Tvar', options: ['Kužeľovitý', 'Srdcovitý', 'Dvojitý (zrastený)', 'Guľatý'] },
    ],
    'Malina': [
        { id: 'typ', label: 'Typ', options: ['Samostatná bobuľa', 'Trs (viacero spojených na vetvičke)'] },
        { id: 'vnutro', label: 'Vnútro', options: ['Duté (stiahnuté z lôžka)', 'S bielym lôžkom (nezrelá)'] },
        { id: 'farba', label: 'Farba', options: ['Ružová', 'Svetločervená', 'Tmavočervená', 'Čierna (ostružina-like)'] },
        { id: 'povrch', label: 'Povrch', options: ['Jemné chĺpky (trichómy)', 'Hladký', 'Mokrý', 'Plesnivý'] },
    ],
    'Čerešne': [
        { id: 'farba', label: 'Farba', options: ['Jasnočervená', 'Tmavočervená', 'Čierno-červená', 'Žlto-ružová'] },
        { id: 'usporiadanie', label: 'Usporiadanie', options: ['Samostatná bobuľa', 'Dvojičky (spojená stopka)', 'Trojičky', 'Trs na vetvičke'] },
        { id: 'prislusenstvo', label: 'Príslušenstvo', options: ['So zelenou stopkou', 'Bez stopky', 'S listom'] },
        { id: 'stav', label: 'Stav', options: ['Napnutá šupka', 'Prasknutá', 'Vysušená', 'Červivá'] },
    ],
    'Čučoriedky': [
        { id: 'farba', label: 'Farba', options: ['Svetlomodrá', 'Tmavo fialová', 'Čierna', 'Inovatá (biely povlak)'] },
        { id: 'mnozstvo', label: 'Množstvo (odhad)', options: ['1–5 kusov', '5–10 kusov', '10–20 kusov', 'Viac ako 20 kusov', 'Viac ako 50 kusov'] },
        { id: 'umiestnenie', label: 'Umiestnenie', options: ['Voľne na ploche', 'V miske (keramická)', 'V miske (plastová)', 'V boxe'] },
        { id: 'kvalita', label: 'Kvalita', options: ['Pevné', 'Scvrknuté', 'Pustili šťavu'] },
    ],
    'Broskyňa': [
        { id: 'farba_vonk', label: 'Farba šupky (vonkajšia)', options: ['Oranžová', 'Žlto-oranžová', 'Červeno-žltá', 'Sýtočervená', 'Zelenkavo-žltá (nezrelá)'] },
        { id: 'povrch', label: 'Povrch', options: ['Zamatový (chĺpkatý)', 'Hladký', 'Zvráskavený', 'Lesklý', 'Matný', 'Otlačený (mäkké hnedé miesto)'] },
        { id: 'stav', label: 'Stav', options: ['Celá', 'Rozrezaná na polovicu', 'Štvrtina', 'Mesiačik', 'Deformovaná'] },
        { id: 'jadro', label: 'Jadro (Kôstka)', options: ['Viditeľné jadro', 'Odstránené jadro', 'Rozbité jadro', 'Chýbajúce (len jamka)', 'Prasknuté vo vnútri'] },
        { id: 'farba_vnut', label: 'Farba dužiny (vnútorná)', options: ['Žltá', 'Biela', 'Červenkastá pri kôstke', 'Hnedastá'] },
    ],
    'Kiwi': [
        { id: 'farba', label: 'Farba povrchu', options: ['Hnedá', 'Svetlohnedá', 'Zeleno-hnedá'] },
        { id: 'povrch', label: 'Povrch', options: ['Chĺpkatý (vlasatý)', 'Hladký', 'Zvráskavený (scvrknuté)'] },
        { id: 'stav', label: 'Stav', options: ['Celé', 'Prerezané na polovicu', 'Nakrájané na kolieska'] },
        { id: 'vnutro', label: 'Vnútro (ak je prerezané)', options: ['Jasnozelené', 'Žlté', 'Biele (stredová časť)'] },
        { id: 'semena', label: 'Semená', options: ['Viditeľné (čierne bodky)', 'Neviditeľné'] },
        { id: 'velkost', label: 'Veľkosť', options: ['Malé', 'Štandardné', 'Veľké'] },
    ],
};

// ============================================================
// HELPERS
// ============================================================

function _el(tag, cls) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
}

function _heading(parent, text) {
    const h = _el('div', 'p3-label');
    h.textContent = text;
    parent.appendChild(h);
}

function _chip(row, label, active, onClick) {
    const c = _el('button', 'p3-chip' + (active ? ' active' : ''));
    c.type = 'button';
    c.textContent = label;
    c.addEventListener('click', () => {
        row.querySelectorAll('.p3-chip').forEach(ch => ch.classList.remove('active'));
        c.classList.add('active');
        onClick();
    });
    row.appendChild(c);
    return c;
}

function _removeAfter(container, pivot) {
    let found = false;
    Array.from(container.children).forEach(child => {
        if (found) child.remove();
        if (child === pivot) found = true;
    });
}

function ensureData(ann) {
    if (!ann.p3) {
        ann.p3 = { objectType: null, surfaceType: null, bowlFull: null, fruit: null, fields: {} };
    }
    return ann.p3;
}

// ============================================================
// STEP 1 – OBJECT TYPE
// ============================================================

function p3RenderBody(ann, container) {
    container.innerHTML = '';
    const d = ensureData(ann);
    _renderTypeStep(ann, container, d);
}

function _renderTypeStep(ann, container, d) {
    const wrap = _el('div', 'p3-step');
    _heading(wrap, 'Čo ste označili?');
    const row = _el('div', 'p3-type-row');

    const mkTypeBtn = (label, key) => {
        const b = _el('button', 'p3-type-btn' + (d.objectType === key ? ' active' : ''));
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', () => {
            d.objectType = key;
            d.surfaceType = null; d.bowlFull = null; d.fruit = null; d.fields = {};
            _removeAfter(container, wrap);
            row.querySelectorAll('.p3-type-btn').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            if (key === 'fruit') _renderFruitSelector(ann, container, d, false);
            else _renderSurfaceStep(ann, container, d);
        });
        row.appendChild(b);
    };

    mkTypeBtn('🍎 Ovocie', 'fruit');
    mkTypeBtn('📦 Plocha / Objekt', 'surface');
    wrap.appendChild(row);
    container.appendChild(wrap);

    // Restore sub-steps if already set
    if (d.objectType === 'fruit') _renderFruitSelector(ann, container, d, false);
    else if (d.objectType === 'surface') _renderSurfaceStep(ann, container, d);
}

// ============================================================
// SURFACE FLOW
// ============================================================

function _renderSurfaceStep(ann, container, d) {
    const wrap = _el('div', 'p3-step');
    _heading(wrap, 'Typ plochy / objektu');
    const row = _el('div', 'p3-chips-row');

    [['🪵 Polica', 'polica'], ['🪑 Stôl', 'stol'], ['🥣 Miska', 'miska']].forEach(([lbl, key]) => {
        _chip(row, lbl, d.surfaceType === key, () => {
            d.surfaceType = key; d.bowlFull = null; d.fruit = null; d.fields = {};
            _removeAfter(container, wrap);
            if (key === 'miska') _renderBowlStep(ann, container, d);
        });
    });
    wrap.appendChild(row);
    container.appendChild(wrap);

    if (d.surfaceType === 'miska') _renderBowlStep(ann, container, d);
}

function _renderBowlStep(ann, container, d) {
    const wrap = _el('div', 'p3-step');
    _heading(wrap, 'Je miska plná?');
    const row = _el('div', 'p3-chips-row');

    _chip(row, '✅ Plná', d.bowlFull === true, () => {
        d.bowlFull = true; d.fruit = null; d.fields = {};
        _removeAfter(container, wrap);

        const instrWrap = _el('div', 'p3-step');
        const alertMsg = _el('div', 'p3-label');
        alertMsg.style.color = '#f59e0b';
        alertMsg.innerHTML = '✏️ Teraz nakreslite na obrázku rámik okolo ovocia v miske.';
        instrWrap.appendChild(alertMsg);
        container.appendChild(instrWrap);

        // Trigger draw mode for the next box
        const btnMark = document.getElementById('btnAnnotate');
        if (btnMark && !btnMark.classList.contains('annotating-active')) {
            window.pendingAutoFruit = true;
            btnMark.click();
        } else if (btnMark && btnMark.classList.contains('annotating-active')) {
            // Edge case: already annotating
            window.pendingAutoFruit = true;
        }
    });
    _chip(row, '⬜ Prázdna', d.bowlFull === false, () => {
        d.bowlFull = false; d.fruit = null; d.fields = {};
        _removeAfter(container, wrap);
    });
    wrap.appendChild(row);
    container.appendChild(wrap);

    if (d.bowlFull === true) {
        const instrWrap = _el('div', 'p3-step');
        const alertMsg = _el('div', 'p3-label');
        alertMsg.style.color = '#10b981';
        alertMsg.innerHTML = '✓ Vyzvali sme vás označiť ovocie – ovocie má vlastný zoznam vlastností.';
        instrWrap.appendChild(alertMsg);
        container.appendChild(instrWrap);
    }
}

// ============================================================
// FRUIT SELECTOR (searchable combobox)
// ============================================================

function _renderFruitSelector(ann, container, d, isBowl) {
    const wrap = _el('div', 'p3-step');
    _heading(wrap, isBowl ? 'Aké ovocie je v miske?' : 'Druh ovocia');

    const cbWrap = _el('div', 'p3-combobox');
    const input = _el('input', 'p3-search');
    input.type = 'text';
    input.placeholder = 'Zadajte alebo vyberte ovocie...';
    input.autocomplete = 'off';
    input.value = d.fruit || '';

    const dropdown = _el('ul', 'p3-dropdown');
    dropdown.style.display = 'none';
    cbWrap.appendChild(input);
    cbWrap.appendChild(dropdown);

    const populate = (filter) => {
        dropdown.innerHTML = '';
        const list = P3_FRUITS.filter(f => f.toLowerCase().includes(filter.toLowerCase()));
        if (!list.length) { dropdown.style.display = 'none'; return; }
        list.forEach(fruit => {
            const li = _el('li', 'p3-option' + (fruit === d.fruit ? ' selected' : ''));
            li.textContent = fruit;
            li.addEventListener('mousedown', e => {
                e.preventDefault();
                if (d.fruit !== fruit) { d.fruit = fruit; d.fields = {}; }
                input.value = fruit;
                dropdown.style.display = 'none';
                _removeAfter(container, wrap);
                _renderFruitFields(ann, container, d);
            });
            dropdown.appendChild(li);
        });
        dropdown.style.display = 'block';
    };

    input.addEventListener('focus', () => populate(input.value));
    input.addEventListener('input', () => populate(input.value));
    input.addEventListener('blur', () => setTimeout(() => { dropdown.style.display = 'none'; }, 160));

    wrap.appendChild(cbWrap);
    container.appendChild(wrap);

    if (d.fruit) _renderFruitFields(ann, container, d);
}

// ============================================================
// FRUIT FIELDS
// ============================================================

function _renderFruitFields(ann, container, d) {
    const schema = P3_SCHEMA[d.fruit];
    if (!schema) return;
    schema.forEach(field => {
        const wrap = _el('div', 'p3-step');
        _heading(wrap, field.label);
        if (field.type === 'bunch') _renderBunch(wrap, d, field.id);
        else _renderChips(wrap, d, field);
        container.appendChild(wrap);
    });
}

function _renderChips(wrap, d, field) {
    const row = _el('div', 'p3-chips-row');
    field.options.forEach(opt => {
        _chip(row, opt, d.fields[field.id] === opt, () => { d.fields[field.id] = opt; });
    });
    wrap.appendChild(row);
}

function _renderBunch(wrap, d, fieldId) {
    const cur = d.fields[fieldId] || '';
    const isTrs = cur.startsWith('Trs');

    const row = _el('div', 'p3-chips-row');

    // Single chip
    _chip(row, '1 kus', cur === '1 kus', () => {
        d.fields[fieldId] = '1 kus';
        const sub = wrap.querySelector('.p3-bunch-sub');
        if (sub) sub.remove();
    });

    // Trs chip
    _chip(row, 'Trs', isTrs, () => {
        d.fields[fieldId] = d.fields[fieldId] && d.fields[fieldId].startsWith('Trs') ? d.fields[fieldId] : 'Trs';
        if (!wrap.querySelector('.p3-bunch-sub')) _addBunchSub(wrap, d, fieldId);
    });

    wrap.appendChild(row);
    if (isTrs) _addBunchSub(wrap, d, fieldId);
}

function _addBunchSub(wrap, d, fieldId) {
    const sub = _el('div', 'p3-bunch-sub');
    const subRow = _el('div', 'p3-chips-row');
    _el('span', 'p3-bunch-label');
    const cur = d.fields[fieldId] || '';

    [2, 3, 4, 5, '6+'].forEach(n => {
        const val = `Trs (${n} ks)`;
        _chip(subRow, `${n} ks`, cur === val, () => { d.fields[fieldId] = val; });
    });
    sub.appendChild(subRow);
    wrap.appendChild(sub);
}

// ============================================================
// SAVE
// ============================================================

function p3Save(ann, container) {
    const d = ensureData(ann);
    // capture any typed fruit name
    const inp = container.querySelector('.p3-search');
    if (inp && P3_FRUITS.includes(inp.value)) { d.fruit = inp.value; }
    ann.text = _summary(d);
}

function _summary(d) {
    if (!d.objectType) return '';
    if (d.objectType === 'surface') {
        let s = d.surfaceType || 'Plocha';
        if (d.surfaceType === 'miska') {
            s += d.bowlFull ? ' (plná)' : ' (prázdna)';
            if (d.bowlFull && d.fruit) s += ` – ${d.fruit}`;
        }
        return s;
    }
    if (!d.fruit) return 'Ovocie';
    return [d.fruit, ...Object.values(d.fields).filter(Boolean)].join(' | ');
}

// ============================================================
// EXPORT
// ============================================================

window.Phase3 = { renderBody: p3RenderBody, save: p3Save };
