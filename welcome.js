(() => {
    const root = document.documentElement;
    const screen = document.getElementById('welcomeScreen');
    const enter = document.getElementById('welcomeEnter');
    const skip = document.getElementById('welcomeSkip');
    const status = document.getElementById('welcomeStatus');
    const progress = document.getElementById('welcomeProgress');
    const frame = document.getElementById('weddingGame');
    const behind = [...document.body.children].filter(el => el !== screen && el.tagName !== 'SCRIPT');
    behind.forEach(el => { el.inert = true; });
    screen.hidden = false;
    let ready = false, failed = false, entered = false;
    function update(data) {
        if (entered || !data || data.type !== 'wedding:loading') return;
        const percent = Math.min(100, Math.max(0, Math.round(data.loaded / data.total * 100))) || 0;
        progress.style.width = percent + '%';
        progress.parentElement.setAttribute('aria-valuenow', String(percent));
        if (data.ready) {
            ready = true;
            failed = data.failed > 0;
            enter.disabled = false;
            enter.textContent = failed ? '다시 준비하기' : '초대장 열기 →';
            status.textContent = failed ? '일부 그림을 불러오지 못했어요.' : '준비됐어요. 두 사람의 이야기를 만나보세요.';
            skip.hidden = !failed;
            clearTimeout(slow);
        }
    }
    window.addEventListener('message', event => {
        if (event.source !== frame.contentWindow || (event.origin !== location.origin && event.origin !== 'null')) return;
        update(event.data);
    });
    // Also catch a fast cached iframe that finished before this listener existed.
    const check = setInterval(() => {
        try {
            const art = frame.contentWindow.WeddingArt;
            if (art) art.ready.then(() => {
                const start = frame.contentDocument.getElementById('startButton');
                if (!start.disabled) update({type:'wedding:loading',loaded:1,total:1,ready:true,failed:art.failed.length});
            });
        } catch { /* file:// iframe uses the postMessage path. */ }
        if (ready || entered) clearInterval(check);
    }, 300);
    const slow = setTimeout(() => {
        if (ready || entered) return;
        status.textContent = '조금 더 준비하고 있어요. 잠시만 기다려 주세요.';
        skip.hidden = false;
    }, 20000);
    function open() {
        entered = true;
        clearTimeout(slow);
        clearInterval(check);
        root.classList.remove('invitation-locked');
        screen.hidden = true;
        behind.forEach(el => { el.inert = false; });
        window.scrollTo(0, 0);
        document.dispatchEvent(new Event('invitation:enter'));
        frame.focus({preventScroll:true});
    }
    enter.addEventListener('click', () => {
        if (!ready) return;
        if (failed) location.reload();
        else open();
    });
    skip.addEventListener('click', open);
})();
