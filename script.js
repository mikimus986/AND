const entryScreen = document.getElementById("entryScreen");
const boardScreen = document.getElementById("boardScreen");
const entryList = document.getElementById("entryList");
const departureForm = document.getElementById("departureForm");

const timeInput = document.getElementById("time");
const delayInput = document.getElementById("delay");
const trainInput = document.getElementById("train");
const destinationInput = document.getElementById("destination");
const platformInput = document.getElementById("platform");
const trackInput = document.getElementById("track");

const clockElements = document.querySelectorAll("#clock, .clock");

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
    if (!time || !time.includes(":")) {
        return 0;
    }

    const parts = time.split(":");
    return Number(parts[0]) * 60 + Number(parts[1]);
}


function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    return (
        String(h).padStart(2, "0") +
        ":" +
        String(m).padStart(2, "0")
    );
}


function delayToMinutes(delay) {
    if (delay === null || delay === undefined || delay === "") {
        return 0;
    }

    const value = Number(delay);

    if (isNaN(value) || value < 0) {
        return 0;
    }

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


function saveData() {
    localStorage.setItem(
        "departures",
        JSON.stringify(departures)
    );
}


function getToday() {
    return new Date();
}


// =====================================================
// AUTOMATICKÉ SPOJE
// =====================================================

function generateRecurring(
    startTime,
    interval,
    train,
    destination,
    isWeekend
) {
    const result = [];

    let current = timeToMinutes(startTime);

    while (current <= 18 * 60 + 59) {

        result.push({
            id:
                "planned_" +
                train.replace(/\s/g, "") +
                "_" +
                current +
                "_" +
                destination,

            planned: true,

            time: minutesToTime(current),

            train: train,

            destination: destination,

            platform: "",

            track: "",

            delay: "",

            overrideKey:
                train +
                "|" +
                destination +
                "|" +
                minutesToTime(current),

            weekend: isWeekend
        });

        current += interval;
    }

    return result;
}


function generateFixed(
    times,
    train,
    destination,
    isWeekend
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

        time: time,

        train: train,

        destination: destination,

        platform: "",

        track: "",

        delay: "",

        overrideKey:
            train +
            "|" +
            destination +
            "|" +
            time,

        weekend: isWeekend
    }));
}


