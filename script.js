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

    // Nástupiště a kolej už NEJSOU povinné
    const platform = platformInput.value.trim();
    const track = trackInput.value.trim();

    if (!time || !train || !destination) {
        alert("Vyplň prosím čas, linku / číslo vlaku a směr.");
        return;
    }

    departuresData.push({
        time: time,
        delay: delay || "0",
        train: train,
        destination: destination,
        platform: platform,
        track: track
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
}

function sortDepartures() {
    departuresData.sort((a, b) => {
        return a.time.localeCompare(b.time);
    });
}

function updateDeparture(index, field, value) {
    if (!departuresData[index]) {
        return;
    }

    departuresData[index][field] = value;

    saveData();
    renderBoard();
}

function deleteDeparture(index) {
    departuresData.splice(index, 1);

    saveData();
    renderAll();
}

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
                    value="${escapeHtml(item.delay === "0" ? "" : item.delay)}"
                    placeholder="0"
                    onchange="updateDeparture(${index}, 'delay', this.value || '0')"
                >
            </div>

            <div>
                <span class="edit-label">Nást.</span>
                <input
                    type="text"
                    value="${escapeHtml(item.platform)}"
                    placeholder="-"
                    onchange="updateDeparture(${index}, 'platform', this.value)"
                >
            </div>

            <div>
                <span class="edit-label">Kolej</span>
                <input
                    type="text"
                    value="${escapeHtml(item.track)}"
                    placeholder="-"
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
}

function renderBoard() {
    departures.innerHTML = "";

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

function renderAll() {
    sortDepartures();

    renderEntryList();
    renderBoard();
}

function toggleScreen() {
    entryScreen.classList.toggle("hidden");
    boardScreen.classList.toggle("hidden");

    if (!boardScreen.classList.contains("hidden")) {
        renderBoard();
    } else {
        trainInput.focus();
    }
}

function updateClocks() {
    const now = new Date();

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
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

addButton.addEventListener("click", addDeparture);

document.addEventListener("keydown", (event) => {
    if (event.key === "*") {
        event.preventDefault();
        toggleScreen();
    }
});

setDefaultTime();
renderAll();
updateClocks();

setInterval(updateClocks, 1000);
