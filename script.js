const entryScreen = document.getElementById("entryScreen");
const boardScreen = document.getElementById("boardScreen");
const timeInput = document.getElementById("timeInput");
const delayInput = document.getElementById("delayInput");
const trainInput = document.getElementById("trainInput");
const destinationInput = document.getElementById("destinationInput");
const platformInput = document.getElementById("platformInput");
const trackInput = document.getElementById("trackInput");
const addButton = document.getElementById("addButton");
const entryList = document.getElementById("entryList");
const departures = document.getElementById("departures");

let departuresData = JSON.parse(localStorage.getItem("trainDepartures") || "[]");
const END_TIME = 18 * 60 + 59;

function createPlannedId(train, time, destination) {
    const clean = value => String(value).toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
    return `planned-${clean(train)}-${time.replace(":", "")}-${clean(destination)}`;
}

function addPlanned(result, time, train, destination) {
    const [h, m] = time.split(":").map(Number);
    if (h * 60 + m > END_TIME) return;
    result.push({
        id: createPlannedId(train, time, destination),
        planned: true, time, delay: "0", train, destination,
        platform: "", track: ""
    });
}

function addEveryMinutes(result, h, m, interval, train, destination) {
    let minutes = h * 60 + m;
    while (minutes <= END_TIME) {
        addPlanned(result,
            String(Math.floor(minutes / 60)).padStart(2, "0") + ":" +
            String(minutes % 60).padStart(2, "0"),
            train, destination);
        minutes += interval;
    }
}

