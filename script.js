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

const END_TIME = 18 * 60 + 59;

/* =========================
   AUTOMATICKÉ SPOJE
========================= */

function createPlannedId(train, time, destination) {
    const cleanDestination = destination
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    return `planned-${train.replace(/[^a-zA-Z0-9]/g, "")}-${time.replace(":", "")}-${cleanDestination}`;
}

function addPlanned(result, time, train, destination) {
    const [hour, minute] = time.split(":").map(Number);
    const totalMinutes = hour * 60 + minute;

    if (totalMinutes > END_TIME) {
        return;
    }

    result.push({
        id: createPlannedId(train, time, destination),
        planned: true,
        time,
        delay: "0",
        train,
        destination,
        platform: "",
        track: ""
    });
}

function addEveryMinutes(
    result,
    startHour,
    startMinute,
    interval,
    train,
    destination
) {
    let minutes = startHour * 60 + startMinute;

    while (minutes <= END_TIME) {
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;

        const time =
            String(hour).padStart(2, "0") +
            ":" +
            String(minute).padStart(2, "0");

        addPlanned(result, time, train, destination);

        minutes += interval;
    }
}

function generatePlannedDepartures() {
    const result = [];

    const now = new Date();
    const day = now.getDay();

    // 0 = neděle, 6 = sobota
    const weekend = day === 0 || day === 6;

    if (!weekend) {
        /* =========================
           PRACOVNÍ DNY
        ========================= */

        // AND S1
        addEveryMinutes(
            result,
            14,
            12,
            20,
            "AND S1",
            "Starý Lízátkov"
        );

        addEveryMinutes(
            result,
            14,
            15,
            20,
            "AND S1",
            "Ana-Pralesov - Ana-Ansko"
        );

        // AND S14
        addEveryMinutes(
            result,
            14,
            26,
            30,
            "AND S14",
            "Snovín - Velkoplochovice - Svíčkov"
        );

        // AND S15
        addEveryMinutes(
            result,
            14,
            13,
            30,
            "AND S15",
            "Ulrychov - Habže - Filíkov - Silininky"
        );

        // AND S25
        addEveryMinutes(
            result,
            14,
            30,
            60,
            "AND S25",
            "Trnkov - Maďaryn"
        );

        addEveryMinutes(
            result,
            15,
            0,
            60,
            "AND S25",
            "Mazi"
        );

        // AND S7
        addPlanned(
            result,
            "16:31",
            "AND S7",
            "Ana-Pralesov - Hambrovce - Azilka"
        );

        addPlanned(
            result,
            "18:31",
            "AND S7",
            "Ana-Pralesov - Hambrovce - Azilka"
        );

        // AND R1
        addEveryMinutes(
            result,
            14,
            3,
            60,
            "AND R1",
            "Křečíkov-Alfonsovice - Křečkov hl.n."
        );

        // AND S15
        addEveryMinutes(
            result,
            14,
            58,
            60,
            "AND S15",
            "Ulrychov - Habže - Silininky"
        );

        // RJET R56
        addEveryMinutes(
            result,
            14,
            4,
            60,
            "RJET R56",
            "Osady u Maďarynu - Praha hl.n."
        );

        addEveryMinutes(
            result,
            14,
            4,
            60,
            "RJET R56",
            "Ana-Pralesov"
        );

        // AND R77
        addEveryMinutes(
            result,
            15,
            13,
            120,
            "AND R77",
            "Niryny - Štěpánov"
        );

        // RJET R4
        addEveryMinutes(
            result,
            14,
            20,
            60,
            "RJET R4",
            "Vícmanice - Gorzów Wielkopolski"
        );

        // AND Sp27
        addEveryMinutes(
            result,
            14,
            17,
            60,
            "AND Sp27",
            "Svíčkov - Žábry"
        );

        // AND S92
        addEveryMinutes(
            result,
            14,
            23,
            60,
            "AND S92",
            "Lamov - Niryny"
        );

    } else {
        /* =========================
           VÍKEND
        ========================= */

        // AND S1
        addEveryMinutes(
            result,
            10,
            12,
            20,
            "AND S1",
            "Starý Lízátkov"
        );

        addEveryMinutes(
            result,
            10,
            15,
            20,
            "AND S1",
            "Ana-Pralesov - Ana-Ansko"
        );

        // AND S7
        addPlanned(
            result,
            "18:31",
            "AND S7",
            "Ana-Pralesov - Hambrovce - Azilka"
        );

        // AND R1
        addEveryMinutes(
            result,
            10,
            3,
            60,
            "AND R1",
            "Křečíkov-Alfonsovice - Křečkov hl.n."
        );

        // AND S15 – přes Filíkov
        addEveryMinutes(
            result,
            10,
            28,
            60,
            "AND S15",
            "Ulrychov - Habže - Filíkov - Silininky"
        );

        // AND S15 – bez Filíkova
        addEveryMinutes(
            result,
            10,
            58,
            60,
            "AND S15",
            "Ulrychov - Habže - Silininky"
        );

        // RJET R56 – Praha
        addEveryMinutes(
            result,
            10,
            4,
            120,
            "RJET R56",
            "Osady u Maďarynu - Praha hl.n."
        );

        // RJET R56 – Ana-Pralesov
        addEveryMinutes(
            result,
            11,
            4,
            120,
            "RJET R56",
            "Ana-Pralesov"
        );

        // AND R77
        addEveryMinutes(
            result,
            11,
            13,
            120,
            "AND R77",
            "Niryny - Štěpánov"
        );

        // AND S14
        addEveryMinutes(
            result,
            10,
            56,
            60,
            "AND S14",
            "Snovín - Velkoplochovice - Svíčkov"
        );

        // AND Sp27 – Žábry
        addEveryMinutes(
            result,
            10,
            17,
            120,
            "AND Sp27",
            "Svíčkov - Žábry"
        );

        // AND Sp27 – Svíčkov
        addEveryMinutes(
            result,
            11,
            17,
            120,
            "AND Sp27",
            "Svíčkov"
        );

        // AND S25
        // 10:30, 11:30, 12:30...
        // výjimky: 12:30, 15:30, 20:30
        // 20:30 se kvůli limitu 18:59 stejně nevygeneruje.
        let s25Minutes = 10 * 60 + 30;

        while (s25Minutes <= END_TIME) {
            const hour = Math.floor(s25Minutes / 60);
            const minute = s25Minutes % 60;

            if (
                !(hour === 12 && minute === 30) &&
                !(hour === 15 && minute === 30) &&
                !(hour === 20 && minute === 30)
            ) {
                const time =
                    String(hour).padStart(2, "0") +
                    ":" +
                    String(minute).padStart(2, "0");

                addPlanned(
                    result,
                    time,
                    "AND S25",
                    "Trnkov - Maďaryn"
                );
            }

            s25Minutes += 60;
        }

        // Původní víkendové spoje S25 – Mazi
        addPlanned(
            result,
            "12:30",
            "AND S25",
            "Mazi"
        );

        addPlanned(
            result,
            "15:30",
            "AND S25",
            "Mazi"
        );

        // AND S92
        addEveryMinutes(
            result,
            10,
            23,
            120,
            "AND S92",
            "Lamov - Niryny"
        );

        // RJET R4
        addEveryMinutes(
            result,
            10,
            20,
            120,
            "RJET R4",
            "Vícmanice - Gorzów Wielkopolski"
        );
    }

    return result;
}

