/* ==========================================
   PARAGON // SYSTEM BOOT ENGINE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const enterButton = document.querySelector(".enter-button");
    const bootScreen = document.getElementById("systemBoot");

    const progressBar = document.getElementById("progressBar");
    const bootPercent = document.getElementById("bootPercent");
    const bootStatus = document.getElementById("bootStatus");
    const bootLog = document.getElementById("bootLog");

    if (!enterButton || !bootScreen) return;

    let bootStarted = false;

    const LOG_SEQUENCE = [
        { at: 0,  text: "ONLINE_",                 green: true },
        { at: 4,  text: "01 // INITIALIZING" },
        { at: 10, text: "10.0.0.24",               dim: true },
        { at: 16, text: "SYSTEM CHECK..." },
        { at: 28, text: "SECURITY VERIFIED",       green: true },
        { at: 42, text: "NETWORK CONNECTED",       green: true },
        { at: 56, text: "AUTH HANDSHAKE // 0x7F2A" },
        { at: 70, text: "LOADING COMMAND MODULES", dim: true },
        { at: 84, text: "ENCRYPTION LAYER READY" },
        { at: 95, text: "ACCESS GRANTED",          green: true }
    ];

    function statusFor(percent) {
        if (percent < 12) return "INITIALIZING SYSTEM";
        if (percent < 26) return "RUNNING SYSTEM CHECK";
        if (percent < 40) return "VERIFYING SECURITY";
        if (percent < 55) return "CONNECTING NETWORK";
        if (percent < 70) return "SYNCHRONIZING DATA";
        if (percent < 86) return "LOADING MODULES";
        if (percent < 100) return "FINALIZING";
        return "ACCESS GRANTED";
    }

    function pad(value) {
        return value < 10 ? "0" + value : String(value);
    }

    function addLog(entry) {

        if (!bootLog) return;

        const line = document.createElement("p");
        line.textContent = entry.text;

        if (entry.green) line.classList.add("is-green");
        if (entry.dim) line.classList.add("is-dim");

        bootLog.appendChild(line);
    }

    function startSystemBoot() {

        if (bootStarted) return;

        bootStarted = true;

        bootScreen.removeAttribute("hidden");
        bootScreen.setAttribute("aria-hidden", "false");
        bootScreen.classList.add("active");

        document.body.style.overflow = "hidden";

        addLog({ text: "ONLINE_", green: true });
        addLog({ text: "01 // INITIALIZING" });

        let progress = 1;
        let logIndex = 2;
        let previousStatus = "";

        const tick = setInterval(() => {

            progress += Math.random() * 2.2 + 0.7;
            if (progress > 100) progress = 100;

            const value = Math.floor(progress);

            progressBar.style.width = value + "%";
            bootPercent.textContent = pad(value) + "%";

            const status = statusFor(value);

            if (status !== previousStatus) {
                bootStatus.textContent = status;
                previousStatus = status;
            }

            while (
                logIndex < LOG_SEQUENCE.length &&
                LOG_SEQUENCE[logIndex].at <= value
            ) {
                addLog(LOG_SEQUENCE[logIndex]);
                logIndex++;
            }

            if (value >= 100) {

                clearInterval(tick);

                progressBar.style.width = "100%";
                bootPercent.textContent = "100%";
                bootStatus.textContent = "ACCESS GRANTED";

                bootScreen.classList.add("is-complete");

                setTimeout(() => {
                    window.location.href = enterButton.href;
                }, 850);
            }

        }, 60);
    }

    // INICIAR SOLAMENTE AL PRESIONAR ENTER NETWORK
    enterButton.addEventListener("click", (event) => {

        event.preventDefault();

        startSystemBoot();

        // RED DE SEGURIDAD
        setTimeout(() => {
            if (!bootScreen.classList.contains("active")) {
                window.location.href = enterButton.href;
            }
        }, 400);
    });

});
