// ==================== ADMIN PANEL LOGIC ====================
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initial Auth & Permission Check
    try {
        const response = await fetch('/api/check-auth', { credentials: 'include' });
        const data = await response.json();

        if (!data.authenticated || data.user.role !== 'Admin') {
            window.location.href = 'dashboard.html';
            return;
        }

        currentUser = data.user;
        updateUserInfo(data.user);
        loadModeratorList();
    } catch (error) {
        console.error('Admin auth check failed:', error);
        window.location.href = 'index.html';
    }

    // 2. Load current moderators
    async function loadModeratorList() {
        const listContainer = document.getElementById('moderator-list');
        if (!listContainer) return;

        try {
            console.log('Fetching moderator list...');
            const response = await fetch(`/api/admin/moderators?t=${Date.now()}`, { credentials: 'include' });
            const data = await response.json();

            console.log('Moderators list loaded:', data.moderators ? data.moderators.length : 0, data.moderators);

            if (data.success && data.moderators) {
                if (data.moderators.length === 0) {
                    listContainer.innerHTML = '<p class="text-muted">No moderators assigned yet.</p>';
                } else {
                    listContainer.innerHTML = data.moderators.map(mod => `
                        <div class="moderator-card">
                            <div class="moderator-info">
                                <h4 class="moderator-name">${mod.name}</h4>
                                <p class="moderator-id">${mod.universityId}</p>
                            </div>
                            <button class="btn-revoke" onclick="demoteUser('${mod.universityId}')">Revoke Access</button>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading moderators:', error);
            listContainer.innerHTML = '<p class="text-muted">Error loading list. Check console.</p>';
        }
    }

    // 3. Promote User Form
    const promoteForm = document.getElementById('promote-form');
    if (promoteForm) {
        promoteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const targetIdInput = document.getElementById('target-id');
            const universityId = targetIdInput.value.toUpperCase();

            const submitBtn = promoteForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-small"></span> Processing...';

                const response = await fetch('/api/admin/promote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ universityId })
                });

                const data = await response.json();
                console.log('Promotion API response:', data);

                if (data.success) {
                    if (window.showNotification) {
                        window.showNotification(data.message || 'Moderator added successfully!', 'success');
                    } else {
                        alert(data.message || 'Success!');
                    }
                    promoteForm.reset();
                    setTimeout(() => loadModeratorList(), 1000); // Increased delay
                } else {
                    if (window.showNotification) {
                        window.showNotification(data.message || 'Error occurred', 'error');
                    }
                }
            } catch (error) {
                console.error('Promotion failed:', error);
                if (window.showNotification) {
                    window.showNotification('Promotion failed. Network or Server error.', 'error');
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    // 4. Demote User Function (Global for onclick)
    window.demoteUser = async (universityId) => {
        if (!confirm(`Are you sure you want to demote ${universityId} to Student?`)) return;

        try {
            const response = await fetch('/api/admin/demote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ universityId })
            });

            const data = await response.json();
            console.log('Demotion API response:', data);
            if (data.success) {
                if (window.showNotification) {
                    window.showNotification(data.message || 'Moderator access revoked', 'success');
                } else {
                    alert(data.message || 'Revoked!');
                }
                setTimeout(() => loadModeratorList(), 1000); // Increased delay
            } else {
                if (window.showNotification) {
                    window.showNotification(data.message || 'Demotion failed', 'error');
                }
            }
        } catch (error) {
            console.error('Demote error:', error);
            if (window.showNotification) {
                window.showNotification('Revoke failed. Network or Server error.', 'error');
            }
        }
    };

    function updateUserInfo(user) {
        const userNameElement = document.getElementById('sidebar-user-name');
        const userIdElement = document.getElementById('sidebar-user-id');
        const globalAvatar = document.getElementById('global-sidebar-avatar');

        if (userNameElement) userNameElement.textContent = user.name;
        if (userIdElement) userIdElement.textContent = `ID: ${user.universityId}`;

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
            // Add Admin Link
            if (!document.getElementById('admin-panel-link')) {
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
            hamburgerBtn.classList.toggle('active');
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
