// ==================== NAVBAR SCROLL EFFECT ====================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ==================== SMOOTH SCROLLING ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== ACTIVE NAV LINK ====================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
    const scrollPosition = window.pageYOffset + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

// ==================== MOBILE MENU TOGGLE ====================
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

mobileMenuToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navLinksContainer.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
    });
});

// ==================== INTERSECTION OBSERVER FOR ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
const animatedElements = document.querySelectorAll(
    '.feature-card, .course-card, .testimonial-card, .pricing-card'
);

animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ==================== CTA BUTTON HANDLERS ====================
const ctaButtons = document.querySelectorAll('#cta-hero, #cta-final');

ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Open signup modal
        openModal('signup-modal');
    });
});

// ==================== LOGIN & SIGNUP MODALS ====================
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');

// Open modals
loginBtn.addEventListener('click', () => openModal('login-modal'));
signupBtn.addEventListener('click', () => openModal('signup-modal'));

// Close buttons
document.getElementById('login-close').addEventListener('click', () => closeModal('login-modal'));
document.getElementById('signup-close').addEventListener('click', () => closeModal('signup-modal'));

// Close on overlay click
document.getElementById('login-overlay').addEventListener('click', () => closeModal('login-modal'));
document.getElementById('signup-overlay').addEventListener('click', () => closeModal('signup-modal'));

// Switch between modals
document.getElementById('switch-to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('login-modal');
    setTimeout(() => openModal('signup-modal'), 200);
});

document.getElementById('switch-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('signup-modal');
    setTimeout(() => openModal('login-modal'), 200);
});

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Form submissions
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    showNotification(`🎉 Welcome back! Logging in as ${email}...`);
    setTimeout(() => {
        closeModal('login-modal');
        e.target.reset();
    }, 1500);
});

document.getElementById('signup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (password !== confirm) {
        showNotification('❌ Passwords do not match!');
        return;
    }

    showNotification(`🎉 Welcome ${name}! Your account has been created!`);
    setTimeout(() => {
        closeModal('signup-modal');
        e.target.reset();
    }, 1500);
});

// Close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal('login-modal');
        closeModal('signup-modal');
    }
});

// ==================== WATCH DEMO BUTTON ====================
const watchDemoButton = document.getElementById('watch-demo');

watchDemoButton.addEventListener('click', () => {
    showNotification('🎬 Demo video coming soon!');
});

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '1rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: '10000',
        fontSize: '1rem',
        fontWeight: '600',
        animation: 'slideIn 0.3s ease-out',
        backdropFilter: 'blur(10px)'
    });

    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ==================== PRICING CARD INTERACTIONS ====================
const pricingCards = document.querySelectorAll('.pricing-card');

pricingCards.forEach(card => {
    const button = card.querySelector('.btn');

    button.addEventListener('click', () => {
        const planName = card.querySelector('.pricing-title').textContent;
        showNotification(`🚀 Selected ${planName} plan! Redirecting to checkout...`);
    });
});

// ==================== COURSE CARD INTERACTIONS ====================
const courseCards = document.querySelectorAll('.course-card');

courseCards.forEach(card => {
    card.addEventListener('click', () => {
        const courseName = card.querySelector('.course-title').textContent;
        showNotification(`📚 Opening ${courseName} course details...`);
    });
});

// ==================== PARALLAX EFFECT FOR HERO ====================
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');

    if (heroContent && heroImage) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// ==================== FLOATING CARDS ANIMATION ====================
const floatingCards = document.querySelectorAll('.floating-card');

floatingCards.forEach((card, index) => {
    // Add random slight movements
    setInterval(() => {
        const randomX = Math.random() * 10 - 5;
        const randomY = Math.random() * 10 - 5;
        card.style.transform = `translate(${randomX}px, ${randomY}px)`;
    }, 3000 + index * 1000);
});

// ==================== GRADIENT ORB MOVEMENT ====================
document.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.gradient-orb');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    orbs.forEach((orb, index) => {
        const speed = (index + 1) * 20;
        const moveX = (x - 0.5) * speed;
        const moveY = (y - 0.5) * speed;

        orb.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});

// ==================== COUNTER ANIMATION FOR STATS ====================
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
        }
    }, 16);
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Trigger counter animation when stats come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const statNumbers = entry.target.querySelectorAll('.stat-number');

            statNumbers.forEach(stat => {
                const text = stat.textContent;
                let target = 0;

                if (text.includes('K')) {
                    target = parseFloat(text) * 1000;
                } else if (text.includes('%')) {
                    target = parseInt(text);
                } else {
                    target = parseInt(text);
                }

                animateCounter(stat, target);
            });
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ==================== INITIALIZE ====================
console.log('🎓 Academic Comeback - Landing Page Loaded Successfully!');
console.log('✨ All interactive features are ready!');

// Add loading animation completion
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ==================== COMMUNITY BUTTONS ====================
const communityButtons = document.querySelectorAll('.community-card .btn');

communityButtons.forEach(button => {
    button.addEventListener('click', () => {
        const cardTitle = button.closest('.community-card').querySelector('.community-title').textContent;
        showNotification(`?? Opening ${cardTitle}...`);
    });
});