function getAutomaticDepartures() {
    const date = getToday();
    const day = date.getDay();

    const isWeekend = day === 0 || day === 6;

    let result = [];

    if (!isWeekend) {

        // S1
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


        // S14
        result.push(
            ...generateRecurring(
                "14:26",
                30,
                "AND S14",
                "Snovín - Velkoplochovice - Svíčkov",
                false
            )
        );


        // S15
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


        // S25
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


        // S7
        result.push(
            ...generateFixed(
                ["16:31", "18:31"],
                "AND S7",
                "Ana-Pralesov - Hambrovce - Azilka",
                false
            )
        );


        // R1
        result.push(
            ...generateRecurring(
                "14:03",
                60,
                "AND R1",
                "Křečíkov-Alfonsovice - Křečkov hl.n.",
                false
            )
        );


        // RJET R56
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


        // R77
        result.push(
            ...generateRecurring(
                "15:13",
                120,
                "AND R77",
                "Niryny - Štěpánov",
                false
            )
        );


        // R4
        result.push(
            ...generateRecurring(
                "14:20",
                60,
                "RJET R4",
                "Vícmanice - Gorzów Wielkopolski",
                false
            )
        );


        // Sp27
        result.push(
            ...generateRecurring(
                "14:17",
                60,
                "AND Sp27",
                "Svíčkov - Žábry",
                false
            )
        );


        // S92
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

        // S1
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


        // S7
        result.push(
            ...generateFixed(
                ["18:31"],
                "AND S7",
                "Ana-Pralesov - Hambrovce - Azilka",
                true
            )
        );


        // R1
        result.push(
            ...generateRecurring(
                "10:03",
                60,
                "AND R1",
                "Křečíkov-Alfonsovice - Křečkov hl.n.",
                true
            )
        );


        // S15
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


        // RJET R56
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


        // R77
        result.push(
            ...generateRecurring(
                "11:13",
                120,
                "AND R77",
                "Niryny - Štěpánov",
                true
            )
        );


        // S14
        result.push(
            ...generateRecurring(
                "10:56",
                60,
                "AND S14",
                "Snovín - Velkoplochovice - Svíčkov",
                true
            )
        );


        // Sp27
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


        // S25 Trnkov
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


        // S25 Mazi
        result.push(
            ...generateFixed(
                ["12:30", "15:30"],
                "AND S25",
                "Mazi",
                true
            )
        );


        // S92
        result.push(
            ...generateRecurring(
                "10:23",
                120,
                "AND S92",
                "Lamov - Niryny",
                true
            )
        );


        // R4
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

function applyPlannedOverrides(item) {

    const key = item.overrideKey;

    if (!plannedOverrides[key]) {
        return {
            ...item
        };
    }

    const override = plannedOverrides[key];

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
// AKTIVNÍ SPOJE
// =====================================================

function getEffectiveDepartureMinutes(item) {
    return (
        timeToMinutes(item.time) +
        delayToMinutes(item.delay)
    );
}


function getActiveDepartures() {

    const automatic = getAutomaticDepartures()
        .map(applyPlannedOverrides);

    const manual = departures.map(item => ({
        ...item,
        planned: false
    }));

    const all = [
        ...automatic,
        ...manual
    ];

    const now = new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    return all.filter(item => {

        const effectiveTime =
            getEffectiveDepartureMinutes(item);

        return effectiveTime > currentMinutes;
    });
}


// =====================================================
// ŘAZENÍ
// =====================================================

function sortDepartures(data) {

    return [...data].sort((a, b) => {

        const plannedA =
            timeToMinutes(a.time);

        const plannedB =
            timeToMinutes(b.time);

        return plannedA - plannedB;
    });
}


// =====================================================
// TABULE
// =====================================================

function renderBoard() {

    const board = document.getElementById("departuresBoard");

    if (!board) {
        return;
    }

    const activeDepartures =
        sortDepartures(
            getActiveDepartures()
        );

    board.innerHTML = "";

    activeDepartures.forEach(item => {

        const delay =
            delayToMinutes(item.delay);

        let delayText = "Včas";
        let delayClass = "departure-on-time";

        if (delay > 0) {
            delayText =
                `+${delay} minut`;

            delayClass =
                "departure-delayed";
        }


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

            <div class="departure-delay ${delayClass}">
                ${escapeHtml(delayText)}
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

        board.appendChild(row);
    });


    if (activeDepartures.length === 0) {

        board.innerHTML = `
            <div class="no-departures">
                Žádné další odjezdy
            </div>
        `;
    }
}


// =====================================================
// SEZNAM PRO ÚPRAVU
// =====================================================

function renderEntryList() {

    if (!entryList) {
        return;
    }

    const activeDepartures =
        sortDepartures(
            getActiveDepartures()
        );

    entryList.innerHTML = "";


    activeDepartures.forEach(item => {

        const row =
            document.createElement("div");

        row.className =
            "entry-item";


        const delay =
            item.delay ?? "";

        const platform =
            item.platform ?? "";

        const track =
            item.track ?? "";


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
                data-id="${escapeHtml(item.id)}"
                data-field="delay"
                type="number"
                min="0"
                placeholder="zpoždění"
                value="${escapeHtml(delay)}"
            >

            <input
                class="edit-field"
                data-id="${escapeHtml(item.id)}"
                data-field="platform"
                type="text"
                placeholder="Nást."
                value="${escapeHtml(platform)}"
            >

            <input
                class="edit-field"
                data-id="${escapeHtml(item.id)}"
                data-field="track"
                type="text"
                placeholder="Kolej"
                value="${escapeHtml(track)}"
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
// ÚPRAVY
// =====================================================

function updateDeparture(
    id,
    field,
    value
) {

    const item =
        departures.find(
            departure =>
                departure.id === id
        );

    if (!item) {
        return;
    }

    if (field === "delay") {

        if (value === "") {
            item.delay = "";
        } else {
            const number =
                Number(value);

            item.delay =
                isNaN(number)
                    ? ""
                    : Math.max(0, number);
        }

    } else {

        item[field] =
            value;
    }


    saveData();

    // Pouze tabule.
    // Seznam se NESMÍ překreslit,
    // protože by zmizel focus z inputu.
    renderBoard();
}


function updatePlannedDeparture(
    item,
    field,
    value
) {

    const key =
        item.overrideKey;

    if (!plannedOverrides[key]) {
        plannedOverrides[key] = {};
    }


    if (field === "delay") {

        if (value === "") {

            plannedOverrides[key].delay = "";

        } else {

            const number =
                Number(value);

            plannedOverrides[key].delay =
                isNaN(number)
                    ? ""
                    : Math.max(0, number);
        }

    } else {

        plannedOverrides[key][field] =
            value;
    }


    localStorage.setItem(
        "plannedOverrides",
        JSON.stringify(plannedOverrides)
    );


    // Pouze tabule.
    renderBoard();
}


// =====================================================
// EVENTY PRO INPUTY
// =====================================================

function attachEditEvents() {

    const fields =
        entryList.querySelectorAll(
            ".edit-field"
        );


    fields.forEach(field => {

        field.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    field.blur();
                }
            }
        );


        field.addEventListener(
            "blur",
            () => {

                const id =
                    field.dataset.id;

                const property =
                    field.dataset.field;

                const value =
                    field.value.trim();


                const automatic =
                    getAutomaticDepartures()
                        .find(
                            item =>
                                item.id === id
                        );


                if (automatic) {

                    updatePlannedDeparture(
                        automatic,
                        property,
                        value
                    );

                } else {

                    updateDeparture(
                        id,
                        property,
                        value
                    );
                }
            }
        );
    });


    const deleteButtons =
        entryList.querySelectorAll(
            "[data-delete]"
        );


    deleteButtons.forEach(button => {

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

                saveData();

                renderEntryList();
                renderBoard();
            }
        );
    });
}


// =====================================================
// PŘIDÁNÍ RUČNÍHO SPOJE
// =====================================================

if (departureForm) {

    departureForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            if (
                !timeInput.value ||
                !trainInput.value ||
                !destinationInput.value
            ) {
                return;
            }


            const item = {

                id:
                    Date.now().toString(),

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

            saveData();


            departureForm.reset();

            renderEntryList();
            renderBoard();
        }
    );
}


// =====================================================
// HODINY
// =====================================================

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


    clockElements.forEach(clock => {
        clock.textContent = time;
    });
}


// =====================================================
// PŘEPÍNÁNÍ TABULE / ZADÁVÁNÍ
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
// TLAČÍTKO PRO TABULI
// =====================================================

const boardButton =
    document.getElementById("showBoard");

if (boardButton) {

    boardButton.addEventListener(
        "click",
        showBoard
    );
}


const backButton =
    document.getElementById("backToEntry");

if (backButton) {

    backButton.addEventListener(
        "click",
        showEntry
    );
}


// =====================================================
// START
// =====================================================

updateClocks();

renderEntryList();
renderBoard();


// =====================================================
// AKTUALIZACE
// =====================================================

setInterval(() => {

    updateClocks();

    renderBoard();


    // TADY JE HLAVNÍ OPRAVA:
    // pokud je kurzor v některém políčku,
    // seznam se nepřekreslí.

    if (
        !entryScreen.classList.contains("hidden")
    ) {

        const active =
            document.activeElement;

        const editing =
            active &&
            entryList.contains(active);


        if (!editing) {
            renderEntryList();
        }
    }

}, 1000);
