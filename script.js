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


/* =========================================================
   ID AUTOMATICKÝCH SPOJŮ
========================================================= */

function createPlannedId(train, time, destination) {
    const cleanTrain = train
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-");

    const cleanDestination = destination
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-");

    return `planned-${cleanTrain}-${time.replace(":", "")}-${cleanDestination}`;
}


/* =========================================================
   PŘIDÁNÍ PLÁNOVANÉHO SPOJE
========================================================= */

function addPlanned(result, time, train, destination) {
    const [hour, minute] = time.split(":").map(Number);

    const totalMinutes =
        hour * 60 + minute;

    if (totalMinutes > END_TIME) {
        return;
    }

    result.push({
        id: createPlannedId(
            train,
            time,
            destination
        ),

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
   OPAKOVÁNÍ SPOJŮ
========================================================= */

function addEveryMinutes(
    result,
    startHour,
    startMinute,
    interval,
    train,
    destination
) {
    let minutes =
        startHour * 60 +
        startMinute;

    while (minutes <= END_TIME) {
        const hour =
            Math.floor(minutes / 60);

        const minute =
            minutes % 60;

        const time =
            String(hour).padStart(2, "0") +
            ":" +
            String(minute).padStart(2, "0");

        addPlanned(
            result,
            time,
            train,
            destination
        );

        minutes += interval;
    }
}


/* =========================================================
   GENEROVÁNÍ JÍZDNÍHO ŘÁDU
========================================================= */

function generatePlannedDepartures() {
    const result = [];

    const now = new Date();
    const day = now.getDay();

    const weekend =
        day === 0 ||
        day === 6;


    /* =====================================================
       PRACOVNÍ DNY
    ===================================================== */

    if (!weekend) {

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

    }


    /* =====================================================
       VÍKEND
    ===================================================== */

    else {

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


        // AND S15 - přes Filíkov
        addEveryMinutes(
            result,
            10,
            28,
            60,
            "AND S15",
            "Ulrychov - Habže - Filíkov - Silininky"
        );


        // AND S15 - bez Filíkova
        addEveryMinutes(
            result,
            10,
            58,
            60,
            "AND S15",
            "Ulrychov - Habže - Silininky"
        );


        // RJET R56 - Praha
        addEveryMinutes(
            result,
            10,
            4,
            120,
            "RJET R56",
            "Osady u Maďarynu - Praha hl.n."
        );


        // RJET R56 - Ana-Pralesov
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


        // AND Sp27 - Žábry
        addEveryMinutes(
            result,
            10,
            17,
            120,
            "AND Sp27",
            "Svíčkov - Žábry"
        );


        // AND Sp27 - Svíčkov
        addEveryMinutes(
            result,
            11,
            17,
            120,
            "AND Sp27",
            "Svíčkov"
        );


        // AND S25
        let s25Minutes =
            10 * 60 + 30;

        while (s25Minutes <= END_TIME) {

            const hour =
                Math.floor(
                    s25Minutes / 60
                );

            const minute =
                s25Minutes % 60;


            const isException =
                (hour === 12 && minute === 30) ||
                (hour === 15 && minute === 30) ||
                (hour === 20 && minute === 30);


            if (!isException) {

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


        // AND S25 - Mazi
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


/* =========================================================
   VÝCHOZÍ ČAS
========================================================= */

function setDefaultTime() {

    if (!timeInput) {
        return;
    }

    const now = new Date();

    const hours =
        String(now.getHours())
            .padStart(2, "0");

    const minutes =
        String(now.getMinutes())
            .padStart(2, "0");

    timeInput.value =
        `${hours}:${minutes}`;
}


/* =========================================================
   ULOŽENÍ
========================================================= */

function saveData() {

    localStorage.setItem(
        "trainDepartures",
        JSON.stringify(departuresData)
    );
}


/* =========================================================
   PŘIDÁNÍ VLASTNÍHO SPOJE
========================================================= */

function addDeparture() {

    const time =
        timeInput.value;

    const delay =
        delayInput.value.trim();

    const train =
        trainInput.value.trim();

    const destination =
        destinationInput.value.trim();

    const platform =
        platformInput.value.trim();

    const track =
        trackInput.value.trim();


    if (
        !time ||
        !train ||
        !destination
    ) {

        alert(
            "Vyplň čas, linku/číslo vlaku a směr."
        );

        return;
    }


    departuresData.push({

        id:
            `manual-${Date.now()}`,

        planned: false,

        time,

        delay:
            delay || "0",

        train,

        destination,

        platform,

        track
    });


    saveData();

    renderAll();


    delayInput.value = "";

    trainInput.value = "";

    destinationInput.value = "";

    platformInput.value = "";

    trackInput.value = "";


    setDefaultTime();
}


/* =========================================================
   ČAS → MINUTY
========================================================= */

function timeToMinutes(time) {

    if (!time) {
        return 0;
    }

    const parts =
        time.split(":").map(Number);

    return (
        parts[0] * 60 +
        parts[1]
    );
}


/* =========================================================
   ZPOŽDĚNÍ → MINUTY
========================================================= */

function delayToMinutes(delay) {

    if (
        delay === undefined ||
        delay === null ||
        delay === ""
    ) {
        return 0;
    }


    const text =
        String(delay)
            .replace(",", ".")
            .trim();


    const match =
        text.match(/-?\d+/);


    if (!match) {
        return 0;
    }


    const number =
        parseInt(
            match[0],
            10
        );


    if (isNaN(number)) {
        return 0;
    }


    return Math.max(
        0,
        number
    );
}


/* =========================================================
   SKUTEČNÝ ČAS ODJEZDU
   Používá se pouze pro zmizení spoje.
========================================================= */

function getEffectiveDepartureMinutes(item) {

    return (
        timeToMinutes(item.time) +
        delayToMinutes(item.delay)
    );
}


/* =========================================================
   ŘAZENÍ
   VŽDY PODLE PLÁNOVANÉHO ČASU!
========================================================= */

function sortDepartures(data) {

    return [...data].sort(
        (a, b) => {

            const plannedA =
                timeToMinutes(a.time);

            const plannedB =
                timeToMinutes(b.time);


            return (
                plannedA -
                plannedB
            );
        }
    );
}


/* =========================================================
   AKTIVNÍ SPOJE
   Zpoždění se zde používá pouze pro zmizení.
========================================================= */

function getActiveDepartures() {

    const all =
        getAllDepartures();


    const now =
        new Date();


    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    return all.filter(item => {

        const effectiveTime =
            getEffectiveDepartureMinutes(
                item
            );


        return (
            effectiveTime >=
            currentMinutes
        );
    });
}


/* =========================================================
   ÚPRAVA MANUÁLNÍHO SPOJE
========================================================= */

function updateDeparture(
    id,
    field,
    value
) {

    const allowedFields = [
        "delay",
        "platform",
        "track"
    ];


    if (
        !allowedFields.includes(field)
    ) {
        return;
    }


    const departure =
        departuresData.find(
            item =>
                item.id === id
        );


    if (!departure) {
        return;
    }


    departure[field] =
        value;


    saveData();

    renderAll();
}


/* =========================================================
   ÚPRAVA AUTOMATICKÉHO SPOJE
========================================================= */

function updatePlannedDeparture(
    id,
    field,
    value
) {

    const allowedFields = [
        "delay",
        "platform",
        "track"
    ];


    if (
        !allowedFields.includes(field)
    ) {
        return;
    }


    let overrides =
        JSON.parse(
            localStorage.getItem(
                "plannedOverrides"
            ) || "{}"
        );


    if (!overrides[id]) {
        overrides[id] = {};
    }


    overrides[id][field] =
        value;


    localStorage.setItem(
        "plannedOverrides",
        JSON.stringify(
            overrides
        )
    );


    renderAll();
}


/* =========================================================
   APLIKACE ÚPRAV
========================================================= */

function applyPlannedOverrides(data) {

    const overrides =
        JSON.parse(
            localStorage.getItem(
                "plannedOverrides"
            ) || "{}"
        );


    return data.map(item => {

        if (
            !item.planned ||
            !overrides[item.id]
        ) {
            return item;
        }


        return {
            ...item,
            ...overrides[item.id]
        };
    });
}


/* =========================================================
   SMAZÁNÍ
========================================================= */

function deleteDeparture(id) {

    departuresData =
        departuresData.filter(
            item =>
                item.id !== id
        );


    saveData();

    renderAll();
}


/* =========================================================
   VŠECHNY SPOJE
========================================================= */

function getAllDepartures() {

    const planned =
        generatePlannedDepartures();


    const plannedWithOverrides =
        applyPlannedOverrides(
            planned
        );


    return [
        ...plannedWithOverrides,
        ...departuresData
    ];
}


/* =========================================================
   EDITAČNÍ SEZNAM
========================================================= */

function renderEntryList() {

    if (!entryList) {
        return;
    }


    const all =
        sortDepartures(
            getActiveDepartures()
        );


    entryList.innerHTML = "";


    all.forEach(item => {

        const row =
            document.createElement(
                "div"
            );


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
                type="text"
                class="edit-field"
                placeholder="zpoždění"
                value="${escapeHtml(item.delay || "")}"
                data-field="delay"
            >

            <input
                type="text"
                class="edit-field"
                placeholder="nást."
                value="${escapeHtml(item.platform || "")}"
                data-field="platform"
            >

            <input
                type="text"
                class="edit-field"
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


        const inputs =
            row.querySelectorAll(
                ".edit-field"
            );


        inputs.forEach(input => {

            // Uloží při opuštění políčka
            input.addEventListener(
                "blur",
                () => {

                    saveEdit(
                        item,
                        input
                    );
                }
            );


            // Enter uloží změnu
            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        input.blur();
                    }
                }
            );
        });


        const deleteButton =
            row.querySelector(
                ".delete-button"
            );


        deleteButton.addEventListener(
            "click",
            () => {

                if (item.planned) {

                    let overrides =
                        JSON.parse(
                            localStorage.getItem(
                                "plannedOverrides"
                            ) || "{}"
                        );


                    delete overrides[
                        item.id
                    ];


                    localStorage.setItem(
                        "plannedOverrides",
                        JSON.stringify(
                            overrides
                        )
                    );


                    renderAll();

                } else {

                    deleteDeparture(
                        item.id
                    );
                }
            }
        );


        entryList.appendChild(
            row
        );
    });
}


/* =========================================================
   ULOŽENÍ EDITACE
========================================================= */

function saveEdit(item, input) {

    const field =
        input.dataset.field;

    const value =
        input.value;


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
}


/* =========================================================
   TABULE
========================================================= */

function renderBoard() {

    if (!departures) {
        return;
    }


    // Řazení je podle PLÁNOVANÉHO času.
    // Zpoždění pouze prodlužuje dobu zobrazení.
    const all =
        sortDepartures(
            getActiveDepartures()
        );


    const visible =
        all.slice(0, 8);


    departures.innerHTML = "";


    visible.forEach(item => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "departure";


        const delay =
            delayToMinutes(
                item.delay
            );


        let delayText =
            "Včas";

        let delayClass =
            "departure-on-time";


        if (delay > 0) {

            delayText =
                `+${delay} minut`;

            delayClass =
                "departure-delayed";
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

            <div class="departure-delay ${delayClass}">
                ${escapeHtml(delayText)}
            </div>

            <div class="departure-platform">
                ${escapeHtml(item.platform || "-")}
            </div>

            <div class="departure-track">
                ${escapeHtml(item.track || "-")}
            </div>
        `;


        departures.appendChild(
            row
        );
    });


    if (visible.length === 0) {

        departures.innerHTML = `
            <div class="no-departures">
                Žádné další odjezdy
            </div>
        `;
    }
}


/* =========================================================
   VYKRESLENÍ
========================================================= */

function renderAll() {

    renderEntryList();

    renderBoard();
}


/* =========================================================
   PŘEPÍNÁNÍ
========================================================= */

function toggleScreen() {

    entryScreen.classList.toggle(
        "hidden"
    );

    boardScreen.classList.toggle(
        "hidden"
    );


    renderAll();
}


/* =========================================================
   HODINY
========================================================= */

function updateClocks() {

    const now =
        new Date();


    const time =
        String(
            now.getHours()
        ).padStart(2, "0") +
        ":" +
        String(
            now.getMinutes()
        ).padStart(2, "0") +
        ":" +
        String(
            now.getSeconds()
        ).padStart(2, "0");


    const mainClock =
        document.getElementById(
            "clock"
        );


    if (mainClock) {

        mainClock.textContent =
            time;
    }


    const clocks =
        document.querySelectorAll(
            ".clock"
        );


    clocks.forEach(clock => {

        clock.textContent =
            time;
    });
}


/* =========================================================
   BEZPEČNÉ HTML
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   OVLÁDÁNÍ
========================================================= */

if (addButton) {

    addButton.addEventListener(
        "click",
        addDeparture
    );
}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "*"
        ) {

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


setInterval(
    () => {

        updateClocks();

        renderBoard();

        renderEntryList();

    },
    1000
);
