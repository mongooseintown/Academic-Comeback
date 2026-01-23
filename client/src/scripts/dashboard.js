// ==================== GLOBAL VARIABLES ====================
let allCourses = [];
let userEnrolledCourses = [];

// ==================== AUTHENTICATION CHECK ====================
// Check processing session on load
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we are on login/signup page
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path === '/' || path.endsWith('signup.html')) {
        return;
    }

    try {
        const response = await fetch('/api/check-auth', {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = 'index.html';
        } else {
            // Setup User Info
            updateUserInfo(data.user);
        }
    } catch (error) {
        console.error('Auth check failed', error);
        window.location.href = 'index.html';
    }

    // Dashboard Specific Logic
    if (path.includes('dashboard.html')) {
        initCharts();

        // Check for welcome message flag from login/signup
        const welcomeUser = localStorage.getItem('showWelcomeMessage');
        if (welcomeUser) {
            showNotification(`🎉 Welcome back, ${welcomeUser}!`);
            localStorage.removeItem('showWelcomeMessage');
        }
    }
});

function updateUserInfo(user) {
    const userNameElement = document.getElementById('sidebar-user-name');
    const userIdElement = document.getElementById('sidebar-user-id');
    const profileBtn = document.getElementById('sidebar-profile-btn');
    const welcomeMsg = document.getElementById('welcome-message');

    if (userNameElement) userNameElement.textContent = user.name;
    if (userIdElement) userIdElement.textContent = user.universityId;

    if (welcomeMsg) {
        welcomeMsg.textContent = `Welcome back, ${user.name.split(' ')[0]}! Continue your learning journey.`;
    }

    // Update global avatar to image
    const globalAvatar = document.getElementById('global-sidebar-avatar');
    if (globalAvatar) {
        if (user.profilePicture) {
            globalAvatar.innerHTML = `<img src="${user.profilePicture}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.parentElement.innerHTML='🎓'">`;
        } else {
            // Default icon if no picture
            globalAvatar.innerHTML = `🎓`;
        }
    }

    // --- Sidebar Sync Logic (Admin/Moderator Links) ---
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
        // Moderator Link
        if ((user.role === 'Moderator' || user.role === 'Admin') && !document.getElementById('moderator-panel-link')) {
            const modLink = document.createElement('a');
            modLink.href = 'moderator.html';
            modLink.className = 'sidebar-link' + (window.location.pathname.includes('moderator.html') ? ' active' : '');
            modLink.id = 'moderator-panel-link';
            modLink.innerHTML = `<span class="link-icon">🛡️</span><span>Moderator Panel</span>`;
            sidebarNav.appendChild(modLink);
        }
        // Admin Link
        if (user.role === 'Admin' && !document.getElementById('admin-panel-link')) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.className = 'sidebar-link' + (window.location.pathname.includes('admin.html') ? ' active' : '');
            adminLink.id = 'admin-panel-link';
            adminLink.innerHTML = `<span class="link-icon">⚙️</span><span>Admin Panel</span>`;
            sidebarNav.appendChild(adminLink);
        }
    }

    // Update Dashboard Stats if on dashboard page
    const creditsValue = document.querySelector('.stat-card .stat-value');
    if (creditsValue && user.completedCredits !== undefined) creditsValue.textContent = user.completedCredits;

    // Update Profile Modal (if it exists)
    const modalAvatar = document.querySelector('.profile-avatar');
    const modalName = document.getElementById('modal-profile-name');
    const modalId = document.getElementById('modal-profile-id');
    const modalEmail = document.getElementById('modal-profile-email');
    const modalSemester = document.getElementById('modal-profile-semester');

    if (modalAvatar && user.profilePicture) {
        modalAvatar.innerHTML = `<img src="${user.profilePicture}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
    if (modalName) modalName.textContent = user.name;
    if (modalId) modalId.textContent = `ID: ${user.universityId}`;
    if (modalEmail) modalEmail.textContent = user.email;
    if (modalSemester) {
        if (user.semester) {
            const suffix = (user.semester === 1) ? 'st' : (user.semester === 2) ? 'nd' : (user.semester === 3) ? 'rd' : 'th';
            modalSemester.textContent = `${user.semester}${suffix} Semester`;
        } else {
            modalSemester.textContent = 'Semester Not Set';
        }
    }

    // Load available courses if on my-courses page
    if (window.location.pathname.includes('my-courses.html')) {
        loadAvailableCourses();
    }
}

// ==================== NAVIGATION & UI INTERACTIONS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarClose = document.getElementById('sidebar-close');

    if (hamburgerBtn && sidebarMenu && sidebarOverlay) {
        const toggleMenu = () => {
            sidebarMenu.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
        };

        hamburgerBtn.addEventListener('click', toggleMenu);
        sidebarClose.addEventListener('click', toggleMenu);
        sidebarOverlay.addEventListener('click', toggleMenu);
    }

    // Logout Functionality
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout failed', error);
            }
        });
    }

    // Add Course Modal Logic
    const addCourseModal = document.getElementById('add-course-modal');
    const addCourseBtn = document.getElementById('add-course-btn');
    const addCourseClose = document.getElementById('add-course-close');
    const addCourseOverlay = document.getElementById('add-course-overlay');

    if (addCourseBtn && addCourseModal) {
        addCourseBtn.addEventListener('click', () => {
            addCourseModal.classList.add('active');
            loadAvailableCourses();
        });

        const closeAddCourseModal = () => {
            addCourseModal.classList.remove('active');
        };

        if (addCourseClose) addCourseClose.addEventListener('click', closeAddCourseModal);
        if (addCourseOverlay) addCourseOverlay.addEventListener('click', closeAddCourseModal);
    }

    // Semester Filter Logic
    const semesterFilter = document.getElementById('semester-filter');
    if (semesterFilter) {
        semesterFilter.addEventListener('change', renderAvailableCourses);
    }
});

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `ac-notification-toast animate-in notification-${type}`;

    // Add icon based on message content if possible
    let icon = 'ℹ️';
    if (message.includes('✅') || message.includes('success')) icon = '✅';
    if (message.includes('❌') || message.includes('Error')) icon = '❌';
    if (message.includes('🎉')) icon = '🎉';

    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message.replace(/[✅❌🎉]/g, '').trim()}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('animate-in');
        notification.classList.add('animate-out');
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}


// ==================== COURSE MANAGEMENT LOGIC ====================

// Load all available courses from server
async function loadAvailableCourses() {
    try {
        const response = await fetch('/api/all-courses', {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            allCourses = data.courses;
            userEnrolledCourses = data.enrolledCourses || [];

            // Update modal subtitle to show current semester
            const modalSubtitle = document.querySelector('#add-course-modal .modal-subtitle');
            if (modalSubtitle && data.userSemester) {
                modalSubtitle.textContent = `Add courses from other semesters (Your current semester: ${data.userSemester})`;
            }

            renderAvailableCourses();
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        const list = document.getElementById('available-courses-list');
        if (list) list.innerHTML = '<div class="loading-message">Error loading courses. Please try again.</div>';
    }
}

function renderAvailableCourses() {
    const container = document.getElementById('available-courses-list');
    const semesterFilter = document.getElementById('semester-filter').value;

    if (!container) return;

    let filteredCourses = allCourses;

    if (semesterFilter !== 'all') {
        filteredCourses = allCourses.filter(c => c.semester == semesterFilter);
    }

    if (filteredCourses.length === 0) {
        container.innerHTML = '<div class="loading-message">No courses found matching criteria.</div>';
        return;
    }

    container.innerHTML = filteredCourses.map(course => {
        const isEnrolled = userEnrolledCourses.some(c => c.code === course.code);

        return `
            <div class="available-course-card ${isEnrolled ? 'added' : ''}">
                <div class="course-card-header">
                    <span class="course-card-code">${course.code}</span>
                    <span class="course-card-semester">Sem ${course.semester}</span>
                </div>
                <div class="course-card-title">${course.title}</div>
                <div class="course-card-credits">${course.credits} Credits</div>
                <div class="course-card-actions">
                    <button class="btn-add-course" 
                            onclick="addCourseToProfile('${course.code}')" 
                            ${isEnrolled ? 'disabled' : ''}>
                        ${isEnrolled ? '✓ Added' : '+ Add Course'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

window.addCourseToProfile = async function (courseCode) {
    try {
        const response = await fetch('/api/add-course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ courseCode })
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`✅ Course added successfully!`);
            // Add to local list to update UI immediately
            userEnrolledCourses.push({ code: courseCode });
            renderAvailableCourses();

            // Reload user courses if on my courses page
            loadMyCourses();
        } else {
            showNotification(`❌ ${data.message || 'Failed to add course'}`);
        }
    } catch (error) {
        console.error('Error adding course:', error);
        showNotification('❌ Error adding course. Please try again.');
    }
};

// ==================== MY COURSES PAGE LOADING ====================
// Load user's courses (semester + extra courses)
async function loadMyCourses() {
    const coursesGrid = document.getElementById('courses-grid');
    const semesterBadge = document.getElementById('semester-badge');

    if (!coursesGrid) return; // Not on my-courses page

    try {
        const response = await fetch('/api/user-courses', {
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            const courses = data.courses || [];
            const semester = data.semester;

            // Update semester badge
            if (semesterBadge) {
                if (semester) {
                    const suffix = (semester === 1) ? 'st' : (semester === 2) ? 'nd' : (semester === 3) ? 'rd' : 'th';
                    semesterBadge.textContent = `Semester ${semester}${suffix}`;
                } else {
                    semesterBadge.textContent = 'My Courses';
                }
                semesterBadge.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                semesterBadge.style.color = '#fff';
                semesterBadge.style.padding = '0.5rem 1rem';
                semesterBadge.style.borderRadius = '20px';
                semesterBadge.style.fontWeight = '600';
            }

            // Render courses
            if (courses.length === 0) {
                coursesGrid.innerHTML = '<div class="loading-message">No courses found.</div>';
                return;
            }

            coursesGrid.innerHTML = courses.map(course => {
                const badgeClass = course.isExtra ? 'extra-course-badge' : '';
                const badgeText = course.isExtra ? `<span class="extra-badge">Extra Course</span>` : '';

                // Remove button for extra courses
                const removeBtn = course.isExtra
                    ? `<button class="btn-remove-course" onclick="event.stopPropagation(); removeExtraCourse('${course.code}')" title="Remove Course">×</button>`
                    : '';

                return `
                    <div class="course-card">
                        <div class="course-header" style="position: relative; display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <h3 class="course-title">${course.title}</h3>
                                ${badgeText}
                            </div>
                            ${removeBtn}
                        </div>
                        <p class="course-code">${course.code}</p>
                        <p class="course-credits">${course.credits} Credits</p>
                        <div class="course-actions">
                            <button class="btn btn-outline btn-sm" onclick="openCourseTerm('${course.code}', '${course.title}', 'mid')">
                                Mid Term
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="openCourseTerm('${course.code}', '${course.title}', 'final')">
                                Final Term
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

        } else {
            coursesGrid.innerHTML = '<div class="loading-message">Error loading courses.</div>';
        }

    } catch (error) {
        console.error('Error loading my courses:', error);
        if (coursesGrid) {
            coursesGrid.innerHTML = '<div class="loading-message">Error loading courses. Please try again.</div>';
        }
    }
}

// Call loadMyCourses on page load if on my-courses page
if (window.location.pathname.includes('my-courses.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadMyCourses();
    });
}

// Redirect to Course Details Page
window.openCourseTerm = function (code, title, term) {
    window.location.href = `course-details.html?code=${encodeURIComponent(code)}&term=${term}&title=${encodeURIComponent(title)}`;
};

// Remove Extra Course
window.removeExtraCourse = async function (courseCode) {
    if (!confirm('Are you sure you want to remove this course?')) return;

    try {
        const response = await fetch('/api/remove-course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ courseCode })
        });

        const data = await response.json();

        if (data.success) {
            showNotification('✅ Course removed successfully!');
            // Wait a bit and reload
            setTimeout(() => {
                loadMyCourses();
                // Re-fetch available courses to update the list in modal (enable button)
                // Or just remove from our local list if we assume modal is closed
                userEnrolledCourses = userEnrolledCourses.filter(c => c.code !== courseCode);
            }, 500);
        } else {
            showNotification(`❌ ${data.message || 'Failed to remove course'}`);
        }
    } catch (error) {
        console.error('Error removing course:', error);
        showNotification('❌ Error removing course.');
    }
};

// ==================== DASHBOARD CHARTS & PROGRESS ====================
function initCharts() {
    // Skills Radar Chart
    const radarCtx = document.getElementById('skillRadarChart');
    if (radarCtx && window.Chart) {
        new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Coding', 'Problem Solving', 'Math', 'Communication', 'Theory', 'Projects'],
                datasets: [{
                    label: 'Current Skills',
                    data: [0, 0, 0, 0, 0, 0], // Set to 0
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
                }]
            },
            options: {
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { display: false },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // Semester Performance Bar Chart
    const barCtx = document.getElementById('semesterBarChart');
    if (barCtx && window.Chart) {
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Sem 1', 'Sem 2', 'Sem 3'],
                datasets: [{
                    label: 'GPA',
                    data: [0, 0, 0], // Set to 0
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
                    ],
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 4.0,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

async function loadDashboardProgress() {
    const container = document.getElementById('dashboard-progress-container');
    if (!container) return;

    try {
        const response = await fetch('/api/user-courses', { credentials: 'include' });
        const data = await response.json();

        if (data.success && data.courses && data.courses.length > 0) {
            container.innerHTML = data.courses.map(course => {
                const progress = 0; // Set to 0
                return `
                <div style="background: var(--bg-card); padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <strong style="color: var(--text-primary);">${course.code} - ${course.title}</strong>
                        <span style="color: var(--text-secondary);">${progress}%</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;">
                        <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); border-radius: 3px;"></div>
                    </div>
                </div>
            `}).join('');
        } else {
            container.innerHTML = '<p class="text-muted">No active courses enrolled.</p>';
        }
    } catch (e) {
        console.error('Error loading dashboard progress', e);
        container.innerHTML = '<p class="text-muted">Unable to load progress data.</p>';
    }
}


