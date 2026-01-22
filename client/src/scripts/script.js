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

// ==================== DEVELOPER TIMELINE ANIMATIONS ====================
// Intersection Observer for timeline items (about.html)
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Add staggered delay for smoother animation
            setTimeout(() => {
                entry.target.classList.add('animate-in');
            }, index * 150);
            timelineObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
});

// Observe all timeline items
document.addEventListener('DOMContentLoaded', () => {
    const timelineItems = document.querySelectorAll('[data-animate]');
    timelineItems.forEach(item => {
        timelineObserver.observe(item);
    });
});

// ==================== SMOOTH SCROLLING ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        const target = document.querySelector(href);

        // Special handling for home button
        if (href === '#home') {
            e.preventDefault();

            // Check if we're on the landing page (index.html or root)
            const currentPage = window.location.pathname;
            const isOnLandingPage = currentPage.endsWith('index.html') ||
                currentPage.endsWith('/') ||
                currentPage === '/' ||
                currentPage.includes('index.html');

            if (isOnLandingPage) {
                // Already on landing page, scroll to top (hero/banner section)
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                // On another page, redirect to landing page
                window.location.href = 'index.html';
            }
            return;
        }

        // Normal smooth scrolling for other links
        if (target) {
            e.preventDefault();
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
// Logic moved to mobile-menu.js to avoid duplication and conflicts

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

if (ctaButtons.length > 0) {
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Open signup modal
            openModal('signup-modal');
        });
    });
}

// ==================== LOGIN & SIGNUP MODALS ====================
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');

// Open modals with safe checks
if (loginBtn) loginBtn.addEventListener('click', () => openModal('login-modal'));
if (signupBtn) signupBtn.addEventListener('click', () => openModal('signup-modal'));

// Close buttons
const loginClose = document.getElementById('login-close');
const signupClose = document.getElementById('signup-close');
if (loginClose) loginClose.addEventListener('click', () => closeModal('login-modal'));
if (signupClose) signupClose.addEventListener('click', () => closeModal('signup-modal'));

// Close on overlay click
const loginOverlay = document.getElementById('login-overlay');
const signupOverlay = document.getElementById('signup-overlay');
if (loginOverlay) loginOverlay.addEventListener('click', () => closeModal('login-modal'));
if (signupOverlay) signupOverlay.addEventListener('click', () => closeModal('signup-modal'));

// Switch between modals
const switchToSignup = document.getElementById('switch-to-signup');
if (switchToSignup) {
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('login-modal');
        setTimeout(() => openModal('signup-modal'), 200);
    });
}

const switchToLogin = document.getElementById('switch-to-login');
if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('signup-modal');
        setTimeout(() => openModal('login-modal'), 200);
    });
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Enforce University ID Format (Uppercasing)
const universityIdInputs = document.querySelectorAll('#login-id, #signup-id');
universityIdInputs.forEach(input => {
    input.addEventListener('input', function () {
        this.value = this.value.toUpperCase();
        if (this.value.length > 0 && !this.value.startsWith('C')) {
            this.setCustomValidity("University ID must start with 'C'");
        } else {
            this.setCustomValidity("");
        }
    });
});

