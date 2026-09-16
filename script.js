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

let departuresData = JSON.parse(
localStorage.getItem("trainDepartures") || "[]"
);

/* =========================================
PLÁNOVANÉ PRACOVNÍ ODJEZDY
========================================= */

const plannedDepartures = [
// AND S7 – pouze uvedené časy
{
operator: "AND",
train: "S7",
destination: "Ana-Pralesov - Hambrovce - Azilka",
times: ["16:31", "18:31", "21:31", "22:31"]
},

```
// AND R1 – každou hodinu
{
    operator: "AND",
    train: "R1",
    destination: "Trnkov - Křečíkov - Alfonsovice - Křečkov hl.n.",
    start: "14:03",
    interval: 60
},

// AND S15 – přes Filíkov – každých 30 minut
{
    operator: "AND",
    train: "S15",
    destination: "Ulrychov - Habže - Filíkov - Silininky",
    start: "14:13",
    interval: 30
},

// AND S15 – bez Filíkova – každou hodinu
{
    operator: "AND",
    train: "S15",
    destination: "Ulrychov - Habže - Silininky",
    start: "14:58",
    interval: 60
},

// RJET R56 – Ana-Pralesov – každou hodinu
{
    operator: "RJET",
    train: "R56",
    destination: "Ana-Pralesov",
    start: "14:04",
    interval: 60
},

// RJET R56 – Praha hl.n. – každou hodinu
{
    operator: "RJET",
    train: "R56",
    destination: "Osady u Maďarynu - Praha hl.n.",
    start: "14:04",
    interval: 60
},

// AND R77 – každé 2 hodiny
{
    operator: "AND",
    train: "R77",
    destination: "Niryny - Štěpánov",
    start: "15:13",
    interval: 120
},

// AND S1 – Starý Lízátkov – každých 20 minut
{
    operator: "AND",
    train: "S1",
    destination: "Starý Lízátkov",
    start: "14:12",
    interval: 20
},

// AND S1 – Ana-Pralesov - Ana-Ansko – každých 20 minut
{
    operator: "AND",
    train: "S1",
    destination: "Ana-Pralesov - Ana-Ansko",
    start: "14:15",
    interval: 20
}
```

];

/* =========================================
VYTVOŘENÍ PLÁNOVANÝCH ODJEZDŮ
========================================= */

function timeToMinutes(time) {
const [hours, minutes] = time.split(":").map(Number);
return hours * 60 + minutes;
}

function minutesToTime(minutes) {
const hours = Math.floor(minutes / 60);
const mins = minutes % 60;

```
return (
    String(hours).padStart(2, "0") +
    ":" +
    String(mins).padStart(2, "0")
);
```

}

function generatePlannedDepartures() {
const generated = [];

```
plannedDepartures.forEach((plan) => {

    // Ručně zadané časy – S7
    if (plan.times) {
        plan.times.forEach((time) => {
            generated.push({
                time,
                delay: "",
                train: `${plan.operator} ${plan.train}`,
                destination: plan.destination,
                platform: "",
                track: "",
                planned: true
            });
        });

        return;
    }

    // Intervalové spoje
    let current = timeToMinutes(plan.start);
    const end = 23 * 60 + 59;

    while (current <= end) {
        generated.push({
            time: minutesToTime(current),
            delay: "",
            train: `${plan.operator} ${plan.train}`,
            destination: plan.destination,
            platform: "",
            track: "",
            planned: true
        });

        current += plan.interval;
    }
});

return generated;
```

}

/* =========================================
NAČTENÍ PLÁNOVANÝCH ODJEZDŮ
========================================= */

function initializePlannedDepartures() {
const saved = localStorage.getItem("plannedTrainDepartures");

```
if (saved) {
    departuresData = JSON.parse(saved);
    return;
}

departuresData = generatePlannedDepartures();

saveData();
```

}

/* =========================================
UKLÁDÁNÍ
========================================= */

function saveData() {
localStorage.setItem(
"trainDepartures",
JSON.stringify(departuresData)
);

```
localStorage.setItem(
    "plannedTrainDepartures",
    JSON.stringify(departuresData)
);
```

}

/* =========================================
PŘIDÁNÍ VLASTNÍHO ODJEZDU
========================================= */

function addDeparture() {
const time = timeInput.value;
const delay = delayInput.value.trim();
const train = trainInput.value.trim();
const destination = destinationInput.value.trim();
const platform = platformInput.value.trim();
const track = trackInput.value.trim();

```
if (!time || !train || !destination) {
    alert("Vyplň prosím čas, linku / číslo vlaku a směr.");
    return;
}

departuresData.push({
    time,
    delay,
    train,
    destination,
    platform,
    track,
    planned: false
});

sortDepartures();
saveData();
renderAll();

trainInput.value = "";
destinationInput.value = "";
platformInput.value = "";
trackInput.value = "";
delayInput.value = "";

trainInput.focus();
```

}

