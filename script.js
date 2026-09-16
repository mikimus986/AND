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

/* =====================================================
DATA
===================================================== */

let departuresData = [];

const STORAGE_KEY = "trainDeparturesV2";

/* =====================================================
PLÁNOVANÉ PRACOVNÍ ODJEZDY
===================================================== */

const plannedDepartures = [

```
/* AND S7 */
{
    operator: "AND",
    train: "S7",
    destination: "Ana-Pralesov - Hambrovce - Azilka",
    times: [
        "16:31",
        "18:31",
        "21:31",
        "22:31"
    ]
},

/* AND R1 */
{
    operator: "AND",
    train: "R1",
    destination: "Trnkov - Křečíkov - Alfonsovice - Křečkov hl.n.",
    start: "14:03",
    interval: 60
},

/* AND S15 – PŘES FILÍKOV */
{
    operator: "AND",
    train: "S15",
    destination: "Ulrychov - Habže - Filíkov - Silininky",
    start: "14:13",
    interval: 30
},

/* AND S15 – BEZ FILÍKOVA */
{
    operator: "AND",
    train: "S15",
    destination: "Ulrychov - Habže - Silininky",
    start: "14:58",
    interval: 60
},

/* RJET R56 – ANA-PRALESOV */
{
    operator: "RJET",
    train: "R56",
    destination: "Ana-Pralesov",
    start: "14:04",
    interval: 60
},

/* RJET R56 – PRAHA */
{
    operator: "RJET",
    train: "R56",
    destination: "Osady u Maďarynu - Praha hl.n.",
    start: "14:04",
    interval: 60
},

/* AND R77 */
{
    operator: "AND",
    train: "R77",
    destination: "Niryny - Štěpánov",
    start: "15:13",
    interval: 120
},

/* AND S1 – LÍZÁTKOV */
{
    operator: "AND",
    train: "S1",
    destination: "Starý Lízátkov",
    start: "14:12",
    interval: 20
},

/* AND S1 – ANA */
{
    operator: "AND",
    train: "S1",
    destination: "Ana-Pralesov - Ana-Ansko",
    start: "14:15",
    interval: 20
}
```

];

/* =====================================================
PRÁCE S ČASEM
===================================================== */

function timeToMinutes(time) {

```
const parts = time.split(":");

const hours = Number(parts[0]);
const minutes = Number(parts[1]);

return hours * 60 + minutes;
```

}

function minutesToTime(minutes) {

```
const hours = Math.floor(minutes / 60);
const mins = minutes % 60;

return (
    String(hours).padStart(2, "0") +
    ":" +
    String(mins).padStart(2, "0")
);
```

}

/* =====================================================
JE DNES PRACOVNÍ DEN?
===================================================== */

function isWeekday() {

```
const day = new Date().getDay();

return day >= 1 && day <= 5;
```

}

/* =====================================================
GENEROVÁNÍ PLÁNOVANÝCH ODJEZDŮ
===================================================== */

function generatePlannedDepartures() {

```
const result = [];

if (!isWeekday()) {
    return result;
}

plannedDepartures.forEach(plan => {

    /*
     * S7 – konkrétní časy
     */
    if (plan.times) {

        plan.times.forEach(time => {

            result.push({
                id: createId(),
                time: time,
                train: `${plan.operator} ${plan.train}`,
                destination: plan.destination,

                delay: "",
                platform: "",
                track: "",

                planned: true
            });

        });

        return;
    }


    /*
     * Intervalové spoje
     */

    let current = timeToMinutes(plan.start);

    const end = 23 * 60 + 59;

    while (current <= end) {

        result.push({
            id: createId(),
            time: minutesToTime(current),
            train: `${plan.operator} ${plan.train}`,
            destination: plan.destination,

            delay: "",
            platform: "",
            track: "",

            planned: true
        });

        current += plan.interval;
    }

});

return result;
```

}

/* =====================================================
ID
===================================================== */

function createId() {

```
return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 8)
);
```

}

/* =====================================================
ULOŽENÍ
===================================================== */

function saveData() {

```
localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(departuresData)
);
```

}

/* =====================================================
NAČTENÍ DAT
===================================================== */

function loadData() {

```
const saved = localStorage.getItem(STORAGE_KEY);

if (saved) {

    try {

        departuresData = JSON.parse(saved);

        if (!Array.isArray(departuresData)) {
            departuresData = [];
        }

    } catch {

        departuresData = [];
    }

} else {

    departuresData = generatePlannedDepartures();

    saveData();
}
```

}

/* =====================================================
PŘIDÁNÍ VLASTNÍHO ODJEZDU
===================================================== */

function addDeparture() {

```
const time = timeInput.value.trim();
const delay = delayInput.value.trim();
const train = trainInput.value.trim();
const destination = destinationInput.value.trim();

const platform = platformInput.value.trim();
const track = trackInput.value.trim();


if (!time) {

    alert("Vyplň čas odjezdu.");

    timeInput.focus();

    return;
}


if (!train) {

    alert("Vyplň linku / číslo vlaku.");

    trainInput.focus();

    return;
}


if (!destination) {

    alert("Vyplň směr.");

    destinationInput.focus();

    return;
}


departuresData.push({

    id: createId(),

    time: time,

    train: train,

    destination: destination,

    delay: delay,

    platform: platform,

    track: track,

    planned: false
});


sortDepartures();

saveData();

renderAll();


/*
 * Vyčištění formuláře
 */

trainInput.value = "";
destinationInput.value = "";
delayInput.value = "";
platformInput.value = "";
trackInput.value = "";


trainInput.focus();
```

}