/* =========================
   ČAS
========================= */

function setDefaultTime() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    timeInput.value = `${hours}:${minutes}`;
}

/* =========================
   ULOŽENÍ
========================= */

function saveData() {
    localStorage.setItem(
        "trainDepartures",
        JSON.stringify(departuresData)
    );
}

/* =========================
   PŘIDÁNÍ VLASTNÍHO SPOJE
========================= */

function addDeparture() {
    const time = timeInput.value;
    const delay = delayInput.value.trim();
    const train = trainInput.value.trim();
    const destination = destinationInput.value.trim();
    const platform = platformInput.value.trim();
    const track = trackInput.value.trim();

    if (!time || !train || !destination) {
        alert("Vyplň čas, linku/číslo vlaku a směr.");
        return;
    }

    const newDeparture = {
        id: `manual-${Date.now()}`,
        planned: false,
        time,
        delay: delay || "0",
        train,
        destination,
        platform,
        track
    };

    departuresData.push(newDeparture);

    saveData();
    renderAll();

    delayInput.value = "";
    trainInput.value = "";
    destinationInput.value = "";
    platformInput.value = "";
    trackInput.value = "";

    setDefaultTime();
}

/* =========================
   ŘAZENÍ
========================= */

function sortDepartures(data) {
    return [...data].sort((a, b) => {
        const timeA = a.time.split(":").map(Number);
        const timeB = b.time.split(":").map(Number);

        const minutesA = timeA[0] * 60 + timeA[1];
        const minutesB = timeB[0] * 60 + timeB[1];

        return minutesA - minutesB;
    });
}

/* =========================
   ÚPRAVA MANUÁLNÍHO SPOJE
========================= */

function updateDeparture(id, field, value) {
    const departure = departuresData.find(item => item.id === id);

    if (!departure) {
        return;
    }

    departure[field] = value;

    saveData();
    renderAll();
}

/* =========================
   ÚPRAVA AUTOMATICKÉHO SPOJE
========================= */

function updatePlannedDeparture(id, field, value) {
    let overrides = JSON.parse(
        localStorage.getItem("plannedOverrides") || "{}"
    );

    if (!overrides[id]) {
        overrides[id] = {};
    }

    overrides[id][field] = value;

    localStorage.setItem(
        "plannedOverrides",
        JSON.stringify(overrides)
    );

    renderAll();
}

/* =========================
   APLIKACE ÚPRAV
========================= */

function applyPlannedOverrides(data) {
    const overrides = JSON.parse(
        localStorage.getItem("plannedOverrides") || "{}"
    );

    return data.map(item => {
        if (!item.planned || !overrides[item.id]) {
            return item;
        }

        return {
            ...item,
            ...overrides[item.id]
        };
    });
}

