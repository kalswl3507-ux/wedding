(() => {
    const endpoint = window.WEDDING_CONFIG?.guestbookEndpoint;
    const form = document.getElementById('guestbookForm');
    const status = document.getElementById('guestbookStatus');
    const list = document.getElementById('guestbookList');
    const submit = form.querySelector('button');

    async function request(options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch(endpoint, { ...options, signal: controller.signal, cache: 'no-store' });
            if (!response.ok) throw new Error('Request failed');
            return await response.json();
        } finally { clearTimeout(timeout); }
    }

    function render(entries) {
        list.replaceChildren();
        entries.forEach(entry => {
            const item = document.createElement('li');
            const name = document.createElement('strong');
            name.textContent = entry.name;
            const message = document.createElement('p');
            message.textContent = entry.message;
            const date = document.createElement('time');
            date.dateTime = entry.createdAt;
            date.textContent = new Date(entry.createdAt).toLocaleDateString('ko-KR');
            item.append(name, message, date);
            list.append(item);
        });
    }

    async function load() {
        status.textContent = '방명록을 불러오는 중입니다.';
        try {
            const entries = await request();
            if (!Array.isArray(entries)) throw new Error('Invalid response');
            render(entries);
            status.textContent = entries.length ? '' : '첫 축하 메시지를 남겨주세요.';
        } catch { status.textContent = '방명록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.'; }
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!endpoint || submit.disabled) return;
        const name = form.elements.name.value.trim();
        const message = form.elements.message.value.trim();
        if (!name || !message) { status.textContent = '이름과 메시지를 입력해 주세요.'; return; }
        submit.disabled = true;
        status.textContent = '메시지를 남기는 중입니다.';
        try {
            await request({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, message }) });
            form.reset();
            await load();
        } catch { status.textContent = '저장 여부를 확인하지 못했어요. 새로고침해서 확인해 주세요.'; }
        finally { submit.disabled = false; }
    });
    if (endpoint) { submit.disabled = false; load(); }
    else { status.textContent = ''; }
})();