// Form submissions
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const universityId = document.getElementById('login-id').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ universityId, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store token in localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('showWelcomeMessage', data.user.name); // Flag for dashboard

            // Redirect immediately (notification will be shown on dashboard)
            setTimeout(() => {
                closeModal('login-modal');
                window.location.href = '/dashboard.html';
            }, 0);
        } else {
            showNotification(`❌ ${data.message}`);
        }

    } catch (error) {
        console.error('Login error:', error);
        showNotification('❌ Server error. Please make sure the server is running.');
    }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const universityId = document.getElementById('signup-id').value;
    const semester = document.getElementById('signup-semester').value;

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    // Client-side validation
    if (password !== confirm) {
        showNotification('❌ Passwords do not match!');
        return;
    }

    if (password.length < 6) {
        showNotification('❌ Password must be at least 6 characters long!');
        return;
    }

    if (!universityId.startsWith('C')) {
        showNotification("❌ University ID must start with 'C'");
        return;
    }

    if (!semester) {
        showNotification('❌ Please select your current semester!');
        return;
    }



    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ name, email, password, universityId, semester })
        });

        const data = await response.json();

        if (data.success) {
            // Store token in localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('showWelcomeMessage', data.user.name); // Flag for dashboard

            // Redirect immediately
            setTimeout(() => {
                closeModal('signup-modal');
                window.location.href = '/dashboard.html';
            }, 0);
        } else {
            showNotification(`❌ ${data.message}`);
        }

    } catch (error) {
        console.error('Signup error:', error);
        showNotification('❌ Server error. Please make sure the server is running.');
    }
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

