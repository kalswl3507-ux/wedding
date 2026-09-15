// Daystar — Daisy Fleabane. Used with permission; see assets/audio/README.md.
(() => {
    'use strict';
    const button = document.getElementById('musicToggle');
    const label = document.getElementById('musicLabel');
    const track = new Audio();
    // Fetch during the welcome screen, without playing before the user's tap.
    track.preload = 'auto';
    const startAt = 0;
    track.src = 'assets/audio/daystar-daisy-fleabane-trimmed.mp3';
    track.loop = false;
    track.volume = .35;
    let enabled = false;
    let request = 0;
    track.addEventListener('loadedmetadata', () => {
        if (track.currentTime < startAt && track.duration > startAt) track.currentTime = startAt;
    });
    track.addEventListener('ended', () => {
        if (track.duration <= startAt) return;
        track.currentTime = startAt;
        if (enabled && !document.hidden) play();
    });
    function paint() {
        button.setAttribute('aria-pressed', String(enabled));
        button.setAttribute('aria-label', enabled ? '배경음악 끄기' : '배경음악 켜기');
        label.textContent = enabled ? '음악 켜짐' : '음악 꺼짐';
    }
    function pause() { request++; track.pause(); }
    async function play() {
        const current = ++request;
        if (track.readyState < 3) label.textContent = '음악 준비 중';
        try {
            if (track.readyState > 0 && track.currentTime < startAt && track.duration > startAt) track.currentTime = startAt;
            await track.play();
            if (!enabled || document.hidden) track.pause();
            else paint();
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
    track.load();
})();