function generatePlannedDepartures() {
    const result = [];
    const weekend = [0, 6].includes(new Date().getDay());

    if (!weekend) {
        addEveryMinutes(result,14,12,20,"AND S1","Starý Lízátkov");
        addEveryMinutes(result,14,15,20,"AND S1","Ana-Pralesov - Ana-Ansko");
        addEveryMinutes(result,14,26,30,"AND S14","Snovín - Velkoplochovice - Svíčkov");
        addEveryMinutes(result,14,13,30,"AND S15","Ulrychov - Habže - Filíkov - Silininky");
        addEveryMinutes(result,14,30,60,"AND S25","Trnkov - Maďaryn");
        addEveryMinutes(result,15,0,60,"AND S25","Mazi");
        addPlanned(result,"16:31","AND S7","Ana-Pralesov - Hambrovce - Azilka");
        addPlanned(result,"18:31","AND S7","Ana-Pralesov - Hambrovce - Azilka");
        addEveryMinutes(result,14,3,60,"AND R1","Křečíkov-Alfonsovice - Křečkov hl.n.");
        addEveryMinutes(result,14,58,60,"AND S15","Ulrychov - Habže - Silininky");
        addEveryMinutes(result,14,4,60,"RJET R56","Osady u Maďarynu - Praha hl.n.");
        addEveryMinutes(result,14,4,60,"RJET R56","Ana-Pralesov");
        addEveryMinutes(result,15,13,120,"AND R77","Niryny - Štěpánov");
        addEveryMinutes(result,14,20,60,"RJET R4","Vícmanice - Gorzów Wielkopolski");
        addEveryMinutes(result,14,17,60,"AND Sp27","Svíčkov - Žábry");
        addEveryMinutes(result,14,23,60,"AND S92","Lamov - Niryny");
    } else {
        addEveryMinutes(result,10,12,20,"AND S1","Starý Lízátkov");
        addEveryMinutes(result,10,15,20,"AND S1","Ana-Pralesov - Ana-Ansko");
        addPlanned(result,"18:31","AND S7","Ana-Pralesov - Hambrovce - Azilka");
        addEveryMinutes(result,10,3,60,"AND R1","Křečíkov-Alfonsovice - Křečkov hl.n.");
        addEveryMinutes(result,10,28,60,"AND S15","Ulrychov - Habže - Filíkov - Silininky");
        addEveryMinutes(result,10,58,60,"AND S15","Ulrychov - Habže - Silininky");
        addEveryMinutes(result,10,4,120,"RJET R56","Osady u Maďarynu - Praha hl.n.");
        addEveryMinutes(result,11,4,120,"RJET R56","Ana-Pralesov");
        addEveryMinutes(result,11,13,120,"AND R77","Niryny - Štěpánov");
        addEveryMinutes(result,10,56,60,"AND S14","Snovín - Velkoplochovice - Svíčkov");
        addEveryMinutes(result,10,17,120,"AND Sp27","Svíčkov - Žábry");
        addEveryMinutes(result,11,17,120,"AND Sp27","Svíčkov");

        for (let t = 10 * 60 + 30; t <= END_TIME; t += 60) {
            if (t !== 12 * 60 + 30 && t !== 15 * 60 + 30)
                addPlanned(result, String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0"), "AND S25", "Trnkov - Maďaryn");
        }
        addPlanned(result,"12:30","AND S25","Mazi");
        addPlanned(result,"15:30","AND S25","Mazi");
        addEveryMinutes(result,10,23,120,"AND S92","Lamov - Niryny");
        addEveryMinutes(result,10,20,120,"RJET R4","Vícmanice - Gorzów Wielkopolski");
    }
    return result;
}

function delayToMinutes(delay) {
    const match = String(delay ?? "").match(/\d+/);
    return match ? Math.max(0, parseInt(match[0], 10)) : 0;
}

function timeToMinutes(time) {
    const p = String(time).split(":").map(Number);
    return (p[0] || 0) * 60 + (p[1] || 0);
}

function effectiveTime(item) {
    return timeToMinutes(item.time) + delayToMinutes(item.delay);
}

function applyPlannedOverrides(data) {
    const overrides = JSON.parse(localStorage.getItem("plannedOverrides") || "{}");
    return data.map(item => overrides[item.id] ? {...item, ...overrides[item.id]} : item);
}

function getAllDepartures() {
    return [...applyPlannedOverrides(generatePlannedDepartures()), ...departuresData];
}

function getActiveDepartures() {
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    return getAllDepartures().filter(item => effectiveTime(item) >= current);
}

function sortDepartures(data) {
    return [...data].sort((a,b) => effectiveTime(a) - effectiveTime(b));
}

function saveData() {
    localStorage.setItem("trainDepartures", JSON.stringify(departuresData));
}

function addDeparture() {
    if (!timeInput.value || !trainInput.value.trim() || !destinationInput.value.trim()) {
        alert("Vyplň čas, linku/číslo vlaku a směr.");
        return;
    }
    departuresData.push({
        id: `manual-${Date.now()}`, planned:false,
        time: timeInput.value, delay: delayInput.value.trim() || "0",
        train: trainInput.value.trim(), destination: destinationInput.value.trim(),
        platform: platformInput.value.trim(), track: trackInput.value.trim()
    });
    saveData(); renderAll();
    delayInput.value = trainInput.value = destinationInput.value = platformInput.value = trackInput.value = "";
    setDefaultTime();
}

function updateDeparture(id, field, value) {
    if (!["delay","platform","track"].includes(field)) return;
    const item = departuresData.find(x => x.id === id);
    if (!item) return;
    item[field] = value; saveData(); renderAll();
}

function updatePlannedDeparture(id, field, value) {
    if (!["delay","platform","track"].includes(field)) return;
    const overrides = JSON.parse(localStorage.getItem("plannedOverrides") || "{}");
    overrides[id] ||= {};
    overrides[id][field] = value;
    localStorage.setItem("plannedOverrides", JSON.stringify(overrides));
    renderAll();
}

function deleteDeparture(id) {
    departuresData = departuresData.filter(x => x.id !== id);
    saveData(); renderAll();
}

function renderEntryList() {
    if (!entryList) return;
    entryList.innerHTML = "";
    sortDepartures(getActiveDepartures()).forEach(item => {
        const row = document.createElement("div");
        row.className = "entry-item";
        row.innerHTML = `
            <div class="entry-time">${escapeHtml(item.time)}</div>
            <div class="entry-train">${escapeHtml(item.train)}</div>
            <div class="entry-destination">${escapeHtml(item.destination)}</div>
            <input type="text" placeholder="zpoždění" value="${escapeHtml(item.delay || "")}" data-field="delay">
            <input type="text" placeholder="nást." value="${escapeHtml(item.platform || "")}" data-field="platform">
            <input type="text" placeholder="kolej" value="${escapeHtml(item.track || "")}" data-field="track">
            <button class="delete-button" type="button">×</button>`;
        row.querySelectorAll("input").forEach(input => input.addEventListener("change", () => {
            item.planned ? updatePlannedDeparture(item.id,input.dataset.field,input.value)
                         : updateDeparture(item.id,input.dataset.field,input.value);
        }));
        row.querySelector(".delete-button").addEventListener("click", () => {
            if (item.planned) {
                const overrides = JSON.parse(localStorage.getItem("plannedOverrides") || "{}");
                delete overrides[item.id];
                localStorage.setItem("plannedOverrides", JSON.stringify(overrides));
                renderAll();
            } else deleteDeparture(item.id);
        });
        entryList.appendChild(row);
    });
}

function renderBoard() {
    if (!departures) return;
    departures.innerHTML = "";
    sortDepartures(getActiveDepartures()).slice(0,8).forEach(item => {
        const row = document.createElement("div");
        row.className = "departure";
        const delay = delayToMinutes(item.delay);
        row.innerHTML = `
            <div class="departure-time">${escapeHtml(item.time)}</div>
            <div class="departure-train">${escapeHtml(item.train)}</div>
            <div class="departure-destination">${escapeHtml(item.destination)}</div>
            <div class="departure-delay ${delay ? "departure-delayed" : "departure-on-time"}">
                ${delay ? `+${delay} minut` : "Včas"}
            </div>
            <div class="departure-platform">${escapeHtml(item.platform || "-")}</div>
            <div class="departure-track">${escapeHtml(item.track || "-")}</div>`;
        departures.appendChild(row);
    });
    if (!departures.children.length) departures.innerHTML = `<div class="no-departures">Žádné další odjezdy</div>`;
}

function renderAll() {
    renderEntryList();
    renderBoard();
}

function updateClocks() {
    const now = new Date();
    const time = [now.getHours(),now.getMinutes(),now.getSeconds()]
        .map((x,i) => String(x).padStart(2,"0")).join(":");
    const clock = document.getElementById("clock");
    if (clock) clock.textContent = time;
    document.querySelectorAll(".clock").forEach(x => x.textContent = time);
}

function toggleScreen() {
    entryScreen.classList.toggle("hidden");
    boardScreen.classList.toggle("hidden");
    renderAll();
}

function setDefaultTime() {
    const now = new Date();
    if (timeInput) timeInput.value = String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
}

function escapeHtml(value) {
    return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

if (addButton) addButton.addEventListener("click", addDeparture);
document.addEventListener("keydown", e => {
    if (e.key === "*") { e.preventDefault(); toggleScreen(); }
});

setDefaultTime();
renderAll();
updateClocks();

setInterval(() => {
    updateClocks();
    renderBoard();
    renderEntryList();
}, 1000);
