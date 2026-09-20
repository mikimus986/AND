const entryScreen = document.getElementById("entryScreen");
const boardScreen = document.getElementById("boardScreen");
const entryList = document.getElementById("entryList");

const timeInput = document.getElementById("timeInput");
const delayInput = document.getElementById("delayInput");
const trainInput = document.getElementById("trainInput");
const destinationInput = document.getElementById("destinationInput");
const platformInput = document.getElementById("platformInput");
const trackInput = document.getElementById("trackInput");

const addButton = document.getElementById("addButton");
const departuresBoard = document.getElementById("departures");
const clock = document.getElementById("clock");
const boardClock = document.getElementById("boardClock");

let departures = JSON.parse(
    localStorage.getItem("departures") || "[]"
);

let plannedOverrides = JSON.parse(
    localStorage.getItem("plannedOverrides") || "{}"
);


// =====================================================
// POMOCNÉ FUNKCE
// =====================================================

function timeToMinutes(time) {
    if (!time || !time.includes(":")) return 0;

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
}


function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(mins).padStart(2, "0")
    );
}


function delayToMinutes(delay) {
    if (
        delay === "" ||
        delay === null ||
        delay === undefined
    ) {
        return 0;
    }

    const value = Number(delay);

    if (isNaN(value) || value < 0) return 0;

    return value;
}


function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function saveDepartures() {
    localStorage.setItem(
        "departures",
        JSON.stringify(departures)
    );
}


function saveOverrides() {
    localStorage.setItem(
        "plannedOverrides",
        JSON.stringify(plannedOverrides)
    );
}


// =====================================================
// AUTOMATICKÉ SPOJE
// =====================================================

function generateRecurring(
    startTime,
    interval,
    train,
    destination,
    weekend
) {
    const result = [];

    let current = timeToMinutes(startTime);

    while (current <= 18 * 60 + 59) {

        const time = minutesToTime(current);

        result.push({
            id:
                "planned_" +
                train.replace(/\s/g, "") +
                "_" +
                current +
                "_" +
                destination,

            planned: true,

            time,
            train,
            destination,

            delay: "",
            platform: "",
            track: "",

            overrideKey:
                train +
                "|" +
                destination +
                "|" +
                time,

            weekend
        });

        current += interval;
    }

    return result;
}


function generateFixed(
    times,
    train,
    destination,
    weekend
) {
    return times.map(time => ({
        id:
            "planned_" +
            train.replace(/\s/g, "") +
            "_" +
            time.replace(":", "") +
            "_" +
            destination,

        planned: true,

        time,
        train,
        destination,

        delay: "",
        platform: "",
        track: "",

        overrideKey:
            train +
            "|" +
            destination +
            "|" +
            time,

        weekend
    }));
}


function getAutomaticDepartures() {

    const day = new Date().getDay();

    const weekend =
        day === 0 ||
        day === 6;

    let result = [];


    if (!weekend) {

        result.push(
            ...generateRecurring(
                "14:12",
                20,
                "AND S1",
                "Starý Lízátkov",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:15",
                20,
                "AND S1",
                "Ana-Pralesov - Ana-Ansko",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:26",
                30,
                "AND S14",
                "Snovín - Velkoplochovice - Svíčkov",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:13",
                30,
                "AND S15",
                "Ulrychov - Habže - Filíkov - Silininky",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:58",
                60,
                "AND S15",
                "Ulrychov - Habže - Silininky",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:30",
                60,
                "AND S25",
                "Trnkov - Maďaryn",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "15:00",
                60,
                "AND S25",
                "Mazi",
                false
            )
        );

        result.push(
            ...generateFixed(
                ["16:31", "18:31"],
                "AND S7",
                "Ana-Pralesov - Hambrovce - Azilka",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:03",
                60,
                "AND R1",
                "Křečíkov-Alfonsovice - Křečkov hl.n.",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:04",
                60,
                "RJET R56",
                "Osady u Maďarynu - Praha hl.n.",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:04",
                60,
                "RJET R56",
                "Ana-Pralesov",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "15:13",
                120,
                "AND R77",
                "Niryny - Štěpánov",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:20",
                60,
                "RJET R4",
                "Vícmanice - Gorzów Wielkopolski",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:17",
                60,
                "AND Sp27",
                "Svíčkov - Žábry",
                false
            )
        );

        result.push(
            ...generateRecurring(
                "14:23",
                60,
                "AND S92",
                "Lamov - Niryny",
                false
            )
        );

    } else {

        result.push(
            ...generateRecurring(
                "10:12",
                20,
                "AND S1",
                "Starý Lízátkov",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "10:15",
                20,
                "AND S1",
                "Ana-Pralesov - Ana-Ansko",
                true
            )
        );

        result.push(
            ...generateFixed(
                ["18:31"],
                "AND S7",
                "Ana-Pralesov - Hambrovce - Azilka",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "10:03",
                60,
                "AND R1",
                "Křečíkov-Alfonsovice - Křečkov hl.n.",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "10:28",
                60,
                "AND S15",
                "Ulrychov - Habže - Filíkov - Silininky",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "10:58",
                60,
                "AND S15",
                "Ulrychov - Habže - Silininky",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "10:04",
                120,
                "RJET R56",
                "Osady u Maďarynu - Praha hl.n.",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "11:04",
                120,
                "RJET R56",
                "Ana-Pralesov",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "11:13",
                120,
                "AND R77",
                "Niryny - Štěpánov",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "10:56",
                60,
                "AND S14",
                "Snovín - Velkoplochovice - Svíčkov",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "10:17",
                120,
                "AND Sp27",
                "Svíčkov - Žábry",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "11:17",
                120,
                "AND Sp27",
                "Svíčkov",
                true
            )
        );

        result.push(
            ...generateFixed(
                [
                    "10:30",
                    "11:30",
                    "13:30",
                    "14:30",
                    "16:30",
                    "17:30",
                    "18:30"
                ],
                "AND S25",
                "Trnkov - Maďaryn",
                true
            )
        );

        result.push(
            ...generateFixed(
                ["12:30", "15:30"],
                "AND S25",
                "Mazi",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "10:23",
                120,
                "AND S92",
                "Lamov - Niryny",
                true
            )
        );

        result.push(
            ...generateRecurring(
                "10:20",
                120,
                "RJET R4",
                "Vícmanice - Gorzów Wielkopolski",
                true
            )
        );
    }

    return result;
}


