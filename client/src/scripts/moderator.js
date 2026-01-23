// ==================== MODERATOR DASHBOARD LOGIC ====================
let currentUser = null;
let allCourses = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initial Auth & Permission Check
    try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        const data = await response.json();

        if (!data.authenticated || (data.user.role !== 'Moderator' && data.user.role !== 'Admin')) {
            window.location.href = 'dashboard.html';
            return;
        }

        currentUser = data.user;
        updateUserInfo(data.user);
        loadAllCourses();
    } catch (error) {
        console.error('Moderator auth check failed:', error);
        window.location.href = 'index.html';
    }

    // 2. Fetch All Courses for management
    async function loadAllCourses() {
        try {
            const response = await fetch('/api/all-courses', { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                allCourses = data.courses;
                populateCourseSelect(data.courses);
            }
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    }

    function populateCourseSelect(courses) {
        const select = document.getElementById('course-select');
        select.innerHTML = '<option value="">-- Choose a Course --</option>' +
            courses.map(c => `<option value="${c.code}">${c.code} - ${c.title}</option>`).join('');

        select.addEventListener('change', (e) => {
            const code = e.target.value;
            if (code) {
                const course = allCourses.find(c => c.code === code);
                displayExistingResources(course);
            } else {
                document.getElementById('existing-resources-grid').innerHTML = '<p class="text-muted">Select a course to view and manage its resources.</p>';
                document.getElementById('active-course-info').style.display = 'none';
            }
        });
    }

    function displayExistingResources(course) {
        const grid = document.getElementById('existing-resources-grid');
        const info = document.getElementById('active-course-info');
        const manageTitle = document.getElementById('manage-title');

        info.style.display = 'block';
        manageTitle.textContent = `Managing: ${course.code}`;

        const midResources = (course.mid.resources || []).map(r => ({ ...r, term: 'mid' }));
        const finalResources = (course.final.resources || []).map(r => ({ ...r, term: 'final' }));
        const allRes = [...midResources, ...finalResources];

        if (allRes.length === 0) {
            grid.innerHTML = '<p class="text-muted">No resources found for this course yet.</p>';
            return;
        }

        grid.innerHTML = allRes.map(r => `
            <div class="resource-manage-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                <div>
                    <span style="font-size: 0.7rem; color: #60a5fa; text-transform: uppercase;">${r.term} term • ${r.type}</span>
                    <h4 style="margin: 0.2rem 0; color: white;">${r.name}</h4>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Segment: ${r.segment || 'Full'}</span>
                </div>
                <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.2);" onclick="deleteResource('${course.code}', '${r.term}', '${r._id}')">Delete</button>
            </div>
        `).join('');
    }

    // 3. Handle Form Submission
    const addForm = document.getElementById('add-resource-form');
    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            courseCode: document.getElementById('course-select').value,
            term: document.getElementById('term-select').value,
            type: document.getElementById('type-select').value,
            segment: parseInt(document.getElementById('segment-input').value),
            name: document.getElementById('resource-name').value,
            link: document.getElementById('resource-link').value
        };

        try {
            const response = await fetch('/api/moderator/add-resource', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                showNotification('✅ Resource added successfully!', 'success');
                addForm.reset();
                // Refresh list
                const updatedCourse = data.course; // API returns updated course
                const idx = allCourses.findIndex(c => c.code === updatedCourse.code);
                allCourses[idx] = updatedCourse;
                displayExistingResources(updatedCourse);
            } else {
                showNotification(`❌ ${data.message}`, 'error');
            }
        } catch (error) {
            console.error('Failed to add resource:', error);
            showNotification('❌ Server error. Try again.', 'error');
        }
    });

    // 4. Delete Resource Function (Global so onclick works)
    window.deleteResource = async (courseCode, term, resourceId) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;

        try {
            const response = await fetch('/api/moderator/delete-resource', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ courseCode, term, resourceId })
            });

            const data = await response.json();
            if (data.success) {
                showNotification('🗑️ Resource removed', 'info');
                // Update local storage and UI
                const course = allCourses.find(c => c.code === courseCode);
                if (term === 'mid') {
                    course.mid.resources = course.mid.resources.filter(r => r._id !== resourceId);
                } else {
                    course.final.resources = course.final.resources.filter(r => r._id !== resourceId);
                }
                displayExistingResources(course);
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    function updateUserInfo(user) {
        const userNameElement = document.getElementById('sidebar-user-name');
        const userIdElement = document.getElementById('sidebar-user-id');
        const globalAvatar = document.getElementById('global-sidebar-avatar');

        if (userNameElement) userNameElement.textContent = user.name;
        if (userIdElement) userIdElement.textContent = `Moderator Rank`;

        if (globalAvatar && user.profilePicture) {
            globalAvatar.innerHTML = `<img src="${user.profilePicture}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.parentElement.innerHTML='🎓'">`;
        }

        // --- Sidebar Sync Logic ---
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (sidebarNav) {
            // Add Moderator Link
            if (!document.getElementById('moderator-panel-link')) {
                const modLink = document.createElement('a');
                modLink.href = 'moderator.html';
                modLink.className = 'sidebar-link' + (window.location.pathname.includes('moderator.html') ? ' active' : '');
                modLink.id = 'moderator-panel-link';
                modLink.innerHTML = `<span class="link-icon">🛡️</span><span>Moderator Panel</span>`;
                sidebarNav.appendChild(modLink);
            }
            // Add Admin Link (only for admins)
            if (user.role === 'Admin' && !document.getElementById('admin-panel-link')) {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.className = 'sidebar-link' + (window.location.pathname.includes('admin.html') ? ' active' : '');
                adminLink.id = 'admin-panel-link';
                adminLink.innerHTML = `<span class="link-icon">⚙️</span><span>Admin Panel</span>`;
                sidebarNav.appendChild(adminLink);
            }
        }
    }

    // ==================== SIDEBAR & UI NAVIGATION ====================
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarClose = document.getElementById('sidebar-close');

    if (hamburgerBtn && sidebarMenu && sidebarOverlay) {
        const toggleMenu = () => {
            sidebarMenu.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        };

        hamburgerBtn.addEventListener('click', toggleMenu);
        if (sidebarClose) sidebarClose.addEventListener('click', toggleMenu);
        sidebarOverlay.addEventListener('click', toggleMenu);
    }

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
