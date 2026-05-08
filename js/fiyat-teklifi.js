document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.ft-header');
    if (!header) return;

    let ticking = false;

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 60) {
                    header.classList.add('is-scrolled');
                } else {
                    header.classList.remove('is-scrolled');
                }

                ticking = false;
            });
            ticking = true;
        }
    });
});