// =====================================================
// OVERRIDE AUTOMATICKÝCH SPOJŮ
// =====================================================

function applyOverride(item) {

    const override =
        plannedOverrides[item.overrideKey];

    if (!override) {
        return { ...item };
    }

    return {
        ...item,

        delay:
            override.delay !== undefined
                ? override.delay
                : item.delay,

        platform:
            override.platform !== undefined
                ? override.platform
                : item.platform,

        track:
            override.track !== undefined
                ? override.track
                : item.track
    };
}


// =====================================================
// SPOJE
// =====================================================

function getAllDepartures() {

    const automatic =
        getAutomaticDepartures()
            .map(applyOverride);

    const manual =
        departures.map(item => ({
            ...item,
            planned: false
        }));

    return [
        ...automatic,
        ...manual
    ];
}


function getActiveDepartures() {

    const all =
        getAllDepartures();

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    return all.filter(item => {

        const departureTime =
            timeToMinutes(item.time);

        const effectiveTime =
            departureTime +
            delayToMinutes(item.delay);

        return effectiveTime > currentMinutes;
    });
}


function sortDepartures(items) {

    return [...items].sort(
        (a, b) =>
            timeToMinutes(a.time) -
            timeToMinutes(b.time)
    );
}


// =====================================================
// TABULE
// =====================================================

