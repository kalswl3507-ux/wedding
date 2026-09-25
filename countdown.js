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
            const formal = card.dataset.weddingCountdown === 'formal';
            const value = remaining > 0 ? (formal ? `${remaining}일` : `D-${remaining}`)
                : remaining === 0 ? (formal ? '오늘' : 'D-DAY')
                : (formal ? `${-remaining}일` : `D+${-remaining}`);
            const caption = remaining > 0 ? '두 사람의 시작까지'
                : remaining === 0 ? '오늘, 저희 결혼합니다' : '함께 걸어온 날들';
            card.querySelector('[data-countdown-value]').textContent = value;
            card.querySelector('[data-countdown-caption]').textContent = caption;
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
