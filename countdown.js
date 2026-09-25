(() => {
    const cards = document.querySelectorAll('[data-wedding-countdown]');
    if (!cards.length) return;
    const day = 86400000;
    const koreaOffset = 9 * 3600000;
    // Calendar days in Korea, independent of the visitor's local time zone.
    const weddingDay = Date.UTC(2027, 0, 10) / day;
    let timer;
    function update() {
        clearTimeout(timer);
        const now = Date.now();
        const remaining = weddingDay - Math.floor((now + koreaOffset) / day);
        cards.forEach(card => {
            card.querySelector('[data-countdown-value]').textContent = Math.abs(remaining);
            card.querySelector('[data-countdown-sign]').textContent = remaining < 0 ? '+' : '-';
            card.setAttribute('aria-label', remaining > 0 ? `결혼식까지 ${remaining}일`
                : remaining === 0 ? '오늘 결혼합니다' : `결혼한 지 ${-remaining}일`);
            card.hidden = false;
        });
        timer = setTimeout(update, day - ((now + koreaOffset) % day) + 100);
    }
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearTimeout(timer); else update();
    });
    window.addEventListener('pageshow', update);
    update();
})();
