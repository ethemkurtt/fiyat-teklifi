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

    /* ===== GENERIC SLIDER FACTORY ===== */
    function initSlider(trackSel, prevSel, nextSel, cardSel, visibleCards, gap) {
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

    /* ===== RESULTS SLIDER ===== */
    initSlider('.ft-results__track', '.ft-results__prev', '.ft-results__next', '.ft-results__card', 2, 24);

    /* ===== REVIEWS SLIDER ===== */
    initSlider('.ft-reviews__track', '.ft-reviews__prev', '.ft-reviews__next', '.ft-reviews__card', 4, 24);

});
