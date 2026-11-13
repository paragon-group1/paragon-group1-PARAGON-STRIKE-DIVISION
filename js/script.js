/* ==========================================================
   PARAGON // SYSTEM BOOT ENGINE — v2
========================================================== */

(function () {

    const screen   = document.getElementById("systemBoot");
    const trigger  = document.querySelector(".enter-button");

    if (!screen || !trigger) return;

    const bar      = document.getElementById("pbBar");
    const pctEl    = document.getElementById("pbPct");
    const statusEl = document.getElementById("pbStatus");
    const logEl    = document.getElementById("pbLog");
    const rainEl   = document.getElementById("pbRain");

    let running = false;

    const LOG = [
        [0,  "ONLINE_", "g"],
        [4,  "01 // INITIALIZING"],
        [10, "10.0.0.24", "d"],
        [16, "SYSTEM CHECK..."],
        [28, "SECURITY VERIFIED", "g"],
        [42, "NETWORK CONNECTED", "g"],
        [56, "AUTH HANDSHAKE // 0x7F2A", "d"],
        [70, "LOADING COMMAND MODULES", "d"],
        [84, "ENCRYPTION LAYER READY"],
        [95, "ACCESS GRANTED", "g"]
    ];

    const STATUS = [
        [0,   "INITIALIZING SYSTEM"],
        [14,  "RUNNING SYSTEM CHECK"],
        [28,  "VERIFYING SECURITY"],
        [42,  "CONNECTING NETWORK"],
        [56,  "SYNCHRONIZING DATA"],
        [72,  "LOADING MODULES"],
        [88,  "FINALIZING BOOT"],
        [100, "ACCESS GRANTED"]
    ];

    function pad(n) {
        return n < 10 ? "0" + n : String(n);
    }

    function statusAt(v) {
        let out = STATUS[0][1];
        for (const item of STATUS) {
            if (v >= item[0]) out = item[1];
        }
        return out;
    }

    function pushLog(text, cls) {
        if (!logEl) return;
        const p = document.createElement("p");
        p.textContent = text;
        if (cls) p.className = cls;
        logEl.appendChild(p);
    }

    function buildRain() {
        if (!rainEl || rainEl.childElementCount) return;

        const chars = "01ABCDEF0123456789<>/{}[]#$%&*";

        for (let i = 0; i < 9; i++) {

            const col = document.createElement("span");
            let text = "";

            for (let j = 0; j < 60; j++) {
                text += chars[Math.floor(Math.random() * chars.length)];
            }

            col.textContent = text;
            col.style.animationDuration = (9 + Math.random() * 12) + "s";
            col.style.animationDelay = (-Math.random() * 16) + "s";

            rainEl.appendChild(col);
        }
    }

    function boot() {

        if (running) return;
        running = true;

        screen.removeAttribute("hidden");
        screen.setAttribute("aria-hidden", "false");
        screen.classList.add("is-on");

        document.body.style.overflow = "hidden";

        buildRain();

        pushLog("ONLINE_", "g");
        pushLog("01 // INITIALIZING");

        let progress = 1;
        let logIndex = 2;
        let lastStatus = "";

        const timer = setInterval(function () {

            progress += Math.random() * 2.2 + 0.8;
            if (progress > 100) progress = 100;

            const value = Math.floor(progress);

            if (bar) bar.style.width = value + "%";
            if (pctEl) pctEl.textContent = pad(value) + "%";

            const st = statusAt(value);

            if (statusEl && st !== lastStatus) {
                statusEl.textContent = st;
                lastStatus = st;
            }

            while (logIndex < LOG.length && LOG[logIndex][0] <= value) {
                pushLog(LOG[logIndex][1], LOG[logIndex][2]);
                logIndex++;
            }

            if (value >= 100) {

                clearInterval(timer);

                if (bar) bar.style.width = "100%";
                if (pctEl) pctEl.textContent = "100%";
                if (statusEl) statusEl.textContent = "ACCESS GRANTED";

                screen.classList.add("is-done");

                setTimeout(function () {
                    window.location.href = trigger.getAttribute("href");
                }, 800);
            }

        }, 55);
    }

    trigger.addEventListener("click", function (event) {

        event.preventDefault();
        boot();

        setTimeout(function () {
            if (!screen.classList.contains("is-on")) {
                window.location.href = trigger.getAttribute("href");
            }
        }, 400);
    });

})();
