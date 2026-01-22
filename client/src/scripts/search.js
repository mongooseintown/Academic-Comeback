/* ==================== SIMPLE SEARCH FUNCTIONALITY ==================== */
document.addEventListener('DOMContentLoaded', () => {
    const searchModal = document.getElementById('search-modal');
    const searchOverlay = document.getElementById('search-overlay');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const navSearchBtn = document.getElementById('nav-search-btn');

    if (!searchModal) return;

    // Search data
    const searchData = [
        { title: 'Dashboard', type: 'Page', url: 'dashboard.html', keywords: 'home stats overview' },
        { title: 'My Courses', type: 'Page', url: 'my-courses.html', keywords: 'courses subjects semester' },
        { title: 'Structured Programming (C)', type: 'Course', url: 'course-details.html?code=CSE-1101', keywords: 'c programming coding' },
        { title: 'Data Structures', type: 'Course', url: 'course-details.html?code=CSE-1201', keywords: 'data structures algorithms' },
        { title: 'Algorithms', type: 'Course', url: 'course-details.html?code=CSE-2201', keywords: 'algorithms complexity' }
    ];

    // Open search
    function openSearch() {
        searchModal.classList.add('active');
        if (searchInput) searchInput.focus();
        document.body.style.overflow = 'hidden';
    }

    // Close search
    function closeSearch() {
        searchModal.classList.remove('active');
        if (searchInput) searchInput.value = '';
        document.body.style.overflow = '';
        if (searchResults) {
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <span class="search-icon">🔍</span>
                    <p>Start typing to search...</p>
                </div>
            `;
        }
    }

    // Search function
    function performSearch(query) {
        const q = query.toLowerCase().trim();

        if (!q) {
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <span class="search-icon">🔍</span>
                    <p>Start typing to search...</p>
                </div>
            `;
            return;
        }

        const results = searchData.filter(item => {
            const searchText = (item.title + ' ' + item.keywords).toLowerCase();
            return searchText.includes(q);
        });

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <span class="search-icon">❌</span>
                    <p>No results found</p>
                </div>
            `;
            return;
        }

        searchResults.innerHTML = results.map(item => `
            <div class="search-result-item" onclick="window.location.href='${item.url}'">
                <div class="search-result-title">${item.title}</div>
                <div class="search-result-desc">${item.type}</div>
            </div>
        `).join('');
    }

    // Button click
    if (navSearchBtn) {
        navSearchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            openSearch();
        });
    }

    // Close button
    if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
    }

    // Overlay click
    if (searchOverlay) {
        searchOverlay.addEventListener('click', closeSearch);
    }

    // Input typing
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            performSearch(e.target.value);
        });

        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeSearch();
            }
        });
    }

    // Ctrl+K
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            openSearch();
        }
    });
});
