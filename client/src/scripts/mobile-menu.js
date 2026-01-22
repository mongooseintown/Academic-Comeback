
// Define global toggle function immediately
window.toggleMobileMenu = function (e) {
    if (e) {
        e.stopPropagation();
    }

    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links'); // Safer selection
    // or document.getElementById('nav-links') if you are sure about ID

    if (menuToggle && navLinks) {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');

        // Overflow control
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

// Attach other listeners for closing logic
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.getElementById('mobile-menu-toggle');

    if (navLinks) {
        // Close when clicking a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                (!menuToggle || !menuToggle.contains(e.target))) {

                navLinks.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

