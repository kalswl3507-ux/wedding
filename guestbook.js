(() => {
    const config = window.WEDDING_CONFIG || {};
    const supabase = Boolean(config.supabaseUrl && config.supabasePublishableKey);
    const endpoint = supabase ? config.supabaseUrl.replace(/\/$/, '') + '/rest/v1/wedding_guestbook' : config.guestbookEndpoint;
    const form = document.getElementById('guestbookForm');
    if (!form) return;
    const status = document.getElementById('guestbookStatus');
    const list = document.getElementById('guestbookList');
    const submit = form.querySelector('button');
    const more = document.createElement('button');
    more.type = 'button';
    more.textContent = '방명록 더 보기';
    more.className = 'guestbook-more';
    more.hidden = true;
    list.after(more);
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = '다시 연결하기';
    retry.className = 'guestbook-more';
    retry.hidden = true;
    status.after(retry);
    const pageSize = 30;
    let offset = 0;
    let loading = false;
    let saving = false;
    let connected = false;
    let lastAttempt = 0;
    let retryAppend = false;
    let uncertainSave = false;
    const draftKey = 'wedding-guestbook-draft-v1';
    function preserveDraft() {
        try {
            sessionStorage.setItem(draftKey, JSON.stringify({
                name: form.elements.name.value,
                message: form.elements.message.value,
                uncertain: uncertainSave
            }));
        } catch { /* Private browsing may disable storage; keep the live fields. */ }
    }
    try {
        const draft = JSON.parse(sessionStorage.getItem(draftKey) || 'null');
        if (draft && typeof draft.name === 'string' && typeof draft.message === 'string') {
            form.elements.name.value = draft.name.slice(0, 20);
            form.elements.message.value = draft.message.slice(0, 500);
            uncertainSave = Boolean(draft.uncertain);
        }
    } catch { /* Invalid or unavailable storage must not block the guestbook. */ }
    form.addEventListener('input', preserveDraft);
    function controls() {
        submit.disabled = !connected || saving || loading;
        more.disabled = saving || loading;
        retry.disabled = saving || loading;
    }

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
            if (!response.ok) {
                const error = new Error('Request failed');
                error.status = response.status;
                throw error;
            }
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
        if (loading || !endpoint) return false;
        loading = true;
        lastAttempt = Date.now();
        retryAppend = append;
        controls();
        status.textContent = '방명록을 불러오는 중입니다.';
        try {
            const nextOffset = append ? offset : 0;
            const query = supabase ? '?select=id,name,message,created_at&order=created_at.desc,id.desc&limit=' + pageSize + '&offset=' + nextOffset : '';
            let entries;
            // Retry reads once; never automatically retry a write, which could duplicate a message.
            for (let attempt = 0; attempt < 2; attempt++) {
                try { entries = await request({}, query); break; }
                catch (error) {
                    if (attempt || (error.status && error.status < 500 && error.status !== 429)) throw error;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            if (!Array.isArray(entries)) throw new Error('Invalid response');
            render(entries, append);
            offset = nextOffset + entries.length;
            more.hidden = !supabase || entries.length < pageSize;
            connected = true;
            retry.hidden = true;
            status.textContent = uncertainSave ? '연결됐어요. 앞서 쓴 글이 목록에 있는지 확인한 뒤 다시 남겨주세요.'
                : list.children.length ? '' : '첫 축하 메시지를 남겨주세요.';
            return true;
        } catch {
            connected = false;
            retry.hidden = false;
            status.textContent = '방명록에 연결하지 못했어요. 작성하신 내용은 그대로 두고 다시 연결해 주세요.';
            return false;
        }
        finally { loading = false; controls(); }
    }
    more.addEventListener('click', () => load(true));
    retry.addEventListener('click', () => load(retryAppend));
    function reconnect() {
        if (!document.hidden && !connected && !saving && Date.now() - lastAttempt > 30000) load(retryAppend);
    }
    window.addEventListener('online', reconnect);
    document.addEventListener('visibilitychange', reconnect);

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!endpoint || submit.disabled) return;
        const name = form.elements.name.value.trim();
        const message = form.elements.message.value.trim();
        if (!name || !message || name.length > 20 || message.length > 500) { status.textContent = '이름은 20자, 메시지는 500자 이내로 입력해 주세요.'; return; }
        saving = true;
        controls();
        preserveDraft();
        status.textContent = '메시지를 남기는 중입니다.';
        try {
            await request({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, message }) });
            uncertainSave = false;
            form.reset();
            try { sessionStorage.removeItem(draftKey); } catch { /* Optional draft storage. */ }
            const loaded = await load();
            status.textContent = loaded ? '따뜻한 마음을 남겨주셔서 감사합니다.' : '메시지가 저장됐어요. 목록은 새로고침하면 확인할 수 있어요.';
        } catch (error) {
            uncertainSave = !error.status || error.status >= 500;
            preserveDraft();
            connected = false;
            retryAppend = false;
            retry.hidden = false;
            status.textContent = uncertainSave
                ? '저장 여부를 확인하지 못했어요. 다시 연결해서 목록을 먼저 확인해 주세요. 작성한 내용은 유지됩니다.'
                : '메시지를 저장하지 못했어요. 작성한 내용은 유지됩니다. 다시 연결해 주세요.';
        }
        finally { saving = false; controls(); }
    });
    controls();
    if (endpoint) load();
    else { status.textContent = '방명록 연결 설정을 확인하고 있습니다.'; }
})();
