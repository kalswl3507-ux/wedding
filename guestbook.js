(() => {
    const config = window.WEDDING_CONFIG || {};
    const supabase = Boolean(config.supabaseUrl && config.supabasePublishableKey);
    const endpoint = supabase ? config.supabaseUrl.replace(/\/$/, '') + '/rest/v1/wedding_guestbook' : config.guestbookEndpoint;
    const form = document.getElementById('guestbookForm');
    const status = document.getElementById('guestbookStatus');
    const list = document.getElementById('guestbookList');
    const submit = form.querySelector('button');
    const more = document.createElement('button');
    more.type = 'button';
    more.textContent = '방명록 더 보기';
    more.className = 'guestbook-more';
    more.hidden = true;
    list.after(more);
    const pageSize = 30;
    let offset = 0;

    async function request(options = {}, query = '') {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
            const headers = { ...options.headers };
            if (supabase) {
                headers.apikey = config.supabasePublishableKey;
                if (config.supabasePublishableKey.startsWith('eyJ')) headers.Authorization = 'Bearer ' + config.supabasePublishableKey;
                if (options.method === 'POST') headers.Prefer = 'return=minimal';
            }
            const response = await fetch(endpoint + query, { ...options, headers, signal: controller.signal, cache: 'no-store' });
            if (!response.ok) throw new Error('Request failed');
            const body = await response.text();
            return body ? JSON.parse(body) : null;
        } finally { clearTimeout(timeout); }
    }

    function render(entries, append) {
        if (!append) list.replaceChildren();
        entries.forEach(entry => {
            const item = document.createElement('li');
            const name = document.createElement('strong');
            name.textContent = entry.name;
            const message = document.createElement('p');
            message.textContent = entry.message;
            const date = document.createElement('time');
            date.dateTime = entry.created_at || entry.createdAt;
            date.textContent = new Date(date.dateTime).toLocaleDateString('ko-KR');
            item.append(name, message, date);
            list.append(item);
        });
    }

    async function load(append = false) {
        more.disabled = true;
        status.textContent = '방명록을 불러오는 중입니다.';
        try {
            const nextOffset = append ? offset : 0;
            const entries = await request({}, supabase ? '?select=id,name,message,created_at&order=created_at.desc,id.desc&limit=' + pageSize + '&offset=' + nextOffset : '');
            if (!Array.isArray(entries)) throw new Error('Invalid response');
            render(entries, append);
            offset = nextOffset + entries.length;
            more.hidden = !supabase || entries.length < pageSize;
            status.textContent = list.children.length ? '' : '첫 축하 메시지를 남겨주세요.';
            return true;
        } catch { status.textContent = '방명록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.'; return false; }
        finally { more.disabled = false; }
    }
    more.addEventListener('click', () => load(true));

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!endpoint || submit.disabled) return;
        const name = form.elements.name.value.trim();
        const message = form.elements.message.value.trim();
        if (!name || !message || name.length > 20 || message.length > 500) { status.textContent = '이름은 20자, 메시지는 500자 이내로 입력해 주세요.'; return; }
        submit.disabled = true;
        status.textContent = '메시지를 남기는 중입니다.';
        try {
            await request({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, message }) });
            form.reset();
            const loaded = await load();
            status.textContent = loaded ? '따뜻한 마음을 남겨주셔서 감사합니다.' : '메시지가 저장됐어요. 목록은 새로고침하면 확인할 수 있어요.';
        } catch { status.textContent = '저장 여부를 확인하지 못했어요. 새로고침해서 확인해 주세요.'; }
        finally { submit.disabled = false; }
    });
    if (endpoint) { submit.disabled = false; load(); }
    else { status.textContent = ''; }
})();
