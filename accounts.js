(() => {
    function fallbackCopy(value, button) {
        const field = document.createElement('textarea');
        field.value = value;
        field.readOnly = true;
        field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;pointer-events:none;';
        document.body.append(field);
        try {
            field.focus({ preventScroll: true });
            field.select();
            field.setSelectionRange(0, value.length);
            return document.execCommand('copy');
        } finally {
            field.remove();
            button.focus({ preventScroll: true });
        }
    }

    document.querySelectorAll('.account-copy').forEach(button => {
        let resetTimer;
        button.addEventListener('click', async () => {
            const row = button.closest('.gift-account');
            const number = row.querySelector('.account-number').textContent.trim();
            const status = row.querySelector('.copy-status');
            let copied = false;
            clearTimeout(resetTimer);
            status.textContent = '';
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(number);
                    copied = true;
                }
            } catch { /* Try browser compatibility fallback below. */ }
            if (!copied) {
                try { copied = fallbackCopy(number, button); } catch { copied = false; }
            }
            status.textContent = copied
                ? '계좌번호를 복사했어요.'
                : '복사하지 못했어요. 계좌번호를 길게 눌러 복사해 주세요.';
            if (copied) resetTimer = setTimeout(() => { status.textContent = ''; }, 2500);
        });
    });
})();
