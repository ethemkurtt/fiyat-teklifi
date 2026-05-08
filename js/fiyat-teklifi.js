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
            const totalWidth = track.scrollWidth;
            const step = getStep();
            const visible = Math.floor(wrapWidth / step) || 1;
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

        /* --- Drag (mouse + touch) --- */
        function dragStart(e) {
            isDragging = true;
            startX = e.type.indexOf('touch') === 0 ? e.touches[0].clientX : e.clientX;
            const m = track.style.transform.match(/-?\d+(\.\d+)?/);
            baseTransform = m ? parseFloat(m[0]) : 0;
            track.style.transition = 'none';
            track.style.cursor = 'grabbing';
            stopAuto();
        }

        function dragMove(e) {
            if (!isDragging) return;
            const x = e.type.indexOf('touch') === 0 ? e.touches[0].clientX : e.clientX;
            dragOffset = x - startX;
            track.style.transform = 'translateX(' + (baseTransform + dragOffset) + 'px)';
        }

        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;
            track.style.cursor = 'grab';
            track.style.transition = '';

            const step = getStep();
            const max = getMaxIndex();
            const threshold = step * 0.2;

            if (dragOffset < -threshold && current < max) {
                current++;
            } else if (dragOffset > threshold && current > 0) {
                current--;
            }
            dragOffset = 0;
            update();
            startAuto();
        }

        track.style.cursor = 'grab';
        track.addEventListener('mousedown', dragStart);
        track.addEventListener('touchstart', dragStart, { passive: true });
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('touchmove', dragMove, { passive: true });
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);

        /* prevent image drag ghost */
        track.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('dragstart', function (ev) { ev.preventDefault(); });
        });

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

});
