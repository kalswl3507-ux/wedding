// Daystar — Daisy Fleabane. Used with permission; see assets/audio/README.md.
(() => {
    'use strict';
    const button = document.getElementById('musicToggle');
    const label = document.getElementById('musicLabel');
    const track = new Audio();
    track.preload = 'none';
    track.src = 'assets/audio/daystar-daisy-fleabane.mp3';
    track.loop = true;
    track.volume = .35;
    let enabled = false;
    let request = 0;
    function paint() {
        button.setAttribute('aria-pressed', String(enabled));
        button.setAttribute('aria-label', enabled ? '배경음악 끄기' : '배경음악 켜기');
        label.textContent = enabled ? '음악 켜짐' : '음악 꺼짐';
    }
    function pause() { request++; track.pause(); }
    async function play() {
        const current = ++request;
        try {
            await track.play();
            if (!enabled || document.hidden) track.pause();
        } catch (error) {
            if (current !== request || error.name === 'AbortError') return;
            enabled = false;
            paint();
            label.textContent = '음악 다시 켜기';
        }
    }
    button.addEventListener('click', () => {
        enabled = !enabled;
        paint();
        if (enabled) play(); else pause();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) pause(); else if (enabled) play();
    });
    window.addEventListener('pagehide', pause);
    window.addEventListener('pageshow', () => {
        if (enabled && !document.hidden) play();
    });
})();
