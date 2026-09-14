(() => {
    const config = window.WEDDING_CONFIG;
    const status = document.getElementById('navigationStatus');
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const venue = config.venue;
    const hasCoordinates = Number.isFinite(venue.latitude) && Number.isFinite(venue.longitude);
    const tmap = document.getElementById('tmapLink');
    if (hasCoordinates) {
        tmap.href = `tmap://route?goalname=${encodeURIComponent(venue.name)}&goalx=${venue.longitude}&goaly=${venue.latitude}`;
    }
    tmap.addEventListener('click', event => {
        if (!mobile) {
            event.preventDefault();
            status.textContent = '티맵 길찾기는 휴대폰에서 이용해 주세요.';
        } else {
            status.textContent = '티맵이 열리지 않으면 앱 설치 여부를 확인해 주세요.';
        }
    });

})();
