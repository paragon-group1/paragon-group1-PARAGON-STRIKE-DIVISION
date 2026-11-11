
/* ==========================================
   PARAGON // SYSTEM BOOT ENGINE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const enterButton = document.querySelector(".enter-button");
    const bootScreen = document.getElementById("systemBoot");

    const progressBar = document.getElementById("progressBar");
    const bootPercent = document.getElementById("bootPercent");
    const bootStatus = document.getElementById("bootStatus");

    const coreStatus = document.getElementById("coreStatus");
    const networkStatus = document.getElementById("networkStatus");
    const securityStatus = document.getElementById("securityStatus");

    const bootLog = document.getElementById("bootLog");
    const codeBackground = document.getElementById("bootCodeBackground");

    if (!enterButton || !bootScreen) return;

    let bootStarted = false;

    // GENERAR CÓDIGOS ANIMADOS DE FONDO
    function generateBackgroundCodes() {

        if (!codeBackground) return;

        const characters = "01ABCDEF0123456789<>/{}[]#$%";
        
        for (let i = 0; i < 12; i++) {

            const column = document.createElement("div");
            column.className = "boot-code-column";

            let code = "";

            for (let j = 0; j < 65; j++) {
                code += characters[
                    Math.floor(Math.random() * characters.length)
                ] + " ";
            }

            column.textContent = code;

            column.style.animationDuration =
                (12 + Math.random() * 18) + "s";

            column.style.animationDelay =
                (-Math.random() * 20) + "s";

            codeBackground.appendChild(column);
        }
    }

    // AGREGAR MENSAJES AL REGISTRO DEL SISTEMA
    function addBootLog(message) {

        if (!bootLog) return;

        const line = document.createElement("p");

        const time = new Date().toLocaleTimeString("es-PE", {
            hour12: false
        });

        line.textContent = `[${time}] > ${message}`;

        bootLog.appendChild(line);

        while (bootLog.children.length > 12) {
            bootLog.removeChild(bootLog.firstChild);
        }

        bootLog.scrollTop = bootLog.scrollHeight;
    }

    // ACTUALIZAR ESTADOS
    function updateDiagnostics(percent) {

        if (percent >= 20) {
            coreStatus.textContent = "VERIFIED";
            coreStatus.classList.add("verified");
        }

        if (percent >= 50) {
            networkStatus.textContent = "CONNECTED";
            networkStatus.classList.add("verified");
        }

        if (percent >= 80) {
            securityStatus.textContent = "SECURE";
            securityStatus.classList.add("verified");
        }
    }

    // MENSAJES DE INICIALIZACIÓN
    function getBootMessage(percent) {

        if (percent < 15) return "INITIALIZING CORE SYSTEM...";
        if (percent < 30) return "LOADING SYSTEM COMPONENTS...";
        if (percent < 45) return "VERIFYING CORE INTEGRITY...";
        if (percent < 60) return "ESTABLISHING NETWORK CONNECTION...";
        if (percent < 75) return "SYNCHRONIZING INSTITUTIONAL DATA...";
        if (percent < 90) return "VERIFYING SECURITY PROTOCOLS...";
        if (percent < 100) return "PREPARING COMMAND ACCESS...";

        return "SYSTEM INITIALIZED // ACCESS GRANTED";
    }

    // SECUENCIA PRINCIPAL
    function startSystemBoot() {

        if (bootStarted) return;

        bootStarted = true;

        bootScreen.classList.add("active");
        bootScreen.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        generateBackgroundCodes();

        addBootLog("PARAGON BOOT SEQUENCE STARTED");
        addBootLog("CORE INITIALIZATION REQUESTED");

        let progress = 1;
        let previousStage = "";

        const loading = setInterval(() => {

            progress++;

            progressBar.style.width = progress + "%";
            bootPercent.textContent = progress + "%";

            bootStatus.textContent = getBootMessage(progress);

            updateDiagnostics(progress);

            const currentStage = getBootMessage(progress);

            if (currentStage !== previousStage) {
                addBootLog(currentStage);
                previousStage = currentStage;
            }

            // FINALIZACIÓN
            if (progress >= 100) {

                clearInterval(loading);

                addBootLog("ALL SYSTEM CHECKS COMPLETED");
                addBootLog("COMMAND ACCESS AUTHORIZED");

                bootStatus.textContent =
                    "SYSTEM INITIALIZED // ACCESS GRANTED";

                setTimeout(() => {
                    window.location.href = enterButton.href;
                }, 1000);
            }

        }, 65);
    }

    // INICIAR SOLAMENTE AL PRESIONAR ENTER NETWORK
    enterButton.addEventListener("click", (event) => {

        event.preventDefault();

        startSystemBoot();

    });

});

