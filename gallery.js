(() => {
const photos = Array.from({ length: 30 }, (_, i) => [i + 1]);
        photos.splice(25, 2, [26, 27]);
        const source = (number, variant = "slide") => `gallery/web/${variant}/${number}.jpg`;
        const layers = [...document.querySelectorAll('.slide-photo')];
        const thumbs = document.getElementById('thumbnails');
        const dialog = document.getElementById('photoDialog');
        const popupPhoto = document.getElementById('popupPhoto');
        let current = 0;
        let visibleLayer = 0;
        let popupIndex = 0;
        let timer;
        let started = false;
        let generation = 0;
        let returnFocus;
        let savedOverflow;
        const photoHistoryId = 'wedding-photo-' + Date.now();
        const loaded = new Map();
        const landscape = new Set();
        const count = index => `${photos[index].map(number => String(number).padStart(2, '0')).join('·')} / 30`;

        const renders = new WeakMap();
        function decodedImage(number, variant, lazy = false) {
            const img = new Image();
            img.alt = `웨딩 사진 ${number}`;
            img.decoding = 'async';
            if (lazy) img.loading = 'lazy';
            const ready = new Promise(resolve => {
                img.onload = async () => {
                    try { if (img.decode) await img.decode(); resolve(img); }
                    catch { resolve(null); }
                };
                img.onerror = () => resolve(null);
            });
            img.src = source(number, variant);
            return { img, ready };
        }
        async function renderPhoto(container, index, lazy = false) {
            const token = {};
            renders.set(container, token);
            const pictures = photos[index].map(number => decodedImage(number, lazy ? 'thumb' : 'slide', lazy));
            function commit(images) {
                container.classList.toggle('paired', images.length === 2);
                const wide = images.length === 1 && images[0].naturalWidth > images[0].naturalHeight;
                container.classList.toggle('landscape', wide);
                if (wide) landscape.add(index);
                container.replaceChildren(...images);
            }
            if (lazy) { commit(pictures.map(picture => picture.img)); return true; }
            // Decode the actual DOM images, not just a separate preload request.
            const images = await Promise.all(pictures.map(picture => picture.ready));
            if (renders.get(container) !== token || images.some(img => !img)) return false;
            commit(images);
            if (container === popupPhoto) {
                const large = await Promise.all(photos[index].map(number => decodedImage(number, 'large').ready));
                if (renders.get(container) === token && large.every(Boolean)) commit(large);
            }
            return true;
        }
        function preload(index) {
            if (!loaded.has(index)) {
                loaded.set(index, Promise.all(photos[index].map(number => new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => {
                        if (photos[index].length === 1 && img.naturalWidth > img.naturalHeight) landscape.add(index);
                        resolve(true);
                    };
                    img.onerror = () => resolve(false);
                    img.src = source(number);
                }))).then(results => {
                    const ready = results.every(Boolean);
                    if (!ready) loaded.delete(index);
                    return ready;
                }));
            }
            return loaded.get(index);
        }

        function createThumbnails() { photos.forEach((numbers, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'thumb-btn' + (index === 0 ? ' active' : '');
            button.setAttribute('aria-label', `웨딩 사진 ${numbers.join('·')} 크게 보기`);
            renderPhoto(button, index, true);
            button.addEventListener('click', () => openPopup(index, button));
            thumbs.append(button);
        }); }
        function stopSlideshow() {
            clearTimeout(timer);
            generation++;
        }

        function scheduleSlide() {
            stopSlideshow();
            if (!started || dialog.open || document.hidden || document.documentElement.classList.contains('invitation-locked')) return;
            preload((current + 1) % photos.length);
            timer = setTimeout(advanceSlide, 3000);
        }

        async function advanceSlide() {
            const token = generation;
            const next = (current + 1) % photos.length;
            const ready = await preload(next);
            if (token !== generation) return;
            if (ready) {
                const nextLayer = 1 - visibleLayer;
                const incoming = layers[nextLayer];
                const outgoing = layers[visibleLayer];
                const painted = await renderPhoto(incoming, next);
                if (token !== generation) return;
                if (!painted) { scheduleSlide(); return; }
                incoming.style.zIndex = '2';
                outgoing.style.zIndex = '1';
                // Keep the previous photo fully opaque under the new photo.
                // Establish the hidden frame before starting the opacity transition.
                void incoming.offsetWidth;
                layers[nextLayer].removeAttribute('aria-hidden');
                layers[nextLayer].classList.add('visible');
                setTimeout(() => {
                    outgoing.style.transition = 'none';
                    outgoing.classList.remove('visible');
                    void outgoing.offsetWidth;
                    outgoing.style.removeProperty('transition');
                }, 1100);
                layers[visibleLayer].setAttribute('aria-hidden', 'true');
                visibleLayer = nextLayer;
                current = next;
                document.getElementById('slideCount').textContent = count(current);
                [...thumbs.children].forEach((button, index) => button.classList.toggle('active', index === current));
            }
            scheduleSlide();
        }

        function showPopupPhoto(index) {
            popupIndex = (index + photos.length) % photos.length;
            if (dialog.open && history.state?.weddingPhoto === photoHistoryId) {
                history.replaceState({ ...history.state, photoIndex: popupIndex }, '');
            }
            renderPhoto(popupPhoto, popupIndex);
            document.getElementById('popupCount').textContent = count(popupIndex);
            preload((popupIndex + 1) % photos.length);
        }

        function openPopup(index, button, addHistory = true) {
            returnFocus = button;
            stopSlideshow();
            showPopupPhoto(index);
            savedOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            dialog.showModal();
            if (addHistory) {
                history.pushState({ ...history.state, weddingPhoto: photoHistoryId, photoIndex: popupIndex }, '');
            }
        }

        window.addEventListener('popstate', event => {
            if (event.state?.weddingPhoto === photoHistoryId) {
                if (!dialog.open) openPopup(event.state.photoIndex, returnFocus, false);
            } else if (dialog.open) {
                dialog.close();
            }
        });
        document.getElementById('closePopup').addEventListener('click', () => dialog.close());
        document.getElementById('prevPhoto').addEventListener('click', () => showPopupPhoto(popupIndex - 1));
        document.getElementById('nextPhoto').addEventListener('click', () => showPopupPhoto(popupIndex + 1));
        dialog.addEventListener('close', () => {
            renders.delete(popupPhoto);
            if (history.state?.weddingPhoto === photoHistoryId) history.back();
            document.body.style.overflow = savedOverflow;
            returnFocus?.focus({ preventScroll: true });
            scheduleSlide();
        });
        dialog.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                showPopupPhoto(popupIndex + (event.key === 'ArrowLeft' ? -1 : 1));
            }
        });
        let touchStart;
        popupPhoto.addEventListener('touchstart', event => {
            touchStart = event.touches.length === 1
                ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
        }, { passive: true });
        popupPhoto.addEventListener('touchend', event => {
            if (!touchStart) return;
            const dx = event.changedTouches[0].clientX - touchStart.x;
            const dy = event.changedTouches[0].clientY - touchStart.y;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                showPopupPhoto(popupIndex + (dx < 0 ? 1 : -1));
            }
            touchStart = null;
        }, { passive: true });
        document.addEventListener('visibilitychange', scheduleSlide);
        function startGallery() {
            if (started) return;
            started = true;
            // First photo takes priority over the small thumbnail requests.
            preload(0).then(async () => {
                await renderPhoto(layers[0], 0);
                scheduleSlide();
            });
            createThumbnails();
        }
        function observeGallery() {
            if (!('IntersectionObserver' in window)) { startGallery(); return; }
            const observer = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting)) {
                    observer.disconnect();
                    startGallery();
                }
            }, { rootMargin: '700px' });
            observer.observe(document.querySelector('.gallery-container'));
        }
        if (document.documentElement.classList.contains('invitation-locked')) document.addEventListener('invitation:enter', observeGallery, { once: true });
        else observeGallery();
})();
