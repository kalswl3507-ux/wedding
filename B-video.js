(() => {
    const video = document.getElementById('coverVideo');
    const button = document.getElementById('coverPlay');
    let visible = true;
    video.muted = true;
    async function play() {
        if (document.hidden || !visible || video.error) return;
        try {
            await video.play();
            button.hidden = true;
            if (document.hidden || !visible) video.pause();
        } catch (error) {
            if (error.name !== 'AbortError') button.hidden = false;
        }
    }
    button.addEventListener('click', play);
    video.addEventListener('playing', () => { button.hidden = true; });
    video.addEventListener('error', () => { button.hidden = true; video.poster = 'assets/B-main-poster.jpg'; });
    const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) play(); else video.pause();
    });
    observer.observe(video);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) video.pause(); else play();
    });
    window.addEventListener('pagehide', () => video.pause());
    window.addEventListener('pageshow', play);
    play();
})();
