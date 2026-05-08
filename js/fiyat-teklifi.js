document.addEventListener('DOMContentLoaded', function () {

    /* ===== HERO VIDEO MOBILE SWAP =====
       Use a different video source on mobile devices.
    */
    (function () {
        const mobileSrc = 'https://lp.elithair.com.tr/wp-content/uploads/2026/05/video-2mp4.mp4';
        const video = document.querySelector('.ft-hero__video');
        if (!video) return;

        const desktopSrc = video.querySelector('source')
            ? video.querySelector('source').src
            : video.src;

        let currentMode = null;

        function apply() {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            const targetMode = isMobile ? 'mobile' : 'desktop';
            if (targetMode === currentMode) return;
            currentMode = targetMode;

            const newSrc = isMobile ? mobileSrc : desktopSrc;
            const sourceEl = video.querySelector('source');
            if (sourceEl) {
                sourceEl.src = newSrc;
            } else {
                video.src = newSrc;
            }
            video.load();
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () { /* ignore autoplay block */ });
            }
        }

        apply();
        window.addEventListener('resize', apply);
    })();

    /* ===== HEADER REVIEWS ROTATOR (mobile only) =====
       Slides reviews vertically (one at a time), every 3s.
       Activates only on small viewports.
    */
    (function () {
        const wrap = document.querySelector('.ft-header__reviews');
        if (!wrap) return;
        const items = wrap.querySelectorAll('.ft-header__review');
        if (items.length < 2) return;

        let active = -1;
        let timer = null;

        function show(idx) {
            items.forEach(function (it, i) {
                it.classList.remove('is-active');
                it.classList.remove('is-leaving');
            });
            if (active >= 0 && active !== idx) {
                items[active].classList.add('is-leaving');
            }
            items[idx].classList.add('is-active');
            active = idx;
        }

        function rotate() {
            const next = (active + 1) % items.length;
            show(next);
        }

        function start() {
            if (timer) return;
            show(0);
            timer = setInterval(rotate, 3000);
        }

        function stop() {
            if (timer) { clearInterval(timer); timer = null; }
            items.forEach(function (it) {
                it.classList.remove('is-active');
                it.classList.remove('is-leaving');
            });
            active = -1;
        }

        function check() {
            if (window.matchMedia('(max-width: 768px)').matches) {
                start();
            } else {
                stop();
            }
        }

        check();
        window.addEventListener('resize', check);
    })();

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

    /* ===== FAQ ACCORDION =====
       button-based accordion (max-height transition + first item open by default)
    */
    (function () {
        var items = document.querySelectorAll('.ek-faq__item');
        if (!items.length) return;

        items.forEach(function (item) {
            var question = item.querySelector('.ek-faq__question');
            var answer = item.querySelector('.ek-faq__answer');
            if (!question || !answer) return;

            question.addEventListener('click', function () {
                var isOpen = item.classList.contains('active');

                items.forEach(function (i) {
                    i.classList.remove('active');
                    var a = i.querySelector('.ek-faq__answer');
                    if (a) a.style.maxHeight = '0';
                });

                if (!isOpen) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        });

        var first = items[0];
        if (first) {
            first.classList.add('active');
            var firstAnswer = first.querySelector('.ek-faq__answer');
            if (firstAnswer) {
                firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
            }
        }
    })();

    /* ===== STEPS LOOP ANIMATION =====
       Forward: each line fills (0.9s), then next item activates (0.45s fade)
       Reverse: each line empties one by one (0.25s) and item deactivates
    */
    (function () {
        const track = document.querySelector('.ft-steps__track');
        if (!track) return;

        const items = track.querySelectorAll('.ft-steps__item');
        const lines = track.querySelectorAll('.ft-steps__line');
        if (!items.length) return;

        const iconMs = 450;       /* fade between icons */
        const lineMs = 900;       /* fill duration (matches CSS) */
        const resetStepMs = 280;  /* reverse step delay (matches CSS empty 0.25s) */
        const endPauseMs = 1200;
        const startPauseMs = 400;

        function clearAll() {
            items.forEach(function (item) { item.classList.remove('is-active'); });
            lines.forEach(function (line) {
                line.classList.remove('is-filling');
                line.classList.remove('is-filled');
                line.classList.remove('is-emptying');
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

        /* runForward: 0 -> last */
        function runForward(done) {
            activateItem(0);
            let i = 0;
            function step() {
                if (i >= lines.length) { done(); return; }
                fillLine(i, function () {
                    activateItem(i + 1);
                    i++;
                    setTimeout(step, iconMs);
                });
            }
            setTimeout(step, iconMs);
        }

        /* runReverse: empty lines + deactivate items one by one (right to left) */
        function runReverse(done) {
            let i = items.length - 1;
            function step() {
                if (i < 0) { done(); return; }
                if (items[i]) items[i].classList.remove('is-active');
                if (i > 0 && lines[i - 1]) {
                    lines[i - 1].classList.remove('is-filled');
                    lines[i - 1].classList.remove('is-filling');
                    lines[i - 1].classList.add('is-emptying');
                }
                i--;
                setTimeout(step, resetStepMs);
            }
            step();
        }

        function loop() {
            clearAll();
            setTimeout(function () {
                runForward(function () {
                    setTimeout(function () {
                        runReverse(function () {
                            setTimeout(loop, 200);
                        });
                    }, endPauseMs);
                });
            }, startPauseMs);
        }

        loop();
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