/* =====================================================
ŘAZENÍ
===================================================== */

function sortDepartures() {

```
departuresData.sort((a, b) => {

    return timeToMinutes(a.time) -
           timeToMinutes(b.time);

});
```

}

/* =====================================================
ÚPRAVA
===================================================== */

function updateDeparture(index, field, value) {

```
if (!departuresData[index]) {
    return;
}

departuresData[index][field] = value;

saveData();

renderEntryList();

renderBoard();
```

}

/* =====================================================
SMAZÁNÍ
===================================================== */

function deleteDeparture(index) {

```
if (!departuresData[index]) {
    return;
}

departuresData.splice(index, 1);

saveData();

renderAll();
```

}

/* =====================================================
SEZNAM PRO ÚPRAVU
===================================================== */

function renderEntryList() {

```
entryList.innerHTML = "";


departuresData.forEach((item, index) => {

    const row = document.createElement("div");

    row.className = "entry-item";


    row.innerHTML = `

        <strong>
            ${escapeHtml(item.time)}
        </strong>


        <strong>
            ${escapeHtml(item.train)}
        </strong>


        <span>
            ${escapeHtml(item.destination)}
        </span>


        <div>

            <span class="edit-label">
                Zpoždění
            </span>

            <input
                type="number"
                min="0"
                value="${escapeHtml(item.delay || "")}"
                placeholder=""
                onchange="
                    updateDeparture(
                        ${index},
                        'delay',
                        this.value
                    )
                "
            >

        </div>


        <div>

            <span class="edit-label">
                Nást.
            </span>

            <input
                type="text"
                value="${escapeHtml(item.platform || "")}"
                placeholder=""
                onchange="
                    updateDeparture(
                        ${index},
                        'platform',
                        this.value
                    )
                "
            >

        </div>


        <div>

            <span class="edit-label">
                Kolej
            </span>

            <input
                type="text"
                value="${escapeHtml(item.track || "")}"
                placeholder=""
                onchange="
                    updateDeparture(
                        ${index},
                        'track',
                        this.value
                    )
                "
            >

        </div>


        <button
            class="delete-button"
            title="Smazat"
            onclick="
                deleteDeparture(${index})
            "
        >
            ×
        </button>

    `;


    entryList.appendChild(row);

});
```

}

/* =====================================================
ODJEZDOVÁ TABULE
===================================================== */

function renderBoard() {

```
departures.innerHTML = "";


if (departuresData.length === 0) {

    departures.innerHTML = `

        <div class="empty-board">
            ŽÁDNÉ ZADANÉ ODJEZDY
        </div>

    `;

    return;
}


departuresData.forEach(item => {

    const row = document.createElement("div");

    row.className = "departure";


    /*
     * Zpoždění
     */

    let delayHtml = "";

    const delayNumber =
        parseInt(item.delay, 10);


    if (
        !isNaN(delayNumber) &&
        delayNumber > 0
    ) {

        delayHtml = `

            <span class="delay delayed">
                +${delayNumber} min
            </span>

        `;
    }


    /*
     * Nástupiště
     */

    const platform =
        item.platform
            ? escapeHtml(item.platform)
            : "";


    /*
     * Kolej
     */

    const track =
        item.track
            ? escapeHtml(item.track)
            : "";


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
            ${platform}
        </span>


        <span class="departure-track">
            ${track}
        </span>

    `;


    departures.appendChild(row);

});
```

}

/* =====================================================
VŠE
===================================================== */

function renderAll() {

```
sortDepartures();

renderEntryList();

renderBoard();
```

}

/* =====================================================
PŘEPÍNÁNÍ OBRAZOVEK
===================================================== */

function toggleScreen() {

```
entryScreen.classList.toggle("hidden");

boardScreen.classList.toggle("hidden");


if (
    !boardScreen.classList.contains("hidden")
) {

    renderBoard();

} else {

    trainInput.focus();

}
```

}

/* =====================================================
HODINY
===================================================== */

function updateClocks() {

```
const now = new Date();


const time =
    now.toLocaleTimeString(
        "cs-CZ",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );


const shortTime =
    now.toLocaleTimeString(
        "cs-CZ",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );


document.getElementById(
    "clock"
).textContent = time;


document.getElementById(
    "boardClock"
).textContent = shortTime;
```

}

/* =====================================================
VÝCHOZÍ ČAS
===================================================== */

function setDefaultTime() {

```
const now = new Date();

const hours =
    String(now.getHours())
    .padStart(2, "0");

const minutes =
    String(now.getMinutes())
    .padStart(2, "0");


if (!timeInput.value) {

    timeInput.value =
        `${hours}:${minutes}`;
}
```

}

/* =====================================================
OCHRANA HTML
===================================================== */

function escapeHtml(value) {

```
return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&
```
