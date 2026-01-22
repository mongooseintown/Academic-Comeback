// ==================== GLOBAL VARIABLES ====================
let currentUser = null;

// ==================== AUTHENTICATION CHECK ====================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/check-auth', {
            credentials: 'include'
        });
        const data = await response.json();

        if (!data.authenticated) {
            window.location.href = 'index.html';
        } else {
            currentUser = data.user;
            updateUserInfo(data.user);
            initStudyPlanner();
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
                await fetch('http://localhost:3000/api/logout', { method: 'POST', credentials: 'include' });
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout failed', error);
            }
        });
    }
});

// ==================== STUDY PLANNER LOGIC ====================
async function initStudyPlanner() {
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');

    if (!taskInput || !addBtn || !taskList) return;

    // Load existing tasks
    await loadTasks();

    // Add task event
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    async function loadTasks() {
        try {
            const response = await fetch('http://localhost:3000/api/tasks', { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                renderTasks(data.tasks);
            }
        } catch (e) {
            console.error('Error loading tasks', e);
        }
    }

    async function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        addBtn.disabled = true;
        addBtn.innerText = 'Adding...';

        try {
            const response = await fetch('http://localhost:3000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                taskInput.value = '';
                await loadTasks();
                if (window.showNotification) showNotification('✅ Task added successfully!', 'success');
            }
        } catch (e) {
            console.error('Error adding task', e);
            if (window.showNotification) showNotification('❌ Failed to add task', 'error');
        } finally {
            addBtn.disabled = false;
            addBtn.innerText = 'Add Task';
        }
    }

    function renderTasks(tasks) {
        if (!tasks || tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-planner">
                    <span class="empty-planner-icon">✍️</span>
                    <p>No study tasks yet. Start by adding one above!</p>
                </div>
            `;
            updateProgress(0);
            return;
        }

        taskList.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task._id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                    onclick="toggleTask('${task._id}')">
                <span class="task-content">${task.text}</span>
                <button class="task-delete-btn" onclick="deleteTask('${task._id}')" title="Delete Task">
                    🗑️
                </button>
            </div>
        `).join('');

        // Calculate progress
        const completedCount = tasks.filter(t => t.completed).length;
        const percent = Math.round((completedCount / tasks.length) * 100);
        updateProgress(percent);
    }
}

function updateProgress(percent) {
    const percentText = document.getElementById('planner-progress-percent');
    const progressFill = document.getElementById('planner-progress-fill');

    if (percentText) percentText.textContent = `${percent}%`;
    if (progressFill) progressFill.style.width = `${percent}%`;
}

// Global functions for task actions
async function toggleTask(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
            method: 'PATCH',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
            if (taskItem) {
                taskItem.classList.toggle('completed');
                const checkbox = taskItem.querySelector('.task-checkbox');
                if (checkbox) checkbox.checked = data.task.completed;

                // Recalculate progress from DOM
                recalculateDOMProgress();
            }
        }
    } catch (e) {
        console.error('Error toggling task', e);
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/tasks/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
            if (taskItem) {
                taskItem.style.opacity = '0';
                taskItem.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    taskItem.remove();
                    const taskList = document.getElementById('task-list');
                    if (taskList && taskList.querySelectorAll('.task-item').length === 0) {
                        taskList.innerHTML = `
                            <div class="empty-planner">
                                <span class="empty-planner-icon">✍️</span>
                                <p>No study tasks yet. Start by adding one above!</p>
                            </div>
                        `;
                    }
                    // Recalculate progress from DOM
                    recalculateDOMProgress();
                }, 300);
            }
            if (window.showNotification) showNotification('🗑️ Task removed', 'info');
        }
    } catch (e) {
        console.error('Error deleting task', e);
    }
}

function recalculateDOMProgress() {
    const totalTasks = document.querySelectorAll('.task-item').length;
    if (totalTasks === 0) {
        updateProgress(0);
        return;
    }
    const completedTasks = document.querySelectorAll('.task-item.completed').length;
    const percent = Math.round((completedTasks / totalTasks) * 100);
    updateProgress(percent);
}

// Show Notification Proxy if global script.js doesn't provide it
if (!window.showNotification) {
    window.showNotification = function (message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `ac-notification-toast animate-in notification-${type}`;

        let icon = 'ℹ️';
        if (message.includes('✅')) icon = '✅';
        if (message.includes('❌')) icon = '❌';
        if (message.includes('🗑️')) icon = '🗑️';

        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message.replace(/[✅❌🗑️]/g, '').trim()}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('animate-out');
            setTimeout(() => notification.remove(), 400);
        }, 3000);
    };
}