function renderBoard() {

    if (!departuresBoard) return;

    const active =
        sortDepartures(
            getActiveDepartures()
        );

    // Na tabuli zobrazit vždy maximálně 10 odjezdů
    const visibleDepartures =
        active.slice(0, 10);

    departuresBoard.innerHTML = "";


    if (visibleDepartures.length === 0) {

        departuresBoard.innerHTML = `
            <div class="no-departures">
                ŽÁDNÉ DALŠÍ ODJEZDY
            </div>
        `;

        return;
    }


    visibleDepartures.forEach(item => {

        const delay =
            delayToMinutes(item.delay);

        const row =
            document.createElement("div");

        row.className =
            "departure";


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

            <div class="departure-delay ${
                delay > 0
                    ? "departure-delayed"
                    : "departure-on-time"
            }">
                ${
                    delay > 0
                        ? "+" + delay + " minut"
                        : "Včas"
                }
            </div>

            <div class="departure-platform">
                ${
                    item.platform
                        ? escapeHtml(item.platform)
                        : "-"
                }
            </div>

            <div class="departure-track">
                ${
                    item.track
                        ? escapeHtml(item.track)
                        : "-"
                }
            </div>
        `;


        departuresBoard.appendChild(row);
    });
}

// =====================================================
// SEZNAM PRO ÚPRAVU
// =====================================================

function renderEntryList() {

    if (!entryList) return;

    const active =
        sortDepartures(
            getActiveDepartures()
        );

    entryList.innerHTML = "";


    active.forEach(item => {

        const row =
            document.createElement("div");

        row.className =
            "entry-item";


        row.innerHTML = `

            <div class="entry-time">
                ${escapeHtml(item.time)}
            </div>

            <div class="entry-train">
                ${escapeHtml(item.train)}
            </div>

            <div class="entry-destination">
                ${escapeHtml(item.destination)}
            </div>

            <input
                class="edit-field"
                type="number"
                min="0"
                placeholder="zpoždění"
                value="${escapeHtml(item.delay || "")}"
                data-id="${escapeHtml(item.id)}"
                data-field="delay"
            >

            <input
                class="edit-field"
                type="text"
                placeholder="Nást."
                value="${escapeHtml(item.platform || "")}"
                data-id="${escapeHtml(item.id)}"
                data-field="platform"
            >

            <input
                class="edit-field"
                type="text"
                placeholder="Kolej"
                value="${escapeHtml(item.track || "")}"
                data-id="${escapeHtml(item.id)}"
                data-field="track"
            >

            ${
                item.planned
                    ? ""
                    : `
                        <button
                            class="delete-button"
                            data-delete="${escapeHtml(item.id)}"
                            type="button"
                        >
                            ×
                        </button>
                    `
            }
        `;


        entryList.appendChild(row);
    });


    attachEditEvents();
}


// =====================================================
// ÚPRAVA
// =====================================================

function saveEdit(field) {

    const id =
        field.dataset.id;

    const property =
        field.dataset.field;

    const value =
        field.value.trim();


    const automatic =
        getAutomaticDepartures()
            .find(item => item.id === id);


    if (automatic) {

        const key =
            automatic.overrideKey;

        if (!plannedOverrides[key]) {
            plannedOverrides[key] = {};
        }


        if (property === "delay") {

            plannedOverrides[key].delay =
                value === ""
                    ? ""
                    : Math.max(0, Number(value) || 0);

        } else {

            plannedOverrides[key][property] =
                value;
        }


        saveOverrides();

    } else {

        const item =
            departures.find(
                departure =>
                    departure.id === id
            );

        if (!item) return;


        if (property === "delay") {

            item.delay =
                value === ""
                    ? ""
                    : Math.max(0, Number(value) || 0);

        } else {

            item[property] = value;
        }


        saveDepartures();
    }


    renderBoard();
}


function attachEditEvents() {

    entryList
        .querySelectorAll(".edit-field")
        .forEach(field => {

            field.addEventListener(
                "blur",
                () => saveEdit(field)
            );


            field.addEventListener(
                "keydown",
                event => {

                    if (event.key === "Enter") {

                        event.preventDefault();

                        field.blur();
                    }
                }
            );
        });


    entryList
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.delete;

                    departures =
                        departures.filter(
                            item =>
                                item.id !== id
                        );

                    saveDepartures();

                    renderEntryList();
                    renderBoard();
                }
            );
        });
}


// =====================================================
// PŘIDÁNÍ SPOJE
// =====================================================

addButton.addEventListener(
    "click",
    () => {

        if (
            !timeInput.value ||
            !trainInput.value.trim() ||
            !destinationInput.value.trim()
        ) {
            alert(
                "Vyplň ČAS, LINKU / ČÍSLO VLAKU a SMĚR."
            );

            return;
        }


        const item = {

            id:
                "manual_" +
                Date.now(),

            planned: false,

            time:
                timeInput.value,

            delay:
                delayInput.value,

            train:
                trainInput.value.trim(),

            destination:
                destinationInput.value.trim(),

            platform:
                platformInput.value.trim(),

            track:
                trackInput.value.trim()
        };


        departures.push(item);

        saveDepartures();


        timeInput.value = "";
        delayInput.value = "";
        trainInput.value = "";
        destinationInput.value = "";
        platformInput.value = "";
        trackInput.value = "";


        renderEntryList();
        renderBoard();
    }
);


// =====================================================
// HODINY
// =====================================================

function updateClocks() {

    const now = new Date();

    const fullTime =
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


    if (clock) {
        clock.textContent =
            fullTime;
    }

    if (boardClock) {
        boardClock.textContent =
            shortTime;
    }
}


// =====================================================
// PŘEPNUTÍ *
// =====================================================

function showBoard() {

    entryScreen.classList.add("hidden");

    boardScreen.classList.remove("hidden");

    renderBoard();
}


function showEntry() {

    boardScreen.classList.add("hidden");

    entryScreen.classList.remove("hidden");

    renderEntryList();
}


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "*") {

            if (
                boardScreen.classList.contains("hidden")
            ) {
                showBoard();
            } else {
                showEntry();
            }
        }
    }
);


// =====================================================
// START
// =====================================================

updateClocks();

renderEntryList();

renderBoard();


// =====================================================
// AKTUALIZACE
// =====================================================

setInterval(
    () => {

        updateClocks();

        renderBoard();


        // Pokud zrovna uživatel píše,
        // seznam se nepřekresluje.
        if (
            !entryScreen.classList.contains("hidden")
        ) {

            const active =
                document.activeElement;

            if (
                !active ||
                !entryList.contains(active)
            ) {
                renderEntryList();
            }
        }

    },
    1000
);
