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
        try {
            const response = await fetch('/api/admin/moderators', { credentials: 'include' });
            const data = await response.json();

            if (data.success && data.moderators) {
                if (data.moderators.length === 0) {
                    listContainer.innerHTML = '<p class="text-muted">No moderators assigned yet.</p>';
                } else {
                    listContainer.innerHTML = data.moderators.map(mod => `
                        <div class="moderator-card" style="display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                            <div>
                                <h4 style="margin: 0; color: white;">${mod.name}</h4>
                                <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">${mod.universityId}</p>
                            </div>
                            <button class="btn-demote" onclick="demoteUser('${mod.universityId}')" style="padding: 0.5rem 1rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;">Revoke</button>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Error loading moderators:', error);
            listContainer.innerHTML = '<p class="text-muted">Error loading list.</p>';
        }
    }

    // 3. Promote User Form
    const promoteForm = document.getElementById('promote-form');
    promoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const universityId = document.getElementById('target-id').value.toUpperCase();

        try {
            const response = await fetch('/api/admin/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ universityId })
            });

            const data = await response.json();
            if (data.success) {
                showNotification(`✅ ${data.message}`, 'success');
                promoteForm.reset();
                loadModeratorList();
            } else {
                showNotification(`❌ ${data.message}`, 'error');
            }
        } catch (error) {
            showNotification('❌ Promotion failed', 'error');
        }
    });

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
            if (data.success) {
                showNotification('🗑️ Moderator role revoked', 'info');
                loadModeratorList();
            } else {
                showNotification(`❌ ${data.message}`, 'error');
            }
        } catch (error) {
            console.error('Demote error:', error);
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
