document.addEventListener('DOMContentLoaded', function () {

    /* ===== HEADER SCROLL ===== */
    const header = document.querySelector('.ft-header');
    if (header) {
        let ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    if (window.pageYOffset > 60) {
                        header.classList.add('is-scrolled');
                    } else {
                        header.classList.remove('is-scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    /* ===== ARROW SLIDER (results) ===== */
    function initArrowSlider(trackSel, prevSel, nextSel, cardSel, visibleCards, gap) {
        const track = document.querySelector(trackSel);
        const prevBtn = document.querySelector(prevSel);
        const nextBtn = document.querySelector(nextSel);
        if (!track || !prevBtn || !nextBtn) return;

        const cards = track.querySelectorAll(cardSel);
        let current = 0;
        const maxIndex = Math.max(0, cards.length - visibleCards);

        function update() {
            const card = cards[0];
            if (!card) return;
            const cardWidth = card.offsetWidth + gap;
            track.style.transform = 'translateX(-' + (current * cardWidth) + 'px)';
        }

        nextBtn.addEventListener('click', function () {
            if (current < maxIndex) { current++; update(); }
        });

        prevBtn.addEventListener('click', function () {
            if (current > 0) { current--; update(); }
        });

        window.addEventListener('resize', update);
    }

    initArrowSlider('.ft-results__track', '.ft-results__prev', '.ft-results__next', '.ft-results__card', 2, 24);

    /* ===== DRAG + AUTO SLIDER (reviews) ===== */
    function initDragSlider(trackSel, cardSel, autoMs) {
        const track = document.querySelector(trackSel);
        if (!track) return;
        const cards = track.querySelectorAll(cardSel);
        if (!cards.length) return;

        let current = 0;
        let autoTimer = null;
        let isDown = false;
        let isDragging = false;
        let startX = 0;
        let dragOffset = 0;
        let baseTransform = 0;

        function getStep() {
            return cards[0].offsetWidth;
        }

        function getMaxIndex() {
            const wrap = track.parentElement;
            if (!wrap) return 0;
            const wrapWidth = wrap.offsetWidth;
            const step = getStep();
            const visible = Math.max(1, Math.floor(wrapWidth / step));
            return Math.max(0, cards.length - visible);
        }

        function update(animate) {
            const step = getStep();
            track.style.transition = animate === false ? 'none' : '';
            track.style.transform = 'translateX(-' + (current * step) + 'px)';
        }

        function next() {
            const max = getMaxIndex();
            current = current >= max ? 0 : current + 1;
            update();
        }

        function startAuto() {
            stopAuto();
            autoTimer = setInterval(next, autoMs);
        }

        function stopAuto() {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        }

        function getX(e) {
            return e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX;
        }

        /* --- Drag --- */
        function dragStart(e) {
            isDown = true;
            isDragging = false;
            startX = getX(e);
            const m = track.style.transform.match(/-?\d+(\.\d+)?/);
            baseTransform = m ? parseFloat(m[0]) : 0;
            stopAuto();
        }

        function dragMove(e) {
            if (!isDown) return;
            const x = getX(e);
            dragOffset = x - startX;

            if (Math.abs(dragOffset) > 5) {
                isDragging = true;
                track.classList.add('is-dragging');
                track.style.transition = 'none';
                track.style.transform = 'translateX(' + (baseTransform + dragOffset) + 'px)';
                if (e.cancelable && e.type.indexOf('touch') !== 0) e.preventDefault();
            }
        }

        function dragEnd() {
            if (!isDown) return;
            isDown = false;
            track.classList.remove('is-dragging');
            track.style.transition = '';

            if (isDragging) {
                const step = getStep();
                const max = getMaxIndex();
                const threshold = step * 0.15;

                if (dragOffset < -threshold && current < max) {
                    current++;
                } else if (dragOffset > threshold && current > 0) {
                    current--;
                }
            }
            dragOffset = 0;
            isDragging = false;
            update();
            startAuto();
        }

        track.addEventListener('mousedown', function (e) {
            e.preventDefault();
            dragStart(e);
        });
        track.addEventListener('touchstart', dragStart, { passive: true });

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove, { passive: false });

        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('mouseleave', dragEnd);
        document.addEventListener('touchend', dragEnd);
        document.addEventListener('touchcancel', dragEnd);

        /* prevent native image/text drag */
        track.addEventListener('dragstart', function (ev) { ev.preventDefault(); });

        /* pause on hover */
        const wrap = track.parentElement;
        if (wrap) {
            wrap.addEventListener('mouseenter', stopAuto);
            wrap.addEventListener('mouseleave', startAuto);
        }

        window.addEventListener('resize', function () { update(false); });

        startAuto();
    }

    initDragSlider('.ft-reviews__track', '.ft-reviews__card', 5000);

    /* ===== TOUR LAZY LOAD ===== */
    document.querySelectorAll('.ft-tour__embed').forEach(function (embed) {
        const cover = embed.querySelector('.ft-tour__cover');
        const tourUrl = embed.getAttribute('data-tour-url');
        if (!cover || !tourUrl) return;

        embed.addEventListener('click', function () {
            if (cover.classList.contains('is-hidden')) return;

            const iframe = document.createElement('iframe');
            iframe.src = tourUrl;
            iframe.setAttribute('width', '100%');
            iframe.setAttribute('height', '100%');
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('allow', 'vr; gyroscope; accelerometer; fullscreen');
            embed.appendChild(iframe);

            cover.classList.add('is-hidden');
            embed.style.cursor = 'default';
        });
    });

});
