document.addEventListener("DOMContentLoaded", () => {

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

    const clock = document.getElementById("clock");
    const boardClock = document.getElementById("boardClock");

    let departuresData = [];

    /* =========================
       PLÁNOVANÉ SPOJE
    ========================= */

    const planned = [
        {
            train: "AND S7",
            destination: "Ana-Pralesov - Hambrovce - Azilka",
            times: ["16:31", "18:31", "21:31", "22:31"]
        },

        {
            train: "AND R1",
            destination: "Trnkov - Křečíkov - Alfonsovice - Křečkov hl.n.",
            start: "14:03",
            interval: 60
        },

        {
            train: "AND S15",
            destination: "Ulrychov - Habže - Filíkov - Silininky",
            start: "14:13",
            interval: 30
        },

        {
            train: "AND S15",
            destination: "Ulrychov - Habže - Silininky",
            start: "14:58",
            interval: 60
        },

        {
            train: "RJET R56",
            destination: "Ana-Pralesov",
            start: "14:04",
            interval: 60
        },

        {
            train: "RJET R56",
            destination: "Osady u Maďarynu - Praha hl.n.",
            start: "14:04",
            interval: 60
        },

        {
            train: "AND R77",
            destination: "Niryny - Štěpánov",
            start: "15:13",
            interval: 120
        },

        {
            train: "AND S1",
            destination: "Starý Lízátkov",
            start: "14:12",
            interval: 20
        },

        {
            train: "AND S1",
            destination: "Ana-Pralesov - Ana-Ansko",
            start: "14:15",
            interval: 20
        }
    ];

    /* =========================
       POMOCNÉ FUNKCE
    ========================= */

    function id() {
        return Date.now() + Math.random();
    }

    function minutes(time) {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    }

    function timeFromMinutes(value) {
        const h = Math.floor(value / 60);
        const m = value % 60;

        return (
            String(h).padStart(2, "0") +
            ":" +
            String(m).padStart(2, "0")
        );
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    /* =========================
       GENEROVÁNÍ JÍZDNÍHO ŘÁDU
    ========================= */

    function generatePlanned() {

        const result = [];

        const day = new Date().getDay();

        // pouze pracovní dny
        if (day === 0 || day === 6) {
            return result;
        }

        planned.forEach(item => {

            if (item.times) {

                item.times.forEach(time => {

                    result.push({
                        id: id(),
                        time: time,
                        train: item.train,
                        destination: item.destination,
                        delay: "",
                        platform: "",
                        track: "",
                        planned: true
                    });

                });

                return;
            }

            let current = minutes(item.start);

            while (current <= 23 * 60 + 59) {

                result.push({
                    id: id(),
                    time: timeFromMinutes(current),
                    train: item.train,
                    destination: item.destination,
                    delay: "",
                    platform: "",
                    track: "",
                    planned: true
                });

                current += item.interval;
            }

        });

        return result;
    }

    /* =========================
       LOCAL STORAGE
    ========================= */

    function save() {
        localStorage.setItem(
            "DPMA_TRAIN_DATA",
            JSON.stringify(departuresData)
        );
    }

    function load() {

        const saved = localStorage.getItem("DPMA_TRAIN_DATA");

        if (saved) {

            try {

                departuresData = JSON.parse(saved);

                if (!Array.isArray(departuresData)) {
                    departuresData = [];
                }

            } catch {

                departuresData = [];

            }

        }

        // pokud není nic uložené
        if (departuresData.length === 0) {

            departuresData = generatePlanned();

            save();

        }

    }

    /* =========================
       PŘIDÁNÍ SPOJE
    ========================= */

    function addDeparture() {

        const time = timeInput.value;
        const train = trainInput.value.trim();
        const destination = destinationInput.value.trim();

        const delay = delayInput.value.trim();
        const platform = platformInput.value.trim();
        const track = trackInput.value.trim();

        if (!time) {
            alert("Zadej čas odjezdu.");
            timeInput.focus();
            return;
        }

        if (!train) {
            alert("Zadej linku / číslo vlaku.");
            trainInput.focus();
            return;
        }

        if (!destination) {
            alert("Zadej směr.");
            destinationInput.focus();
            return;
        }

        departuresData.push({

            id: id(),

            time: time,
            train: train,
            destination: destination,

            delay: delay,
            platform: platform,
            track: track,

            planned: false

        });

        sort();

        save();

        render();

        // vyčištění polí
        trainInput.value = "";
        destinationInput.value = "";
        delayInput.value = "";
        platformInput.value = "";
        trackInput.value = "";

        trainInput.focus();
    }

    /* =========================
       ŘAZENÍ
    ========================= */

    function sort() {

        departuresData.sort((a, b) => {

            return minutes(a.time) - minutes(b.time);

        });

    }

    /* =========================
       EDITACE
    ========================= */

    window.changeDeparture = function(index, field, value) {

        if (!departuresData[index]) return;

        departuresData[index][field] = value;

        save();

        renderEntryList();
        renderBoard();

    };

    window.removeDeparture = function(index) {

        departuresData.splice(index, 1);

        save();

        render();

    };

    /* =========================
       SEZNAM V ZADÁVÁNÍ
    ========================= */

    function renderEntryList() {

        entryList.innerHTML = "";

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
                        value="${escapeHtml(item.delay)}"
                        onchange="changeDeparture(${index}, 'delay', this.value)"
                    >
                </div>

                <div>
                    <span class="edit-label">Nást.</span>
                    <input
                        type="text"
                        value="${escapeHtml(item.platform)}"
                        onchange="changeDeparture(${index}, 'platform', this.value)"
                    >
                </div>

                <div>
                    <span class="edit-label">Kolej</span>
                    <input
                        type="text"
                        value="${escapeHtml(item.track)}"
                        onchange="changeDeparture(${index}, 'track', this.value)"
                    >
                </div>

                <button
                    class="delete-button"
                    onclick="removeDeparture(${index})"
                >
                    ×
                </button>

            `;

            entryList.appendChild(row);

        });

    }

    /* =========================
       ODJEZDOVÁ TABULE
    ========================= */

    function renderBoard() {

        departures.innerHTML = "";

        if (departuresData.length === 0) {

            departures.innerHTML =
                `<div class="empty-board">ŽÁDNÉ ODJEZDY</div>`;

            return;
        }

        departuresData.forEach(item => {

            const row = document.createElement("div");

            row.className = "departure";

            let delay = "";

            if (
                item.delay !== "" &&
                Number(item.delay) > 0
            ) {

                delay =
                    `<span class="delay delayed">+${escapeHtml(item.delay)} min</span>`;

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
                    ${delay}
                </span>

                <span class="departure-platform">
                    ${escapeHtml(item.platform)}
                </span>

                <span class="departure-track">
                    ${escapeHtml(item.track)}
                </span>

            `;

            departures.appendChild(row);

        });

    }

    /* =========================
       VYKRESLENÍ
    ========================= */

    function render() {

        sort();

        renderEntryList();

        renderBoard();

    }

    /* =========================
       PŘEPÍNÁNÍ TABULE
    ========================= */

    function toggleBoard() {

        entryScreen.classList.toggle("hidden");

        boardScreen.classList.toggle("hidden");

        if (
            !boardScreen.classList.contains("hidden")
        ) {

            renderBoard();

        } else {

            trainInput.focus();

        }

    }

    /* =========================
       HODINY
    ========================= */

    function updateClock() {

        const now = new Date();

        const full = now.toLocaleTimeString(
            "cs-CZ",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

        const short = now.toLocaleTimeString(
            "cs-CZ",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

        if (clock) {
            clock.textContent = full;
        }

        if (boardClock) {
            boardClock.textContent = short;
        }

    }

    /* =========================
       VÝCHOZÍ ČAS
    ========================= */

    function setDefaultTime() {

        if (timeInput.value) return;

        const now = new Date();

        timeInput.value =
            String(now.getHours()).padStart(2, "0") +
            ":" +
            String(now.getMinutes()).padStart(2, "0");

    }

    /* =========================
       EVENTY
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

                toggleBoard();

            }

        }
    );

    /* ENTER = PŘIDAT */
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !boardScreen.classList.contains("hidden")
            ) {
                return;
            }

            if (
                event.key === "Enter" &&
                document.activeElement.tagName === "INPUT"
            ) {

                event.preventDefault();

                addDeparture();

            }

        }
    );

    /* =========================
       START
    ========================= */

    load();

    setDefaultTime();

    render();

    updateClock();

    setInterval(
        updateClock,
        1000
    );

});
```
