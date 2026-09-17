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


/* =========================================================
   PLÁNOVANÉ ODJEZDY
   ========================================================= */

function generatePlannedDepartures() {
    const result = [];

    const now = new Date();
    const day = now.getDay();

    // 0 = neděle, 6 = sobota
    const weekend = day === 0 || day === 6;

    function addEveryMinutes(
        startHour,
        startMinute,
        interval,
        train,
        destination
    ) {
        let minutes = startHour * 60 + startMinute;
        const end = 18 * 60 + 59;

        while (minutes <= end) {
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;

            result.push({
                id: `planned-${train}-${minutes}`,
                planned: true,

                time:
                    String(hour).padStart(2, "0") +
                    ":" +
                    String(minute).padStart(2, "0"),

                delay: "0",
                train: train,
                destination: destination,
                platform: "",
                track: ""
            });

            minutes += interval;
        }
    }


    /*
       ============================================
       PRACOVNÍ DNY
       ============================================
    */

    if (!weekend) {

        // S1
        // 14:12, potom každých 20 minut
        addEveryMinutes(
            14,
            12,
            20,
            "AND S1",
            "Starý Lízátkov"
        );


        // S1
        // 14:15, potom každých 20 minut
        addEveryMinutes(
            14,
            15,
            20,
            "AND S1",
            "Ana-Pralesov - Ana-Ansko"
        );


        // S14
        // 14:26, potom každých 30 minut
        addEveryMinutes(
            14,
            26,
            30,
            "AND S14",
            "Snovín - Velkoplochovice - Svíčkov"
        );


        // S15
        // 14:13, potom každých 30 minut
        addEveryMinutes(
            14,
            13,
            30,
            "AND S15",
            "Ulrychov - Habže - Filíkov - Silininky"
        );


        // S25 Trnkov - Maďaryn
        // 14:30, potom každou hodinu
        addEveryMinutes(
            14,
            30,
            60,
            "AND S25",
            "Trnkov - Maďaryn"
        );


        // S25 Mazi
        // 15:00, potom každou hodinu
        addEveryMinutes(
            15,
            0,
            60,
            "AND S25",
            "Mazi"
        );
    }


    /*
       ============================================
       VÍKEND
       ============================================
    */

    else {

        // S1 - Starý Lízátkov
        // od 10:12 každých 20 minut
        addEveryMinutes(
            10,
            12,
            20,
            "AND S1",
            "Starý Lízátkov"
        );


        // S1 - Ana-Pralesov - Ana-Ansko
        // od 10:15 každých 20 minut
        addEveryMinutes(
            10,
            15,
            20,
            "AND S1",
            "Ana-Pralesov - Ana-Ansko"
        );


        // S25 Mazi
        // víkendové jednotlivé odjezdy
        addFixedDeparture(
            result,
            "12:30",
            "AND S25",
            "Mazi"
        );

        addFixedDeparture(
            result,
            "15:30",
            "AND S25",
            "Mazi"
        );
    }

    return result;
}


function addFixedDeparture(
    result,
    time,
    train,
    destination
) {
    result.push({
        id: `planned-${train}-${time}`,
        planned: true,

        time: time,
        delay: "0",
        train: train,
        destination: destination,
        platform: "",
        track: ""
    });
}


/* =========================================================
   RUČNÍ ODJEZDY
   ========================================================= */

function setDefaultTime() {
    const now = new Date();

    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");

    if (!timeInput.value) {
        timeInput.value = `${hh}:${mm}`;
    }
}


function saveData() {
    localStorage.setItem(
        "trainDepartures",
        JSON.stringify(departuresData)
    );
}


function addDeparture() {
    const time = timeInput.value;
    const delay = delayInput.value.trim();
    const train = trainInput.value.trim();
    const destination = destinationInput.value.trim();

    const platform = platformInput.value.trim();
    const track = trackInput.value.trim();

    if (!time || !train || !destination) {
        alert(
            "Vyplň prosím čas, linku / číslo vlaku a směr."
        );

        return;
    }

    departuresData.push({
        id: "manual-" + Date.now(),

        planned: false,

        time: time,
        delay: delay || "0",
        train: train,
        destination: destination,
        platform: platform,
        track: track
    });

    saveData();

    renderAll();

    trainInput.value = "";
    destinationInput.value = "";
    platformInput.value = "";
    trackInput.value = "";
    delayInput.value = "";

    trainInput.focus();
}


/* =========================================================
   ŘAZENÍ
   ========================================================= */

function sortDepartures(data) {
    data.sort((a, b) => {
        return a.time.localeCompare(b.time);
    });

    return data;
}


/* =========================================================
   ÚPRAVA RUČNÍCH SPOJŮ
   ========================================================= */

function updateDeparture(
    id,
    field,
    value
) {
    const departure = departuresData.find(
        item => item.id === id
    );

    if (!departure) {
        return;
    }

    departure[field] = value;

    saveData();

    renderAll();
}


/* =========================================================
   ÚPRAVA PLÁNOVANÉHO SPOJE
   ========================================================= */

function updatePlannedDeparture(
    id,
    field,
    value
) {
    const saved = JSON.parse(
        localStorage.getItem("plannedOverrides") || "{}"
    );

    if (!saved[id]) {
        saved[id] = {};
    }

    saved[id][field] = value;

    localStorage.setItem(
        "plannedOverrides",
        JSON.stringify(saved)
    );

    renderAll();
}


/* =========================================================
   APLIKOVÁNÍ ÚPRAV PLÁNOVANÝCH SPOJŮ
   ========================================================= */

