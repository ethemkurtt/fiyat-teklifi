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

    /* ===== RESULTS SLIDER ===== */
    const track = document.querySelector('.ft-results__track');
    const prevBtn = document.querySelector('.ft-results__prev');
    const nextBtn = document.querySelector('.ft-results__next');

    if (track && prevBtn && nextBtn) {
        const cards = track.querySelectorAll('.ft-results__card');
        let current = 0;
        const visibleCards = 2;
        const maxIndex = Math.max(0, cards.length - visibleCards);

        function updateSlider() {
            const card = cards[0];
            const gap = 24;
            const cardWidth = card.offsetWidth + gap;
            track.style.transform = 'translateX(-' + (current * cardWidth) + 'px)';
        }

        nextBtn.addEventListener('click', function () {
            if (current < maxIndex) {
                current++;
                updateSlider();
            }
        });

        prevBtn.addEventListener('click', function () {
            if (current > 0) {
                current--;
                updateSlider();
            }
        });

        window.addEventListener('resize', updateSlider);
    }

});