/* =========================
   SMAZÁNÍ
========================= */

function deleteDeparture(id) {
    departuresData = departuresData.filter(
        item => item.id !== id
    );

    saveData();
    renderAll();
}

/* =========================
   VŠECHNY ODJEZDY
========================= */

function getAllDepartures() {
    const planned = generatePlannedDepartures();

    const plannedWithOverrides =
        applyPlannedOverrides(planned);

    return [
        ...plannedWithOverrides,
        ...departuresData
    ];
}

/* =========================
   EDITAČNÍ SEZNAM
========================= */

function renderEntryList() {
    if (!entryList) {
        return;
    }

    const all = sortDepartures(getAllDepartures());

    entryList.innerHTML = "";

    all.forEach(item => {
        const row = document.createElement("div");

        row.className = "entry-item";

        row.innerHTML = `
            <input
                type="time"
                value="${escapeHtml(item.time)}"
                data-field="time"
            >

            <input
                type="text"
                value="${escapeHtml(item.train)}"
                data-field="train"
            >

            <input
                type="text"
                value="${escapeHtml(item.destination)}"
                data-field="destination"
            >

            <input
                type="text"
                placeholder="zpoždění"
                value="${escapeHtml(item.delay || "")}"
                data-field="delay"
            >

            <input
                type="text"
                placeholder="nást."
                value="${escapeHtml(item.platform || "")}"
                data-field="platform"
            >

            <input
                type="text"
                placeholder="kolej"
                value="${escapeHtml(item.track || "")}"
                data-field="track"
            >

            <button
                class="delete-button"
                type="button"
            >
                ×
            </button>
        `;

        const inputs = row.querySelectorAll("input");

        inputs.forEach(input => {
            input.addEventListener("change", () => {
                const field = input.dataset.field;
                const value = input.value;

                if (item.planned) {
                    updatePlannedDeparture(
                        item.id,
                        field,
                        value
                    );
                } else {
                    updateDeparture(
                        item.id,
                        field,
                        value
                    );
                }
            });
        });

        const deleteButton =
            row.querySelector(".delete-button");

        deleteButton.addEventListener("click", () => {
            if (item.planned) {
                let overrides = JSON.parse(
                    localStorage.getItem("plannedOverrides") || "{}"
                );

                delete overrides[item.id];

                localStorage.setItem(
                    "plannedOverrides",
                    JSON.stringify(overrides)
                );

                renderAll();
            } else {
                deleteDeparture(item.id);
            }
        });

        entryList.appendChild(row);
    });
}

/* =========================
   TABULE
========================= */

function renderBoard() {
    if (!departures) {
        return;
    }

    const all = sortDepartures(getAllDepartures());

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    const future = all.filter(item => {
        const [hour, minute] =
            item.time.split(":").map(Number);

        const departureMinutes =
            hour * 60 + minute;

        return departureMinutes >= currentMinutes;
    });

    const visible = future.slice(0, 8);

    departures.innerHTML = "";

    visible.forEach(item => {
        const row = document.createElement("div");

        row.className = "departure";

        let delayText = "-";

        if (
            item.delay &&
            item.delay !== "0" &&
            item.delay !== "0 min"
        ) {
            delayText = `+${item.delay}`;
        }

        row.innerHTML = `
            <div class="departure-time">
                ${escapeHtml(item.time)}
            </div>

            <div class="departure-train">
                ${escapeHtml(item.train)}
            </div>

            <div class="departure-destination">
                ${escapeHtml(item.destination)}
            </div>

            <div class="departure-delay">
                ${escapeHtml(delayText)}
            </div>

            <div class="departure-platform">
                ${escapeHtml(item.platform || "-")}
            </div>

            <div class="departure-track">
                ${escapeHtml(item.track || "-")}
            </div>
        `;

        departures.appendChild(row);
    });

    if (visible.length === 0) {
        departures.innerHTML = `
            <div class="no-departures">
                Žádné další odjezdy
            </div>
        `;
    }
}

/* =========================
   VYKRESLENÍ
========================= */

function renderAll() {
    renderEntryList();
    renderBoard();
}

/* =========================
   PŘEPNUTÍ OBRAZOVEK
========================= */

function toggleScreen() {
    entryScreen.classList.toggle("hidden");
    boardScreen.classList.toggle("hidden");

    renderAll();
}

/* =========================
   HODINY
========================= */

function updateClocks() {
    const clocks =
        document.querySelectorAll(".clock");

    const now = new Date();

    const time =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0") +
        ":" +
        String(now.getSeconds()).padStart(2, "0");

    clocks.forEach(clock => {
        clock.textContent = time;
    });
}

/* =========================
   BEZPEČNÉ HTML
========================= */

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================
   OVLÁDÁNÍ
========================= */

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

/* =========================
   START
========================= */

setDefaultTime();
renderAll();
updateClocks();

setInterval(() => {
    updateClocks();

    if (
        !boardScreen.classList.contains("hidden")
    ) {
        renderBoard();
    }
}, 1000);
