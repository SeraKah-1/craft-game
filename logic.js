let gameData = {}, unlocked = [], slots = [null, null];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('gamedata.json'); // Path direct
        gameData = await res.json();
        document.getElementById('topic-title').innerText = gameData.meta.topic;
        gameData.library.filter(c => c.tier === 0).forEach(c => {
            if(!unlocked.includes(c.id)) unlocked.push(c.id);
        });
        updateUI();
    } catch(e) { alert("Error loading JSON"); }
});

function updateUI() {
    renderGrid('inventory-grid', c => unlocked.includes(c.id) && c.tier === 0);
    renderGrid('library-grid', c => unlocked.includes(c.id) && c.tier > 0);
    [0, 1].forEach(i => {
        const el = document.getElementById(`slot-${i+1}`);
        if(slots[i]) {
            const c = getCard(slots[i]);
            el.innerHTML = `<img src="${c.image}">`;
            el.style.border = "2px solid #4caf50";
        } else {
            el.innerHTML = '<span class="placeholder-text">Select</span>';
            el.style.border = "2px dashed #a0a0a0";
        }
    });
    document.getElementById('discovery-count').innerText = `${unlocked.length}/${gameData.library.length}`;
}

function renderGrid(id, filterFn) {
    const el = document.getElementById(id);
    el.innerHTML = '';
    const items = gameData.library.filter(filterFn);
    if(items.length === 0 && id === 'library-grid') el.innerHTML = '<small>Empty</small>';
    items.forEach(c => {
        const d = document.createElement('div');
        d.className = 'card';
        d.innerHTML = `<img src="${c.image}"><div class="card-name">${c.name}</div>`;
        d.onclick = () => selectCard(c.id);
        el.appendChild(d);
    });
}

function selectCard(id) {
    if(!slots[0]) slots[0] = id;
    else if(!slots[1]) slots[1] = id;
    else return;
    updateUI();
}

function returnCard(i) { slots[i-1] = null; updateUI(); }

function attemptCombine() {
    if(!slots[0] || !slots[1]) return;
    const input = JSON.stringify([slots[0], slots[1]].sort());
    
    let result = null;
    for(let c of gameData.library) {
        if(c.recipes && c.recipes.some(r => JSON.stringify(r.sort()) === input)) {
            result = c; break;
        }
    }

    const log = document.getElementById('message-log');
    if(result) {
        if(!unlocked.includes(result.id)) unlocked.push(result.id);
        log.innerText = "Crafted: " + result.name;
        slots = [null, null];
        updateUI();
    } else {
        log.innerText = "Failed combination.";
        slots = [null, null];
        updateUI();
    }
}

function getCard(id) { return gameData.library.find(c => c.id === id); }
