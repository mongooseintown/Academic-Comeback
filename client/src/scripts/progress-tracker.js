// ==================== GLOBAL VARIABLES ====================
let currentUser = null;

// ==================== AUTHENTICATION CHECK ====================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/check-auth', {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = 'index.html';
        } else {
            currentUser = data.user;
            updateUserInfo(data.user);
            loadAcademicProgress();
        }
    } catch (error) {
        console.error('Auth check failed', error);
        window.location.href = 'index.html';
    }
});

function updateUserInfo(user) {
    const userNameElement = document.getElementById('sidebar-user-name');
    const userIdElement = document.getElementById('sidebar-user-id');
    const globalAvatar = document.getElementById('global-sidebar-avatar');

    if (userNameElement) userNameElement.textContent = user.name;
    if (userIdElement) userIdElement.textContent = `ID: ${user.universityId}`;

    if (globalAvatar && user.profilePicture) {
        globalAvatar.innerHTML = `<img src="${user.profilePicture}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    }
}

// ==================== UI INTERACTIONS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle (Sidebar)
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
        if (sidebarClose) sidebarClose.addEventListener('click', toggleMenu);
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
});

// ==================== ACADEMIC PROGRESS LOGIC ====================
async function loadAcademicProgress() {
    const container = document.getElementById('progress-container');
    if (!container) return;

    try {
        const response = await fetch('/api/user-courses', { credentials: 'include' });
        const data = await response.json();

        if (data.success && data.courses && data.courses.length > 0) {
            container.innerHTML = data.courses.map((course, index) => {
                const progress = 0; // Hardcoded to 0 as per baseline
                const delay = index * 0.1;

                return `
                <div class="progress-card-premium" style="animation-delay: ${delay}s">
                    <div class="progress-card-info">
                        <div class="course-meta">
                            <span class="course-code-badge">${course.code}</span>
                            ${course.isExtra ? '<span class="extra-badge-mini">Extra</span>' : ''}
                        </div>
                        <h3 class="course-title-analytics">${course.title}</h3>
                        <div class="progress-stats-row">
                            <span class="progress-label-analytics">Completion Rate</span>
                            <span class="progress-value-analytics">${progress}%</span>
                        </div>
                    </div>
                    <div class="premium-progress-bar-container">
                        <div class="premium-progress-bar-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="course-footer-analytics">
                        <span>Credits: ${course.credits}</span>
                        <a href="course-details.html?code=${course.code}" class="view-details-link">Details →</a>
                    </div>
                </div>
            `}).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state-analytics">
                    <span class="empty-icon-analytics">📚</span>
                    <h3>No Active Courses</h3>
                    <p>It seems you aren't enrolled in any courses yet. Add courses from the dashboard or syllabus page.</p>
                    <a href="my-courses.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Courses</a>
                </div>
            `;
        }
    } catch (e) {
        console.error('Error loading academic progress', e);
        container.innerHTML = '<p class="text-muted">Unable to load progress data at this time.</p>';
    }
}