/* =========================================
ŘAZENÍ
========================================= */

function sortDepartures() {
departuresData.sort((a, b) => {
return a.time.localeCompare(b.time);
});
}

/* =========================================
ÚPRAVA ODJEZDU
========================================= */

function updateDeparture(index, field, value) {
if (!departuresData[index]) {
return;
}

```
departuresData[index][field] = value;

saveData();
renderBoard();
renderEntryList();
```

}

/* =========================================
SMAZÁNÍ
========================================= */

function deleteDeparture(index) {
departuresData.splice(index, 1);

```
saveData();
renderAll();
```

}

/* =========================================
SEZNAM PRO ÚPRAVU
========================================= */

function renderEntryList() {
entryList.innerHTML = "";

```
departuresData.forEach((item, index) => {
    const row = document.createElement("div");

    row.className = "entry-item";

    row.innerHTML = `
        <strong>${escapeHtml(item.time)}</strong>

        <strong>${escapeHtml(item.train)}</strong>

        <span>${escapeHtml(item.destination)}</span>

        <div>
            <span class="edit-label">Zpoždění</span>
            <input
                type="number"
                min="0"
                value="${escapeHtml(item.delay || "")}"
                placeholder=""
                onchange="updateDeparture(${index}, 'delay', this.value)"
            >
        </div>

        <div>
            <span class="edit-label">Nást.</span>
            <input
                type="text"
                value="${escapeHtml(item.platform || "")}"
                placeholder=""
                onchange="updateDeparture(${index}, 'platform', this.value)"
            >
        </div>

        <div>
            <span class="edit-label">Kolej</span>
            <input
                type="text"
                value="${escapeHtml(item.track || "")}"
                placeholder=""
                onchange="updateDeparture(${index}, 'track', this.value)"
            >
        </div>

        <button
            class="delete-button"
            title="Smazat"
            onclick="deleteDeparture(${index})"
        >×</button>
    `;

    entryList.appendChild(row);
});
```

}

/* =========================================
ODJEZDOVÁ TABULE
========================================= */

function renderBoard() {
departures.innerHTML = "";

```
if (departuresData.length === 0) {
    departures.innerHTML = `
        <div class="empty-board">
            ŽÁDNÉ ZADANÉ ODJEZDY
        </div>
    `;

    return;
}

departuresData.forEach((item) => {
    const row = document.createElement("div");

    row.className = "departure";

    const delayNumber = parseInt(item.delay, 10) || 0;

    let delayHtml = "";

    if (delayNumber > 0) {
        delayHtml = `
            <span class="delay delayed">
                +${delayNumber} min
            </span>
        `;
    }

    row.innerHTML = `
        <span class="departure-time">
            ${escapeHtml(item.time)}
        </span>

        <span class="departure-train">
            ${escapeHtml(item.train)}
        </span>

        <span class="departure-destination">
            ${escapeHtml(item.destination)}
        </span>

        <span class="delay-container">
            ${delayHtml}
        </span>

        <span class="departure-platform">
            ${escapeHtml(item.platform || "")}
        </span>

        <span class="departure-track">
            ${escapeHtml(item.track || "")}
        </span>
    `;

    departures.appendChild(row);
});
```

}

/* =========================================
VYKRESLENÍ
========================================= */

function renderAll() {
sortDepartures();
renderEntryList();
renderBoard();
}

/* =========================================
PŘEPÍNÁNÍ OBRAZOVEK
========================================= */

function toggleScreen() {
entryScreen.classList.toggle("hidden");
boardScreen.classList.toggle("hidden");

```
if (!boardScreen.classList.contains("hidden")) {
    renderBoard();
} else {
    trainInput.focus();
}
```

}

/* =========================================
HODINY
========================================= */

function updateClocks() {
const now = new Date();

```
const time = now.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
});

const shortTime = now.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit"
});

document.getElementById("clock").textContent = time;
document.getElementById("boardClock").textContent = shortTime;
```

}

/* =========================================
OCHRANA HTML
========================================= */

function escapeHtml(value) {
return String(value)
.replaceAll("&", "&")
.replaceAll("<", "<")
.replaceAll(">", ">")
.replaceAll('"', """)
.replaceAll("'", "'");
}

/* =========================================
EVENTY
========================================= */

addButton.addEventListener("click", addDeparture);

document.addEventListener("keydown", (event) => {
if (event.key === "*") {
event.preventDefault();
toggleScreen();
}
});

/* =========================================
START
========================================= */

initializePlannedDepartures();

setDefaultTime();
renderAll();
updateClocks();

setInterval(updateClocks, 1000);
