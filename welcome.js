(() => {
    const root = document.documentElement;
    const screen = document.getElementById('welcomeScreen');
    const progress = document.getElementById('welcomeProgress');
    const enter = document.getElementById('welcomeEnter');
    const frame = document.getElementById('weddingGame');
    const behind = [...document.body.children].filter(el => el !== screen && el.tagName !== 'SCRIPT');
    behind.forEach(el => { el.inert = true; });
    screen.hidden = false;
    let entered = false;
    function open() {
        if (entered) return;
        entered = true;
        clearTimeout(slow);
        clearInterval(check);
        root.classList.remove('invitation-locked');
        screen.hidden = true;
        behind.forEach(el => { el.inert = false; });
        window.scrollTo(0, 0);
        document.dispatchEvent(new Event('invitation:enter'));
    }
    function update(data) {
        if (entered || !data || data.type !== 'wedding:loading') return;
        const percent = Math.min(100, Math.max(0, Math.round(data.loaded / data.total * 100))) || 0;
        progress.style.width = percent + '%';
        progress.parentElement.setAttribute('aria-valuenow', String(percent));
        if (data.ready) {
            enter.disabled = false;
            enter.textContent = '입장하기';
            clearTimeout(slow);
            clearInterval(check);
        }
    }
    window.addEventListener('message', event => {
        if (event.source !== frame.contentWindow || (event.origin !== location.origin && event.origin !== 'null')) return;
        update(event.data);
    });
    // Catch a cached iframe that finished before the message listener was attached.
    const check = setInterval(() => {
        try {
            const art = frame.contentWindow.WeddingArt;
            const start = frame.contentDocument.getElementById('startButton');
            if (art && start && !start.disabled) update({type:'wedding:loading',loaded:1,total:1,ready:true});
        } catch { /* file:// uses postMessage instead. */ }
    }, 300);
    // A stalled game request must not lock the invitation itself indefinitely.
    const slow = setTimeout(() => {
        enter.disabled = false;
        enter.textContent = '먼저 입장하기';
    }, 20000);
    enter.addEventListener('click', () => { if (!enter.disabled) open(); });
})();
