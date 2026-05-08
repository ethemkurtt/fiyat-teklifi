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

    /* ===== STEPS LOOP ANIMATION =====
       Sequence per step:
       1. Activate item (icon + circle smoothly fade to dark)
       2. Wait for icon animation
       3. Fill the next line gradually (1.4s)
       4. When line filled → activate next item
       5. After last item, pause then reset and loop
    */
    (function () {
        const track = document.querySelector('.ft-steps__track');
        if (!track) return;

        const items = track.querySelectorAll('.ft-steps__item');
        const lines = track.querySelectorAll('.ft-steps__line');
        if (!items.length) return;

        const iconMs = 700;   /* circle + icon fade in */
        const lineMs = 1400;  /* line fill duration (matches CSS) */
        const endPauseMs = 1800;

        let stopped = false;

        function reset() {
            items.forEach(function (item) { item.classList.remove('is-active'); });
            lines.forEach(function (line) {
                line.classList.remove('is-filling');
                line.classList.remove('is-filled');
                /* force reflow so transition restarts */
                void line.offsetWidth;
            });
        }

        function activateItem(i) {
            if (items[i]) items[i].classList.add('is-active');
        }

        function fillLine(i, cb) {
            const line = lines[i];
            if (!line) { cb(); return; }
            line.classList.add('is-filling');
            setTimeout(function () {
                line.classList.add('is-filled');
                cb();
            }, lineMs);
        }

        function runSequence() {
            if (stopped) return;
            reset();

            /* Step 0 instantly active */
            setTimeout(function () {
                activateItem(0);

                let i = 0;
                function nextStep() {
                    if (i >= lines.length) {
                        /* end of sequence - pause then loop */
                        setTimeout(runSequence, endPauseMs);
                        return;
                    }
                    /* fill line, then activate next item after icon delay */
                    fillLine(i, function () {
                        activateItem(i + 1);
                        i++;
                        setTimeout(nextStep, iconMs);
                    });
                }

                setTimeout(nextStep, iconMs);
            }, 100);
        }

        runSequence();
    })();

    /* ===== CLOUDPANO TOUR RELOADER =====
       Forces the shareScript.js to re-execute on each page load
       so the tour reliably initializes (Elementor cache fix).
    */
    document.querySelectorAll('.ft-tour__embed-target').forEach(function (target) {
        const shortId = target.getAttribute('data-short');
        if (!shortId) return;

        target.id = shortId;
        target.innerHTML = '';

        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.setAttribute('data-short', shortId);
        s.setAttribute('data-path', 'tours');
        s.setAttribute('data-is-self-hosted', 'undefined');
        s.setAttribute('width', '100%');
        s.setAttribute('height', '100%');
        s.src = 'https://app.cloudpano.com/public/shareScript.js?_=' + Date.now();
        target.appendChild(s);
    });

});