function applyPlannedOverrides(data) {
    const overrides = JSON.parse(
        localStorage.getItem("plannedOverrides") || "{}"
    );

    return data.map(item => {

        if (!item.planned) {
            return item;
        }

        if (!overrides[item.id]) {
            return item;
        }

        return {
            ...item,
            ...overrides[item.id]
        };
    });
}


/* =========================================================
   SMAZÁNÍ RUČNÍHO SPOJE
   ========================================================= */

function deleteDeparture(id) {

    departuresData = departuresData.filter(
        item => item.id !== id
    );

    saveData();

    renderAll();
}


/* =========================================================
   VŠECHNY AKTUÁLNÍ ODJEZDY
   ========================================================= */

function getAllDepartures() {

    const planned = generatePlannedDepartures();

    const plannedWithOverrides =
        applyPlannedOverrides(planned);

    const all = [
        ...plannedWithOverrides,
        ...departuresData
    ];

    return sortDepartures(all);
}


/* =========================================================
   ZADÁVACÍ OBRAZOVKA
   ========================================================= */

function renderEntryList() {

    entryList.innerHTML = "";

    const all = getAllDepartures();

    all.forEach(item => {

        const row = document.createElement("div");

        row.className = "entry-item";


        const updateFunction =
            item.planned
                ? "updatePlannedDeparture"
                : "updateDeparture";


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
                    value="${
                        item.delay === "0"
                            ? ""
                            : escapeHtml(item.delay)
                    }"
                    placeholder="0"
                    onchange="${updateFunction}(
                        '${escapeHtml(item.id)}',
                        'delay',
                        this.value || '0'
                    )"
                >
            </div>

            <div>
                <span class="edit-label">
                    Nást.
                </span>

                <input
                    type="text"
                    value="${escapeHtml(item.platform)}"
                    placeholder="-"
                    onchange="${updateFunction}(
                        '${escapeHtml(item.id)}',
                        'platform',
                        this.value
                    )"
                >
            </div>

            <div>
                <span class="edit-label">
                    Kolej
                </span>

                <input
                    type="text"
                    value="${escapeHtml(item.track)}"
                    placeholder="-"
                    onchange="${updateFunction}(
                        '${escapeHtml(item.id)}',
                        'track',
                        this.value
                    )"
                >
            </div>

            ${
                item.planned
                    ? `<span
                         style="
                           color:#656b73;
                           font-size:10px;
                           text-align:center;
                         "
                       >
                         PLÁN
                       </span>`
                    : `<button
                         class="delete-button"
                         title="Smazat"
                         onclick="deleteDeparture(
                            '${escapeHtml(item.id)}'
                         )"
                       >
                         ×
                       </button>`
            }
        `;

        entryList.appendChild(row);
    });
}


/* =========================================================
   ODJEZDOVÁ TABULE
   ========================================================= */

function renderBoard() {

    departures.innerHTML = "";

    let all = getAllDepartures();


    /*
       Zobrazíme jen budoucí spoje.
       Ruční spoje i plánované.
    */

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    all = all.filter(item => {

        const parts = item.time.split(":");

        const minutes =
            Number(parts[0]) * 60 +
            Number(parts[1]);

        return minutes >= currentMinutes;
    });


    /*
       Tabule zobrazí maximálně 8 nejbližších spojů.
    */

    all = all.slice(0, 8);


    if (all.length === 0) {

        departures.innerHTML = `
            <div class="empty-board">
                ŽÁDNÉ DALŠÍ ODJEZDY
            </div>
        `;

        return;
    }


    all.forEach(item => {

        const row =
            document.createElement("div");

        row.className = "departure";


        const delayNumber =
            parseInt(item.delay, 10) || 0;


        let delayHtml;

        if (delayNumber > 0) {

            delayHtml = `
                <span class="delay delayed">
                    +${delayNumber} min
                </span>
            `;

        } else {

            delayHtml = `
                <span class="delay on-time">
                    VČAS
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

            ${delayHtml}

            <span class="departure-platform">
                ${escapeHtml(item.platform || "-")}
            </span>

            <span class="departure-track">
                ${escapeHtml(item.track || "-")}
            </span>
        `;


        departures.appendChild(row);
    });
}


/* =========================================================
   VŠE
   ========================================================= */

function renderAll() {

    renderEntryList();
    renderBoard();
}


/* =========================================================
   PŘEPÍNÁNÍ OBRAZOVEK
   ========================================================= */

function toggleScreen() {

    entryScreen.classList.toggle("hidden");
    boardScreen.classList.toggle("hidden");


    if (!boardScreen.classList.contains("hidden")) {

        renderBoard();

    } else {

        renderEntryList();

        trainInput.focus();
    }
}


/* =========================================================
   HODINY
   ========================================================= */

function updateClocks() {

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
}


/* =========================================================
   OCHRANA HTML
   ========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   OVLÁDÁNÍ
   ========================================================= */

addButton.addEventListener(
    "click",
    addDeparture
);


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "*") {

            event.preventDefault();

            toggleScreen();
        }
    }
);


/* =========================================================
   START
   ========================================================= */

setDefaultTime();

renderAll();

updateClocks();


/*
   Každou sekundu:
   - aktualizace hodin
   - kontrola plánovaných odjezdů
*/

setInterval(() => {

    updateClocks();

    if (
        !boardScreen.classList.contains(
            "hidden"
        )
    ) {
        renderBoard();
    }

}, 1000);
