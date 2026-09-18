(() => {
    const video = document.getElementById('coverVideo');
    const button = document.getElementById('coverPlay');
    let visible = true;
    let finished = false;
    let replayOnReturn = false;
    video.muted = true;
    async function play() {
        if (finished || video.ended || document.hidden || !visible || video.error) return;
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
    video.addEventListener('ended', () => { finished = true; button.hidden = true; });
    video.addEventListener('error', () => { button.hidden = true; video.poster = 'assets/B-main-poster-hd.jpg'; });
    const observer = new IntersectionObserver(entries => {
        const entry = entries[entries.length - 1];
        // Arm only after leaving the viewport completely, so edge scrolling
        // cannot repeatedly restart the greeting.
        if (!entry.isIntersecting && !document.hidden) replayOnReturn = true;
        visible = entry.isIntersecting && entry.intersectionRatio >= .15;
        if (visible) {
            if (replayOnReturn && !document.hidden) {
                replayOnReturn = false;
                finished = false;
                video.currentTime = 0;
            }
            play();
        } else video.pause();
    }, { threshold: [0, .15] });
    observer.observe(video);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) video.pause(); else play();
    });
    window.addEventListener('pagehide', () => video.pause());
    window.addEventListener('pageshow', play);
    play();
})();