// ==================== GLOBAL NOTIFICATION SYSTEM ====================
window.showNotification = function (message, type = 'info') {
    // Remove existing notifications to avoid stacking issues
    const existingNotifications = document.querySelectorAll('.global-notification');
    existingNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `global-notification notification-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
        </div>
        <div class="notification-progress"></div>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('active'), 10);

    // Auto-remove
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
};

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
function animateCounter(element, target, duration = 2000, suffix = '') {
    // Clear any existing animation on this element
    if (element.timerId) {
        clearInterval(element.timerId);
    }

    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    element.timerId = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(target) + suffix;
            clearInterval(element.timerId);
        } else {
            element.textContent = formatNumber(Math.floor(current)) + suffix;
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
                let suffix = '';

                if (text.includes('K')) {
                    target = parseFloat(text) * 1000;
                    suffix = 'K';
                } else if (text.includes('%')) {
                    target = parseInt(text);
                    suffix = '%';
                } else {
                    target = parseInt(text);
                }

                animateCounter(stat, target, 2000, suffix);
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
        showNotification(`🚀 Opening ${cardTitle}...`);
    });
});

// ==================== CAP MOVEMENT LOGIC ====================
document.addEventListener('DOMContentLoaded', () => {
    const timelineContainer = document.querySelector('.timeline-container');
    const capMover = document.querySelector('.cap-mover');

    if (timelineContainer && capMover) {
        window.addEventListener('scroll', () => {
            const rect = timelineContainer.getBoundingClientRect();
            const viewportheight = window.innerHeight;

            // Logic: Cap strictly tracks how much of the timeline has passed the 'trigger line' (center of screen).
            // This makes it act like a progress marker.

            const startOffset = viewportheight / 2;
            let capY = startOffset - rect.top;

            // Clamp: 0 (Top of line) to Height (Bottom of line)
            if (capY < 0) capY = 0;
            if (capY > rect.height) capY = rect.height;

            capMover.style.transform = `translate(-50%, ${capY}px)`;
        });
    }
});

// ==================== FETCH REAL STATISTICS ====================
async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();

        if (data.success) {
            const studentEl = document.getElementById('stat-students');
            const accessEl = document.getElementById('stat-access');
            const coursesEl = document.getElementById('stat-courses');

            // Animate to real values
            if (studentEl) animateCounter(studentEl, data.students);
            // Free Access is static 100%, but we ensure it displays
            if (accessEl) accessEl.textContent = data.freeAccess;
            // Courses
            if (coursesEl) animateCounter(coursesEl, data.courses);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Call fetch on load
// Call fetch on load
document.addEventListener('DOMContentLoaded', fetchStats);


/* ==================== COMMAND PALETTE (CTRL+K) ==================== */
document.addEventListener('DOMContentLoaded', () => {
    const cmdPalette = document.getElementById('cmd-palette');
    // If command palette HTML doesn't exist on this page (e.g. dashboard might not have it yet), skip
    if (!cmdPalette) return;

    const cmdInput = document.getElementById('cmd-input');
    const cmdResults = document.getElementById('cmd-results');
    let selectedIndex = 0;
    let filteredItems = [];

    // --- 1. Define Searchable Data ---
    const searchData = [
        // Navigation
        { type: 'navigation', title: 'Home', icon: '🏠', url: 'index.html', keywords: 'home landing page' },
        { type: 'navigation', title: 'Dashboard', icon: '📊', url: 'dashboard.html', keywords: 'dashboard stats profile' },
        { type: 'navigation', title: 'My Courses', icon: '📚', url: 'my-courses.html', keywords: 'courses syllabus subjects' },
        { type: 'navigation', title: 'About Us', icon: 'ℹ️', url: 'about.html', keywords: 'about team mission' },

        // Actions
        { type: 'action', title: 'Log In', icon: '🔐', action: () => document.getElementById('login-btn')?.click(), keywords: 'login signin' },
        { type: 'action', title: 'Sign Up', icon: '✨', action: () => document.getElementById('signup-btn')?.click(), keywords: 'signup register join' },

        // Courses (Dummy Data for Search Demo)
        { type: 'course', title: 'Structured Programming (C)', icon: '💻', url: 'course-details.html?code=CSE-1101', keywords: 'c programming coding' },
        { type: 'course', title: 'Data Structures', icon: '🌳', url: 'course-details.html?code=CSE-1201', keywords: 'data structures algo' },
        { type: 'course', title: 'Algorithms', icon: '⚡', url: 'course-details.html?code=CSE-2201', keywords: 'algorithms competitive programming' },

        // Resources (Dummy Data)
        { type: 'resource', title: 'Math 2 Final Question 2023', icon: '📄', url: '#', keywords: 'math question paper previous year' },
        { type: 'resource', title: 'Physics Lab Report Guide', icon: '📝', url: '#', keywords: 'physics lab report' }
    ];

    // --- 2. Open/Close Logic ---
    function openPalette() {
        cmdPalette.classList.add('active');
        cmdInput.value = '';
        cmdInput.focus();
        filterResults('');
    }

    function closePalette() {
        cmdPalette.classList.remove('active');
    }

    // Toggle with Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (cmdPalette.classList.contains('active')) {
                closePalette();
            } else {
                openPalette();
            }
        }
        // Close with Esc
        if (e.key === 'Escape' && cmdPalette.classList.contains('active')) {
            closePalette();
        }
    });

    // Close when clicking outside
    cmdPalette.addEventListener('click', (e) => {
        if (e.target === cmdPalette) {
            closePalette();
        }
    });

    // --- 3. Filtering Logic ---
    function filterResults(query) {
        const q = query.toLowerCase();

        if (!q) {
            // Show default suggestions (Nav + Actions)
            filteredItems = searchData.filter(item => item.type === 'navigation' || item.type === 'action');
        } else {
            filteredItems = searchData.filter(item => {
                const text = (item.title + ' ' + item.keywords).toLowerCase();
                return text.includes(q);
            });
        }

        renderResults();
    }

    cmdInput.addEventListener('input', (e) => {
        filterResults(e.target.value);
    });

    // --- 4. Rendering Logic ---
    function renderResults() {
        cmdResults.innerHTML = '';
        selectedIndex = 0; // Reset selection

        if (filteredItems.length === 0) {
            cmdResults.innerHTML = `<div style="padding: 1rem; text-align: center; color: var(--text-muted);">No results found for "${cmdInput.value}"</div>`;
            return;
        }

        // Group items by type
        const groups = {};
        filteredItems.forEach(item => {
            if (!groups[item.type]) groups[item.type] = [];
            groups[item.type].push(item);
        });

        // Order: Navigation > Actions > Courses > Resources
        const typeOrder = ['navigation', 'action', 'course', 'resource'];

        let globalIndex = 0;

        typeOrder.forEach(type => {
            if (groups[type]) {
                // Add Group Title
                const groupTitle = document.createElement('div');
                groupTitle.className = 'cmd-group-title';
                groupTitle.textContent = type;
                cmdResults.appendChild(groupTitle);

                // Add Items
                groups[type].forEach(item => {
                    const el = document.createElement('div');
                    el.className = 'cmd-item';
                    if (globalIndex === 0) el.classList.add('selected');
                    el.dataset.index = globalIndex;

                    el.innerHTML = `
                        <div class="cmd-item-icon">${item.icon}</div>
                        <div class="cmd-item-content">
                            <div class="cmd-item-title">${item.title}</div>
                            ${item.keywords ? `<div class="cmd-item-subtitle">${item.type}</div>` : ''}
                        </div>
                        ${globalIndex === 0 ? '<div class="cmd-key">↵</div>' : ''}
                    `;

                    // Click Handler
                    el.addEventListener('click', () => {
                        executeAction(item);
                    });

                    // Mouse open hover selection
                    el.addEventListener('mouseenter', () => {
                        updateSelection(parseInt(el.dataset.index));
                    });

                    cmdResults.appendChild(el);
                    item.element = el; // Store reference
                    globalIndex++;
                });
            }
        });
    }

    function updateSelection(index) {
        // Remove old selection
        const oldSel = cmdResults.querySelector('.cmd-item.selected');
        if (oldSel) {
            oldSel.classList.remove('selected');
            const keyHint = oldSel.querySelector('.cmd-key');
            if (keyHint) keyHint.remove();
        }

        selectedIndex = index;

        // Add new selection
        const newSel = cmdResults.querySelector(`.cmd-item[data-index="${index}"]`);
        if (newSel) {
            newSel.classList.add('selected');
            newSel.innerHTML += '<div class="cmd-key">↵</div>';
            newSel.scrollIntoView({ block: 'nearest' });
        }
    }

    function executeAction(item) {
        closePalette();
        if (item.url) {
            window.location.href = item.url;
        } else if (item.action) {
            item.action();
        }
    }

    // --- 5. Keyboard Navigation ---
    cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const maxIndex = document.querySelectorAll('.cmd-item').length - 1;
            if (selectedIndex < maxIndex) updateSelection(selectedIndex + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (selectedIndex > 0) updateSelection(selectedIndex - 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // Find selected item from the flat list (filteredItems matches the DOM order essentially, but we need to map correctly)
            // Actually relying on DOM data-index is safer since we grouped them
            const selectedEl = cmdResults.querySelector('.cmd-item.selected');
            if (selectedEl) {
                // We need to find the item object corresponding to this index.
                // A simple way is to re-flatten our grouped structure or just look it up.
                // Let's iterate our dom generation logic again? No, let's just find the item in filteredItems.
                // Wait, filteredItems is NOT sorted by group. DOM is.
                // Correct approach: Attach the item data to the DOM element directly property
                // but simple HTML/JS... let's just re-find it or use the parallel array logic.

                // Simpler: Just rely on click simulation
                selectedEl.click();
            }
        }
    });
});

// ==================== NAV SEARCH BUTTON (GLOBAL) ====================
// This needs to be outside DOMContentLoaded to ensure it runs after dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        const navSearchBtn = document.getElementById('nav-search-btn');
        const cmdPalette = document.getElementById('cmd-palette');

        console.log('Search button found:', navSearchBtn);
        console.log('Command palette found:', cmdPalette);

        if (navSearchBtn && cmdPalette) {
            navSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Search button clicked!');
                cmdPalette.classList.add('active');
                const cmdInput = document.getElementById('cmd-input');
                if (cmdInput) {
                    cmdInput.value = '';
                    cmdInput.focus();
                }
            });
            console.log('Search button listener attached successfully');
        } else {
            console.error('Search button or palette not found!');
        }
    }, 100);
});
