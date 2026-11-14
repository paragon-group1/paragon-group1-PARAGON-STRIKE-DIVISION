/* ==========================================================
   PARAGON // INTRUSION SEQUENCE ENGINE — v4
========================================================== */

(function () {
    "use strict";

    const screen  = document.getElementById("systemBoot");
    const trigger = document.querySelector(".enter-button");
    if (!screen || !trigger) return;

    const destination = trigger.getAttribute("href");
    if (!destination) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const S = reduce ? 0.35 : 1;

    const logEl    = document.getElementById("hkLog");
    const hexEl    = document.getElementById("hkHex");
    const barEl    = document.getElementById("hkBar");
    const pctEl    = document.getElementById("hkPct");
    const statusEl = document.getElementById("hkStatus");
    const clockEl  = document.getElementById("hkClock");
    const keyEl    = document.getElementById("hkKey");
    const hopEl    = document.getElementById("hkHop");
    const fwEls    = ["hkFw1", "hkFw2", "hkFw3"].map((id) => document.getElementById(id));

    const CHARS = "01ABCDEF#$%&*<>/\\{}[]";
    const HEXC  = "0123456789ABCDEF";

    let started = false;
    let done    = false;
    let cur     = 0;
    let target  = 4;
    let rafId   = null;
    let cursorEl = null;

    const timers = [];
    let hexTimer = null;
    let clockTimer = null;

    const later = (fn, ms) => timers.push(setTimeout(fn, ms * S));
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = (s) => s[(Math.random() * s.length) | 0];
    const pad2 = (n) => String(n).padStart(2, "0");

    /* ---------- salida ---------- */

    function placeCursor() {
        if (!cursorEl) {
            cursorEl = document.createElement("span");
            cursorEl.className = "hk-cursor";
            cursorEl.textContent = "\u2588";
        }
        const last = logEl.lastElementChild;
        if (last) last.appendChild(cursorEl);
        else logEl.appendChild(cursorEl);
    }

    function line(text, cls) {
        const p = document.createElement("p");
        p.textContent = text;
        if (cls) p.className = cls;
        logEl.appendChild(p);

        while (logEl.childElementCount > 40) logEl.firstElementChild.remove();
        placeCursor();
        return p;
    }

    function type(text, cls, speed) {
        const p = line("", cls);
        let i = 0;
        const step = () => {
            i++;
            p.textContent = text.slice(0, i);
            placeCursor();
            if (i < text.length) timers.push(setTimeout(step, (speed || 16) * S));
        };
        step();
    }

    /* ---------- progreso ---------- */

    function setProgress(v) {
        cur = Math.min(100, Math.max(0, v));
        const r = Math.round(cur);
        if (barEl) barEl.style.width = r + "%";
        if (pctEl) pctEl.textContent = pad2(r) + "%";
        if (barEl) barEl.setAttribute("aria-valuenow", String(r));
    }

    function loop() {
        cur += (target - cur) * 0.07 + Math.random() * 0.35;
        if (cur > target) cur = target;
        setProgress(cur);
        if (cur < 100) rafId = requestAnimationFrame(loop);
    }

    /* ---------- paneles ---------- */

    function hexDump() {
        if (!hexEl) return;
        let out = "";
        for (let i = 0; i < 4; i++) out += pick(HEXC) + pick(HEXC) + " ";
        out += " ";
        for (let i = 0; i < 7; i++) out += pick(CHARS);

        const row = document.createElement("div");
        row.textContent = out;
        hexEl.prepend(row);

        while (hexEl.childElementCount > 13) hexEl.lastElementChild.remove();
    }

    function startClock() {
        const t0 = performance.now();
        clockTimer = setInterval(() => {
            const e = performance.now() - t0;
            const m = Math.floor(e / 60000);
            const s = Math.floor(e / 1000) % 60;
            const ms = Math.floor(e % 1000);
            if (clockEl) clockEl.textContent = pad2(m) + ":" + pad2(s) + "." + String(ms).padStart(3, "0");
        }, 47);
    }

    function fillMeter(el) {
        if (!el) return;
        let v = 0;
        const iv = setInterval(() => {
            v += rnd(4, 13);
            if (v >= 100) {
                v = 100;
                clearInterval(iv);
                el.classList.add("is-ok");
            }
            el.style.width = v + "%";
        }, 60 * S);
    }

    function scrambleKey() {
        const final = "0x7F2A9C4E";
        let n = 0;
        const iv = setInterval(() => {
            n++;
            let out = "";
            for (let i = 0; i < final.length; i++) {
                out += i < (n >> 1) ? final[i] : pick(CHARS);
            }
            if (keyEl) keyEl.textContent = out;
            if (n > final.length * 2) {
                clearInterval(iv);
                if (keyEl) keyEl.textContent = final;
            }
        }, 55 * S);
    }

    function glitch(ms) {
        screen.classList.add("is-glitch");
        timers.push(setTimeout(() => screen.classList.remove("is-glitch"), ms * S));
    }

    /* ---------- cierre ---------- */

    function finish() {
        if (done) return;
        done = true;

        timers.forEach(clearTimeout);
        clearInterval(hexTimer);
        clearInterval(clockTimer);
        if (rafId) cancelAnimationFrame(rafId);

        target = 100;
        setProgress(100);
        if (statusEl) statusEl.textContent = "ACCESS GRANTED";
        fwEls.forEach((el) => el && el.classList.add("is-ok"));

        screen.classList.add("is-done");
        screen.setAttribute("aria-busy", "false");

        later(() => { window.location.href = destination; }, 950);
    }

    /* ---------- arranque ---------- */

    function boot() {
        if (started) return;
        started = true;

        screen.removeAttribute("hidden");
        screen.setAttribute("aria-hidden", "false");
        screen.setAttribute("aria-busy", "true");
        screen.classList.add("is-on");
        document.body.style.overflow = "hidden";

        startClock();
        rafId = requestAnimationFrame(loop);
        hexTimer = setInterval(hexDump, 55 * S);

        later(() => type("root@paragon:~# ./breach --target psd-core", "w", 14), 240);

        later(() => { if (statusEl) statusEl.textContent = "RESOLVING HOST"; target = 13; }, 720);
        later(() => type("\u00bb resolving psd-core \u2026", "d"), 780);
        later(() => type("\u00bb route 10.0.0.24 \u2192 172.16.4.9 \u2192 psd-core", "d"), 1120);
        later(() => { if (hopEl) hopEl.textContent = "01"; }, 1180);
        later(() => { if (hopEl) hopEl.textContent = "02"; }, 1340);
        later(() => { if (hopEl) hopEl.textContent = "03"; }, 1500);
        later(() => type("\u00bb latency 12ms \u00b7 3 hops", "d"), 1560);

        later(() => { if (statusEl) statusEl.textContent = "PROBING PORTS"; target = 25; }, 1820);
        later(() => type("\u00bb scanning 22 / 443 / 8443", "d"), 1880);
        later(() => type("\u00bb 22 CLOSED", "r"), 2200);
        later(() => type("\u00bb 443 FILTERED", "r"), 2420);
        later(() => type("\u00bb 8443 OPEN", "g"), 2640);

        later(() => {
            if (statusEl) statusEl.textContent = "BYPASSING FIREWALL";
            target = 44;
            glitch(220);
            fillMeter(fwEls[0]);
            type("\u00bb injecting payload fw-layer-1", "w");
        }, 3000);
        later(() => { fillMeter(fwEls[1]); type("\u00bb fw-layer-2 spoofed", "g"); }, 3480);
        later(() => { fillMeter(fwEls[2]); type("\u00bb fw-layer-3 nulled", "g"); }, 3860);

        later(() => {
            if (statusEl) statusEl.textContent = "CRACKING KEY";
            target = 61;
            type("\u00bb brute force 0x7F2A\u00b7\u00b7\u00b7\u00b7", "d");
            scrambleKey();
        }, 4200);

        later(() => { type("\u00bb KEY ACCEPTED", "g"); target = 72; }, 4820);
        later(() => { if (statusEl) statusEl.textContent = "MOUNTING CORE"; target = 84; }, 5100);
        later(() => type("\u00bb mount /dev/core \u00b7 ok", "d"), 5160);
        later(() => type("\u00bb decrypting volume 4096b", "d"), 5440);
        later(() => {
            glitch(180);
            type("\u00bb privileges escalated \u2192 ROOT", "g");
            target = 94;
        }, 5800);

        later(() => { if (statusEl) statusEl.textContent = "FINALIZING"; target = 99; }, 6200);
        later(finish, 6500);
    }

    /* ---------- eventos ---------- */

    function onKeydown(event) {
        if (!started || done) return;
        if (event.key === "Escape") finish();
    }

    trigger.addEventListener("click", (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        event.preventDefault();
        boot();

        window.setTimeout(() => {
            if (!screen.classList.contains("is-on")) {
                window.location.href = destination;
            }
        }, 400);
    });

    document.addEventListener("keydown", onKeydown);

    window.addEventListener("pagehide", () => {
        timers.forEach(clearTimeout);
        clearInterval(hexTimer);
        clearInterval(clockTimer);
        if (rafId) cancelAnimationFrame(rafId);
    });
})();
