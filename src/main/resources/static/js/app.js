const API_URL = 'http://localhost:8080/api';

let clubs = [];
let members = [];
let events = [];
let currentClubId = null;
let currentMemberId = null;
let currentEventId = null;
let currentUser = null;
let userRole = null;
let userClubId = null;

// Authentication check
function checkAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        window.location.href = '/login.html';
        return false;
    }
    
    try {
        currentUser = JSON.parse(userStr);
        userRole = currentUser.role;
        userClubId = currentUser.clubId;
        updateUserProfile();
        applyRoleBasedRestrictions();
        return true;
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
        return false;
    }
}

// Apply role-based restrictions to UI
function applyRoleBasedRestrictions() {
    const isOverallHead = userRole === 'OVERALL_CLUB_HEAD';
    const isCoordinator = userRole === 'CLUB_COORDINATOR';
    const isPresident = userRole === 'CLUB_PRESIDENT';
    
    // Hide/show Add buttons based on role
    const addClubBtn = document.getElementById('add-club-btn');
    const addMemberBtn = document.getElementById('add-member-btn');
    const addEventBtn = document.getElementById('add-event-btn');
    
    if (addClubBtn) {
        addClubBtn.style.display = isOverallHead ? 'flex' : 'none';
    }
    
    if (addMemberBtn) {
        addMemberBtn.style.display = (isOverallHead || isCoordinator) ? 'flex' : 'none';
    }
    
    if (addEventBtn) {
        addEventBtn.style.display = (isOverallHead || isCoordinator || isPresident) ? 'flex' : 'none';
    }
    
    // Hide/show sidebar navigation items based on role
    const navSettings = document.getElementById('nav-settings');
    const navReports = document.getElementById('nav-reports');
    const navAnalytics = document.getElementById('nav-analytics');
    const navMessages = document.getElementById('nav-messages');
    
    if (!isOverallHead) {
        // Hide admin-only sections
        if (navSettings) navSettings.style.display = 'none';
        if (navReports) navReports.style.display = 'none';
        if (navAnalytics) navAnalytics.style.display = 'none';
        
        // Messages available to coordinators and presidents
        if (navMessages) {
            navMessages.style.display = (isCoordinator || isPresident) ? 'flex' : 'none';
        }
    } else {
        // Show all sections for admin
        if (navSettings) navSettings.style.display = 'flex';
        if (navReports) navReports.style.display = 'flex';
        if (navAnalytics) navAnalytics.style.display = 'flex';
        if (navMessages) navMessages.style.display = 'flex';
    }
    
    // Show role-based welcome message
    updateWelcomeMessage();
}

// Update welcome message based on role
async function updateWelcomeMessage() {
    const welcomeCard = document.querySelector('.welcome-card h2');
    const welcomeDescription = document.getElementById('welcome-description');
    if (!welcomeCard || !currentUser) return;
    
    // For coordinators and presidents, fetch and display their club name
    if ((userRole === 'CLUB_COORDINATOR' || userRole === 'CLUB_PRESIDENT') && userClubId) {
        try {
            const response = await fetch(`${API_URL}/clubs/${userClubId}`, {
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                const club = await response.json();
                
                if (userRole === 'CLUB_COORDINATOR') {
                    welcomeCard.textContent = `Welcome, ${currentUser.fullName}! Managing ${club.name} 🎯`;
                    if (welcomeDescription) {
                        welcomeDescription.textContent = `Here's an overview of ${club.name}'s activities and members.`;
                    }
                } else if (userRole === 'CLUB_PRESIDENT') {
                    welcomeCard.textContent = `Welcome, ${currentUser.fullName}! Leading ${club.name} 🌟`;
                    if (welcomeDescription) {
                        welcomeDescription.textContent = `Keep track of ${club.name}'s events and achievements.`;
                    }
                }
            } else {
                // Fallback if club fetch fails
                const roleMessages = {
                    'CLUB_COORDINATOR': `Welcome, ${currentUser.fullName}! Ready to coordinate? 🎯`,
                    'CLUB_PRESIDENT': `Welcome, ${currentUser.fullName}! Lead with excellence! 🌟`
                };
                welcomeCard.textContent = roleMessages[userRole];
                if (welcomeDescription) {
                    welcomeDescription.textContent = "Here's an overview of your club's activities.";
                }
            }
        } catch (error) {
            console.error('Error fetching club details:', error);
            // Fallback message
            welcomeCard.textContent = `Welcome, ${currentUser.fullName}!`;
            if (welcomeDescription) {
                welcomeDescription.textContent = "Here's your dashboard overview.";
            }
        }
    } else {
        // Admin user - show general welcome
        welcomeCard.textContent = `Welcome back, ${currentUser.fullName}! 👋`;
        if (welcomeDescription) {
            welcomeDescription.textContent = "Here's what's happening with your clubs today.";
        }
    }
}

// Update user profile in header
function updateUserProfile() {
    if (!currentUser) return;
    
    const userNameElement = document.getElementById('user-name');
    const userRoleElement = document.getElementById('user-role');
    
    if (userNameElement) {
        userNameElement.textContent = currentUser.fullName;
    }
    
    if (userRoleElement) {
        const roleNames = {
            'OVERALL_CLUB_HEAD': 'Overall Club Head',
            'CLUB_COORDINATOR': 'Club Coordinator',
            'CLUB_PRESIDENT': 'Club President'
        };
        userRoleElement.textContent = roleNames[currentUser.role] || currentUser.role;
    }
    
    // Update user avatars
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=4F46E5&color=fff`;
    const userAvatars = document.querySelectorAll('.user-icon img, .user-info img');
    userAvatars.forEach(img => {
        img.src = avatarUrl;
        img.alt = currentUser.fullName;
    });
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Get auth headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuth()) {
        return;
    }
    
    // Initialize sidebar
    initializeSidebar();
    
    // Load data
    loadClubs();
    loadMembers();
    loadEvents();
    updateDashboardStats();
    initializeGlobalSearch();
    
    // Load pending approvals for admin
    if (userRole === 'OVERALL_CLUB_HEAD') {
        loadPendingApprovals();
    }
    
    // Add logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});

// Global Search
function initializeGlobalSearch() {
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce(performGlobalSearch, 300));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function performGlobalSearch(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        return;
    }
    
    // Search in clubs
    const clubResults = clubs.filter(club => 
        club.name.toLowerCase().includes(searchTerm) ||
        (club.description && club.description.toLowerCase().includes(searchTerm)) ||
        (club.category && club.category.toLowerCase().includes(searchTerm))
    );
    
    // Search in members
    const memberResults = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm)
    );
    
    // Search in events
    const eventResults = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        (event.description && event.description.toLowerCase().includes(searchTerm))
    );
    
    // Show results count in console for now (can be enhanced with a dropdown)
    console.log(`Search results for "${searchTerm}":`, {
        clubs: clubResults.length,
        members: memberResults.length,
        events: eventResults.length
    });
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const footer = document.querySelector('.footer');
    
    if (!sidebar) return;
    
    // For mobile, toggle active state (slide in/out)
    if (window.innerWidth <= 1024) {
        sidebar.classList.toggle('active');
    } else {
        // For desktop, toggle collapsed state
        sidebar.classList.toggle('collapsed');
        if (mainContent) mainContent.classList.toggle('expanded');
        if (footer) footer.classList.toggle('expanded');
    }
}

// Initialize sidebar state based on screen size
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    // On desktop, ensure sidebar is visible
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('active');
        sidebar.classList.remove('collapsed');
    } else {
        // On mobile, hide by default
        sidebar.classList.remove('active');
    }
}

// Handle window resize to adjust sidebar
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    if (window.innerWidth > 1024) {
        // Desktop: remove mobile active class
        sidebar.classList.remove('active');
    } else {
        // Mobile: remove desktop collapsed class
        sidebar.classList.remove('collapsed');
        const mainContent = document.querySelector('.main-content');
        const footer = document.querySelector('.footer');
        if (mainContent) mainContent.classList.remove('expanded');
        if (footer) footer.classList.remove('expanded');
    }
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (window.innerWidth <= 1024 && 
        sidebar.classList.contains('active') && 
        !sidebar.contains(event.target) && 
        !menuToggle.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});

// Toggle User Dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

// Section Navigation
function showSection(section) {
    // Check role-based access for restricted sections
    const isOverallHead = userRole === 'OVERALL_CLUB_HEAD';
    const isCoordinator = userRole === 'CLUB_COORDINATOR';
    const isPresident = userRole === 'CLUB_PRESIDENT';
    
    // Define restricted sections
    const adminOnlySections = ['settings', 'reports', 'analytics'];
    const coordinatorSections = ['messages'];
    
    // Prevent unauthorized access
    if (adminOnlySections.includes(section) && !isOverallHead) {
        showNotification('Access Denied', 'You do not have permission to access this section.', 'error');
        return;
    }
    
    if (coordinatorSections.includes(section) && !isOverallHead && !isCoordinator && !isPresident) {
        showNotification('Access Denied', 'You do not have permission to access this section.', 'error');
        return;
    }
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('active');
    }
    
    // Remove active class from all sections and nav items
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
    
    // Activate the requested section
    const sectionElement = document.getElementById(section + '-section');
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    // Activate the corresponding nav item
    const navItem = document.getElementById('nav-' + section);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    // Load specific section data
    if (section === 'analytics') {
        updateAnalytics();
    } else if (section === 'dashboard') {
        updateDashboardStats();
    } else if (section === 'clubs') {
        loadClubs();
    } else if (section === 'members') {
        loadMembers();
    } else if (section === 'events') {
        loadEvents();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update Dashboard Stats
function updateDashboardStats() {
    document.getElementById('total-clubs').textContent = clubs.length;
    document.getElementById('total-members').textContent = members.length;
    
    const upcomingEvents = events.filter(e => e.status === 'SCHEDULED');
    document.getElementById('total-events').textContent = upcomingEvents.length;
    document.getElementById('active-clubs').textContent = clubs.length;
    
    displayRecentEvents();
    displayClubCategories();
}

// Display Recent Events
function displayRecentEvents() {
    const container = document.getElementById('recent-events');
    const recentEvents = events.slice(0, 3);
    
    if (recentEvents.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No recent events</p>';
        return;
    }
    
    container.innerHTML = recentEvents.map(event => {
        const club = clubs.find(c => c.id === event.club?.id);
        return `
            <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                <h4 style="color: var(--text-primary); margin-bottom: 0.25rem;">${event.title}</h4>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">
                    ${club ? club.name : 'N/A'} • ${new Date(event.eventDate).toLocaleDateString()}
                </p>
            </div>
        `;
    }).join('');
}

// Display Club Categories
function displayClubCategories() {
    const container = document.getElementById('club-categories');
    const categories = {};
    
    clubs.forEach(club => {
        categories[club.category] = (categories[club.category] || 0) + 1;
    });
    
    if (Object.keys(categories).length === 0) {
        container.innerHTML = '<p style="color: var(--text-light);">No data available</p>';
        return;
    }
    
    container.innerHTML = Object.entries(categories).map(([category, count]) => `
        <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
            <span style="color: var(--text-primary);">${category}</span>
            <span style="font-weight: 600; color: var(--primary-color);">${count}</span>
        </div>
    `).join('');
}

// Update Analytics
function updateAnalytics() {
    const avgMembers = members.length > 0 ? Math.round(members.length / Math.max(clubs.length, 1)) : 0;
    document.getElementById('avg-members').textContent = avgMembers;
    
    const completedEvents = events.filter(e => e.status === 'COMPLETED');
    document.getElementById('completed-events').textContent = completedEvents.length;
    
    const scheduledEvents = events.filter(e => e.status === 'SCHEDULED');
    document.getElementById('scheduled-events').textContent = scheduledEvents.length;
    
    // Find top category
    const categories = {};
    clubs.forEach(club => {
        categories[club.category] = (categories[club.category] || 0) + 1;
    });
    
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
        document.getElementById('top-category').textContent = topCategory[0];
    }
    
    displayCategoryDistribution(categories);
}

// Display Category Distribution
function displayCategoryDistribution(categories) {
    const container = document.getElementById('category-distribution');
    const total = clubs.length;
    
    if (total === 0) {
        container.innerHTML = '<p style="color: var(--text-light); text-align: center;">No data available</p>';
        return;
    }
    
    container.innerHTML = Object.entries(categories).map(([category, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        return `
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span style="color: var(--text-primary);">${category}</span>
                    <span style="color: var(--text-secondary);">${count} (${percentage}%)</span>
                </div>
                <div style="background: var(--bg-color); height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: var(--primary-color); height: 100%; width: ${percentage}%;"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== CLUBS ====================

async function loadClubs() {
    try {
        showLoadingSpinner('clubs-grid');
        const response = await fetch(`${API_URL}/clubs`, {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let allClubs = await response.json();
        
        // Filter clubs based on user role
        if (userRole === 'OVERALL_CLUB_HEAD') {
            // Overall Club Head can see all clubs
            clubs = allClubs;
        } else if (userRole === 'CLUB_COORDINATOR' || userRole === 'CLUB_PRESIDENT') {
            // Coordinators and Presidents can only see their assigned club
            if (userClubId) {
                clubs = allClubs.filter(club => club.id === userClubId);
            } else {
                clubs = [];
                showNotification('error', 'No club assigned to your account');
            }
        } else {
            clubs = allClubs;
        }
        
        displayClubs(clubs);
        populateClubSelects();
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading clubs:', error);
        showError('clubs-grid', 'Failed to load clubs. Please ensure the server is running on port 8080.');
    }
}

function displayClubs(clubsToDisplay) {
    const grid = document.getElementById('clubs-grid');
    grid.innerHTML = '';
    
    if (clubsToDisplay.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-light);">
                <i class="ri-building-line" style="font-size: 4rem; margin-bottom: 1rem; display: block;"></i>
                <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">No clubs found</h3>
                <p>${userRole === 'OVERALL_CLUB_HEAD' ? 'Create your first club to get started!' : 'No club assigned to your account.'}</p>
            </div>
        `;
        return;
    }
    
    const canEdit = userRole === 'OVERALL_CLUB_HEAD' || userRole === 'CLUB_COORDINATOR';
    const canDelete = userRole === 'OVERALL_CLUB_HEAD';
    
    clubsToDisplay.forEach(club => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const actionsHTML = (canEdit || canDelete) ? `
            <div class="card-actions">
                ${canEdit ? `<button class="btn btn-edit" onclick="editClub(${club.id})">
                    <i class="ri-edit-line"></i> Edit
                </button>` : ''}
                ${canDelete ? `<button class="btn btn-danger" onclick="deleteClub(${club.id})">
                    <i class="ri-delete-bin-line"></i> Delete
                </button>` : ''}
            </div>
        ` : '';
        
        card.innerHTML = `
            <h3><i class="ri-building-line"></i> ${escapeHtml(club.name)}</h3>
            <span class="card-category">${escapeHtml(club.category)}</span>
            <div class="card-info">
                <p><strong><i class="ri-file-text-line"></i> Description:</strong> ${escapeHtml(club.description) || 'N/A'}</p>
                <p><strong><i class="ri-user-star-line"></i> President:</strong> ${escapeHtml(club.president) || 'N/A'}</p>
                <p><strong><i class="ri-mail-line"></i> Email:</strong> ${escapeHtml(club.email) || 'N/A'}</p>
                <p><strong><i class="ri-phone-line"></i> Phone:</strong> ${escapeHtml(club.phone) || 'N/A'}</p>
                <p><strong><i class="ri-calendar-line"></i> Meeting:</strong> ${escapeHtml(club.meetingSchedule) || 'N/A'}</p>
            </div>
            ${actionsHTML}
        `;
        grid.appendChild(card);
    });
}

function searchClubs() {
    const searchTerm = document.getElementById('club-search').value.toLowerCase();
    const filtered = clubs.filter(club => 
        club.name.toLowerCase().includes(searchTerm) ||
        (club.description && club.description.toLowerCase().includes(searchTerm))
    );
    displayClubs(filtered);
}

async function filterByCategory() {
    const category = document.getElementById('category-filter').value;
    
    if (category === '') {
        displayClubs(clubs);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/clubs/category/${category}`);
        const filtered = await response.json();
        displayClubs(filtered);
    } catch (error) {
        console.error('Error filtering clubs:', error);
    }
}

function showClubModal() {
    currentClubId = null;
    document.getElementById('club-modal-title').textContent = 'Add New Club';
    document.getElementById('club-form').reset();
    document.getElementById('club-id').value = '';
    document.getElementById('club-modal').classList.add('active');
}

function closeClubModal() {
    document.getElementById('club-modal').classList.remove('active');
}

function editClub(id) {
    const club = clubs.find(c => c.id === id);
    if (!club) return;
    
    currentClubId = id;
    document.getElementById('club-modal-title').textContent = 'Edit Club';
    document.getElementById('club-id').value = club.id;
    document.getElementById('club-name').value = club.name;
    document.getElementById('club-description').value = club.description || '';
    document.getElementById('club-category').value = club.category;
    document.getElementById('club-president').value = club.president || '';
    document.getElementById('club-email').value = club.email || '';
    document.getElementById('club-phone').value = club.phone || '';
    document.getElementById('club-schedule').value = club.meetingSchedule || '';
    
    document.getElementById('club-modal').classList.add('active');
}

async function saveClub(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';
    
    const club = {
        name: document.getElementById('club-name').value.trim(),
        description: document.getElementById('club-description').value.trim(),
        category: document.getElementById('club-category').value,
        president: document.getElementById('club-president').value.trim(),
        email: document.getElementById('club-email').value.trim(),
        phone: document.getElementById('club-phone').value.trim(),
        meetingSchedule: document.getElementById('club-schedule').value.trim()
    };
    
    try {
        let response;
        if (currentClubId) {
            response = await fetch(`${API_URL}/clubs/${currentClubId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(club)
            });
        } else {
            response = await fetch(`${API_URL}/clubs`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(club)
            });
        }
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (response.ok) {
            closeClubModal();
            await loadClubs();
            showNotification('success', currentClubId ? 'Club updated successfully!' : 'Club created successfully!');
        } else {
            throw new Error('Failed to save club');
        }
    } catch (error) {
        console.error('Error saving club:', error);
        showNotification('error', 'Failed to save club. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function deleteClub(id) {
    const confirmed = await confirmAction(
        'Delete Club?',
        'Are you sure you want to delete this club? This will also delete all associated members and events.',
        'Yes, delete it!'
    );
    
    if (!confirmed) return;
    
    try {
        const response = await fetch(`${API_URL}/clubs/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (response.ok) {
            await Promise.all([loadClubs(), loadMembers(), loadEvents()]);
            showNotification('success', 'Club deleted successfully!');
        } else {
            throw new Error('Failed to delete club');
        }
    } catch (error) {
        console.error('Error deleting club:', error);
        showNotification('error', 'Failed to delete club. Please try again.');
    }
}

// ==================== MEMBERS ====================

async function loadMembers() {
    try {
        showLoadingSpinner('members-tbody');
        const response = await fetch(`${API_URL}/members`, {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let allMembers = await response.json();
        
        // Filter members based on user role
        if (userRole === 'OVERALL_CLUB_HEAD') {
            // Overall Club Head can see all members
            members = allMembers;
        } else if (userRole === 'CLUB_COORDINATOR' || userRole === 'CLUB_PRESIDENT') {
            // Coordinators and Presidents can only see members of their club
            if (userClubId) {
                members = allMembers.filter(member => member.club && member.club.id === userClubId);
            } else {
                members = [];
            }
        } else {
            members = allMembers;
        }
        
        displayMembers();
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading members:', error);
        showError('members-tbody', 'Failed to load members.');
    }
}

function displayMembers() {
    const tbody = document.getElementById('members-tbody');
    tbody.innerHTML = '';
    
    if (members.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-light);">
                    <i class="ri-team-line" style="font-size: 4rem; margin-bottom: 1rem; display: block;"></i>
                    <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">No members found</h4>
                    <p>${userRole === 'OVERALL_CLUB_HEAD' ? 'Add your first member to get started!' : 'No members in your club yet.'}</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const canEdit = userRole === 'OVERALL_CLUB_HEAD' || userRole === 'CLUB_COORDINATOR';
    const canDelete = userRole === 'OVERALL_CLUB_HEAD';
    
    members.forEach(member => {
        const club = clubs.find(c => c.id === member.club?.id);
        const tr = document.createElement('tr');
        
        const actionsHTML = (canEdit || canDelete) ? `
            <td>
                ${canEdit ? `<button class="btn btn-edit" onclick="editMember(${member.id})">
                    <i class="ri-edit-line"></i>
                </button>` : ''}
                ${canDelete ? `<button class="btn btn-danger" onclick="deleteMember(${member.id})">
                    <i class="ri-delete-bin-line"></i>
                </button>` : ''}
            </td>
        ` : '<td>-</td>';
        
        tr.innerHTML = `
            <td><i class="ri-user-line"></i> ${escapeHtml(member.name)}</td>
            <td><i class="ri-mail-line"></i> ${escapeHtml(member.email)}</td>
            <td>${escapeHtml(member.phone) || 'N/A'}</td>
            <td><span style="padding: 0.25rem 0.75rem; background: var(--bg-color); border-radius: 1rem; font-size: 0.85rem;">${escapeHtml(member.role) || 'Member'}</span></td>
            <td>${club ? escapeHtml(club.name) : 'N/A'}</td>
            <td>${new Date(member.joinDate).toLocaleDateString()}</td>
            ${actionsHTML}
        `;
        tbody.appendChild(tr);
    });
}

function populateClubSelects() {
    const memberClubSelect = document.getElementById('member-club');
    const eventClubSelect = document.getElementById('event-club');
    
    [memberClubSelect, eventClubSelect].forEach(select => {
        select.innerHTML = '<option value="">Select Club</option>';
        clubs.forEach(club => {
            const option = document.createElement('option');
            option.value = club.id;
            option.textContent = club.name;
            select.appendChild(option);
        });
    });
}

function showMemberModal() {
    currentMemberId = null;
    document.getElementById('member-modal-title').textContent = 'Add New Member';
    document.getElementById('member-form').reset();
    document.getElementById('member-id').value = '';
    document.getElementById('member-modal').classList.add('active');
}

function closeMemberModal() {
    document.getElementById('member-modal').classList.remove('active');
}

function editMember(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    currentMemberId = id;
    document.getElementById('member-modal-title').textContent = 'Edit Member';
    document.getElementById('member-id').value = member.id;
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-email').value = member.email;
    document.getElementById('member-phone').value = member.phone || '';
    document.getElementById('member-role').value = member.role || '';
    
    // Note: We can't change the club in edit mode for simplicity
    const club = clubs.find(c => c.id === member.club?.id);
    if (club) {
        document.getElementById('member-club').value = club.id;
    }
    
    document.getElementById('member-modal').classList.add('active');
}

async function saveMember(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';
    
    const member = {
        name: document.getElementById('member-name').value.trim(),
        email: document.getElementById('member-email').value.trim(),
        phone: document.getElementById('member-phone').value.trim(),
        role: document.getElementById('member-role').value.trim()
    };
    
    const clubId = document.getElementById('member-club').value;
    
    if (!clubId) {
        showNotification('error', 'Please select a club');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        return;
    }
    
    try {
        let response;
        if (currentMemberId) {
            response = await fetch(`${API_URL}/members/${currentMemberId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(member)
            });
        } else {
            response = await fetch(`${API_URL}/members/club/${clubId}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(member)
            });
        }
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (response.ok) {
            closeMemberModal();
            await loadMembers();
            showNotification('success', currentMemberId ? 'Member updated successfully!' : 'Member added successfully!');
        } else {
            throw new Error('Failed to save member');
        }
    } catch (error) {
        console.error('Error saving member:', error);
        showNotification('error', 'Failed to save member. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function deleteMember(id) {
    const confirmed = await confirmAction(
        'Delete Member?',
        'Are you sure you want to delete this member?',
        'Yes, delete it!'
    );
    
    if (!confirmed) return;
    
    try {
        const response = await fetch(`${API_URL}/members/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (response.ok) {
            await loadMembers();
            showNotification('success', 'Member deleted successfully!');
        } else {
            throw new Error('Failed to delete member');
        }
    } catch (error) {
        console.error('Error deleting member:', error);
        showNotification('error', 'Failed to delete member. Please try again.');
    }
}

// ==================== EVENTS ====================

async function loadEvents() {
    try {
        showLoadingSpinner('events-grid');
        const response = await fetch(`${API_URL}/events`, {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let allEvents = await response.json();
        
        // Filter events based on user role
        if (userRole === 'OVERALL_CLUB_HEAD') {
            // Overall Club Head can see all events
            events = allEvents;
        } else if (userRole === 'CLUB_COORDINATOR' || userRole === 'CLUB_PRESIDENT') {
            // Coordinators and Presidents can only see events of their club
            if (userClubId) {
                events = allEvents.filter(event => event.club && event.club.id === userClubId);
            } else {
                events = [];
            }
        } else {
            events = allEvents;
        }
        
        displayEvents();
        updateDashboardStats();
    } catch (error) {
        console.error('Error loading events:', error);
        showError('events-grid', 'Failed to load events.');
    }
}

function displayEvents() {
    const grid = document.getElementById('events-grid');
    grid.innerHTML = '';
    
    if (events.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-light);">
                <i class="ri-calendar-event-line" style="font-size: 4rem; margin-bottom: 1rem; display: block;"></i>
                <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">No events found</h3>
                <p>${userRole === 'OVERALL_CLUB_HEAD' ? 'Schedule your first event to get started!' : 'No events scheduled for your club.'}</p>
            </div>
        `;
        return;
    }
    
    const canEdit = userRole !== 'CLUB_PRESIDENT';
    const canDelete = userRole === 'OVERALL_CLUB_HEAD';
    const isAdmin = userRole === 'OVERALL_CLUB_HEAD';
    
    events.forEach(event => {
        const club = clubs.find(c => c.id === event.club?.id);
        const card = document.createElement('div');
        card.className = 'event-card';
        
        // Approval status badge
        const approvalBadge = event.approvalStatus ? `
            <span class="event-status" style="background: ${
                event.approvalStatus === 'APPROVED' ? '#10b981' : 
                event.approvalStatus === 'REJECTED' ? '#ef4444' : '#f59e0b'
            }; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; position: absolute; top: 50px; right: 15px;">
                ${event.approvalStatus}
            </span>
        ` : '';
        
        // Report buttons
        const reportButtons = `
            ${!event.preEventReport && event.approvalStatus === 'APPROVED' ? `
                <button class="btn btn-sm" style="background: #3b82f6; color: white; margin-right: 5px;" onclick="showPreReportModal(${event.id}, '${escapeHtml(event.title)}')">
                    <i class="ri-file-edit-line"></i> Pre-Event Report
                </button>
            ` : event.preEventReport ? `
                <span style="color: #10b981; font-size: 0.85rem; margin-right: 10px;">
                    <i class="ri-check-line"></i> Pre-Report Submitted
                </span>
            ` : ''}
            
            ${!event.postEventReport && event.status === 'COMPLETED' && event.approvalStatus === 'APPROVED' ? `
                <button class="btn btn-sm" style="background: #8b5cf6; color: white; margin-right: 5px;" onclick="showPostReportModal(${event.id}, '${escapeHtml(event.title)}')">
                    <i class="ri-file-text-line"></i> Post-Event Report
                </button>
            ` : event.postEventReport ? `
                <span style="color: #10b981; font-size: 0.85rem; margin-right: 10px;">
                    <i class="ri-check-line"></i> Post-Report Submitted
                </span>
            ` : ''}
        `;
        
        // Action buttons
        const actionsHTML = `
            <div class="card-actions" style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px;">
                ${reportButtons}
                ${canEdit && event.approvalStatus !== 'APPROVED' ? `<button class="btn btn-edit" onclick="editEvent(${event.id})">
                    <i class="ri-edit-line"></i> Edit
                </button>` : ''}
                ${canDelete ? `<button class="btn btn-danger" onclick="deleteEvent(${event.id})">
                    <i class="ri-delete-bin-line"></i> Delete
                </button>` : ''}
                ${isAdmin && event.approvalStatus === 'PENDING' ? `<button class="btn btn-success" onclick="showApprovalModal(${event.id})">
                    <i class="ri-eye-line"></i> Review
                </button>` : ''}
            </div>
        `;
        
        card.innerHTML = `
            <span class="event-status ${event.status}">${event.status}</span>
            ${approvalBadge}
            <h3><i class="ri-calendar-check-line"></i> ${escapeHtml(event.title)}</h3>
            <div class="card-info">
                <p><strong><i class="ri-file-text-line"></i> Description:</strong> ${escapeHtml(event.description) || 'N/A'}</p>
                <p><strong><i class="ri-calendar-line"></i> Date:</strong> ${new Date(event.eventDate).toLocaleString()}</p>
                <p><strong><i class="ri-map-pin-line"></i> Location:</strong> ${escapeHtml(event.location) || 'N/A'}</p>
                <p><strong><i class="ri-building-line"></i> Club:</strong> ${club ? escapeHtml(club.name) : 'N/A'}</p>
                ${event.participantsCount ? `<p><strong><i class="ri-group-line"></i> Participants:</strong> ${event.participantsCount}</p>` : ''}
                ${event.budget ? `<p><strong><i class="ri-money-rupee-circle-line"></i> Budget:</strong> ₹${event.budget}</p>` : ''}
                ${event.createdBy ? `<p style="font-size: 0.85rem; color: #6b7280;"><strong>Created by:</strong> ${event.createdBy}</p>` : ''}
                ${event.rejectionReason ? `<p style="color: #ef4444; font-size: 0.85rem;"><strong>Rejection Reason:</strong> ${escapeHtml(event.rejectionReason)}</p>` : ''}
            </div>
            ${actionsHTML}
        `;
        grid.appendChild(card);
    });
}

function showEventModal() {
    currentEventId = null;
    document.getElementById('event-modal-title').textContent = 'Add New Event';
    document.getElementById('event-form').reset();
    document.getElementById('event-id').value = '';
    document.getElementById('event-modal').classList.add('active');
}

function closeEventModal() {
    document.getElementById('event-modal').classList.remove('active');
}

function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    currentEventId = id;
    document.getElementById('event-modal-title').textContent = 'Edit Event';
    document.getElementById('event-id').value = event.id;
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-description').value = event.description || '';
    
    const eventDate = new Date(event.eventDate);
    const formattedDate = eventDate.toISOString().slice(0, 16);
    document.getElementById('event-date').value = formattedDate;
    
    document.getElementById('event-location').value = event.location || '';
    document.getElementById('event-status').value = event.status;
    document.getElementById('event-participants').value = event.participantsCount || '';
    document.getElementById('event-budget').value = event.budget || '';
    
    const club = clubs.find(c => c.id === event.club?.id);
    if (club) {
        document.getElementById('event-club').value = club.id;
    }
    
    document.getElementById('event-modal').classList.add('active');
}

async function saveEvent(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Saving...';
    
    const eventData = {
        title: document.getElementById('event-title').value.trim(),
        description: document.getElementById('event-description').value.trim(),
        eventDate: document.getElementById('event-date').value,
        location: document.getElementById('event-location').value.trim(),
        status: document.getElementById('event-status').value,
        participantsCount: document.getElementById('event-participants').value || 0,
        budget: document.getElementById('event-budget').value || 0,
        createdBy: currentUser.username
    };
    
    const clubId = document.getElementById('event-club').value;
    
    if (!clubId) {
        showNotification('error', 'Please select a club');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        return;
    }
    
    try {
        let response;
        if (currentEventId) {
            response = await fetch(`${API_URL}/events/${currentEventId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(eventData)
            });
        } else {
            response = await fetch(`${API_URL}/events/club/${clubId}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(eventData)
            });
        }
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (response.ok) {
            closeEventModal();
            await loadEvents();
            showNotification('success', currentEventId ? 'Event updated successfully!' : 'Event created and sent for approval!');
        } else {
            throw new Error('Failed to save event');
        }
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('error', 'Failed to save event. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function deleteEvent(id) {
    const confirmed = await confirmAction(
        'Delete Event?',
        'Are you sure you want to delete this event?',
        'Yes, delete it!'
    );
    
    if (!confirmed) return;
    
    try {
        const response = await fetch(`${API_URL}/events/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (response.ok) {
            await loadEvents();
            showNotification('success', 'Event deleted successfully!');
        } else {
            throw new Error('Failed to delete event');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification('error', 'Failed to delete event. Please try again.');
    }
}

// ==================== UTILITY FUNCTIONS ====================

// XSS Prevention
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Loading Spinner
function showLoadingSpinner(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--text-light);">
                <i class="ri-loader-4-line" style="font-size: 3rem; animation: spin 1s linear infinite;"></i>
                <p style="margin-top: 1rem;">Loading...</p>
            </div>
        `;
    }
}

// Error Display
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--danger-color);">
                <i class="ri-error-warning-line" style="font-size: 3rem;"></i>
                <p style="margin-top: 1rem;">${escapeHtml(message)}</p>
                <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                    <i class="ri-refresh-line"></i> Retry
                </button>
            </div>
        `;
    }
}

// Notification System using SweetAlert2
function showNotification(type, message) {
    const iconType = type === 'success' ? 'success' : 'error';
    const title = type === 'success' ? 'Success!' : 'Error!';
    
    Swal.fire({
        icon: iconType,
        title: title,
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
}

// Confirmation dialog using SweetAlert2
async function confirmAction(title, text, confirmButtonText = 'Yes, delete it!') {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: confirmButtonText,
        cancelButtonText: 'Cancel'
    });
    
    return result.isConfirmed;
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const footer = document.querySelector('.footer');
    
    if (window.innerWidth > 1024) {
        // Desktop mode - remove mobile active class
        sidebar.classList.remove('active');
    } else {
        // Mobile mode - reset any expanded states
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
            footer.classList.remove('expanded');
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC to close modals
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        
        
        // Close user dropdown
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.remove('active');
        }
    }
    
    // Ctrl/Cmd + K for search focus
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchBox = document.querySelector('.search-box input');
        if (searchBox) {
            searchBox.focus();
        }
    }
});

// Event Approval Functions
let currentApprovalEventId = null;

async function loadPendingApprovals() {
    if (userRole !== 'OVERALL_CLUB_HEAD') return;
    
    try {
        const response = await fetch(`${API_URL}/events/pending-approval`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const pendingEvents = await response.json();
            const pendingCard = document.getElementById('pending-approvals-card');
            const pendingCount = document.getElementById('pending-count');
            const pendingContainer = document.getElementById('pending-approvals');
            
            if (pendingCard && pendingEvents.length > 0) {
                pendingCard.style.display = 'block';
                if (pendingCount) pendingCount.textContent = pendingEvents.length;
                
                if (pendingContainer) {
                    pendingContainer.innerHTML = pendingEvents.slice(0, 5).map(event => `
                        <div class="pending-item" style="padding: 10px; border-bottom: 1px solid #e5e7eb; cursor: pointer;" onclick="showApprovalModal(${event.id})">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${event.title}</strong>
                                    <p style="font-size: 0.85rem; color: #6b7280; margin: 5px 0 0 0;">
                                        ${event.club?.name || 'Unknown Club'} • ${new Date(event.eventDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <span class="badge" style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem;">Pending</span>
                            </div>
                        </div>
                    `).join('');
                }
            } else if (pendingCard) {
                pendingCard.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error loading pending approvals:', error);
    }
}

async function showApprovalModal(eventId) {
    try {
        const response = await fetch(`${API_URL}/events/${eventId}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const event = await response.json();
            currentApprovalEventId = eventId;
            
            const detailsContainer = document.getElementById('approval-event-details');
            detailsContainer.innerHTML = `
                <div style="padding: 20px;">
                    <h4>${event.title}</h4>
                    <p><strong>Description:</strong> ${event.description || 'N/A'}</p>
                    <p><strong>Date:</strong> ${new Date(event.eventDate).toLocaleString()}</p>
                    <p><strong>Location:</strong> ${event.location || 'N/A'}</p>
                    <p><strong>Expected Participants:</strong> ${event.participantsCount || 'N/A'}</p>
                    <p><strong>Budget:</strong> ₹${event.budget || 0}</p>
                    <p><strong>Created By:</strong> ${event.createdBy || 'Unknown'}</p>
                    <p><strong>Status:</strong> <span class="badge" style="background: #f59e0b; color: white; padding: 4px 8px; border-radius: 12px;">${event.approvalStatus}</span></p>
                </div>
            `;
            
            document.getElementById('approval-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading event details:', error);
        showNotification('error', 'Failed to load event details');
    }
}

function closeApprovalModal() {
    document.getElementById('approval-modal').style.display = 'none';
    currentApprovalEventId = null;
}

async function approveCurrentEvent() {
    if (!currentApprovalEventId) return;
    
    try {
        const response = await fetch(`${API_URL}/events/${currentApprovalEventId}/approve?approvedBy=${currentUser.username}`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showNotification('success', 'Event approved successfully!');
            closeApprovalModal();
            await loadPendingApprovals();
            await loadEvents();
        } else {
            throw new Error('Failed to approve event');
        }
    } catch (error) {
        console.error('Error approving event:', error);
        showNotification('error', 'Failed to approve event');
    }
}

async function showRejectReason() {
    const { value: reason } = await Swal.fire({
        title: 'Reject Event',
        input: 'textarea',
        inputLabel: 'Rejection Reason',
        inputPlaceholder: 'Enter the reason for rejection...',
        inputAttributes: {
            'aria-label': 'Enter the reason for rejection'
        },
        showCancelButton: true,
        confirmButtonText: 'Reject Event',
        confirmButtonColor: '#dc2626',
        cancelButtonText: 'Cancel'
    });
    
    if (reason) {
        await rejectCurrentEvent(reason);
    }
}

async function rejectCurrentEvent(reason) {
    if (!currentApprovalEventId) return;
    
    try {
        const response = await fetch(`${API_URL}/events/${currentApprovalEventId}/reject?rejectedBy=${currentUser.username}&reason=${encodeURIComponent(reason)}`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showNotification('success', 'Event rejected');
            closeApprovalModal();
            await loadPendingApprovals();
            await loadEvents();
        } else {
            throw new Error('Failed to reject event');
        }
    } catch (error) {
        console.error('Error rejecting event:', error);
        showNotification('error', 'Failed to reject event');
    }
}

// Pre-Event Report Functions
function showPreReportModal(eventId, eventTitle) {
    currentEventId = eventId;
    document.getElementById('pre-report-event-id').value = eventId;
    document.getElementById('pre-report-event-title').value = eventTitle;
    document.getElementById('pre-report-content').value = '';
    document.getElementById('pre-report-modal').style.display = 'block';
}

function closePreReportModal() {
    document.getElementById('pre-report-modal').style.display = 'none';
    currentEventId = null;
}

async function savePreReport(event) {
    event.preventDefault();
    
    const eventId = document.getElementById('pre-report-event-id').value;
    const report = document.getElementById('pre-report-content').value;
    
    try {
        const response = await fetch(`${API_URL}/events/${eventId}/pre-report`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(report)
        });
        
        if (response.ok) {
            showNotification('success', 'Pre-event report submitted successfully!');
            closePreReportModal();
            await loadEvents();
        } else {
            throw new Error('Failed to save report');
        }
    } catch (error) {
        console.error('Error saving pre-event report:', error);
        showNotification('error', 'Failed to save report');
    }
}

// Post-Event Report Functions
function showPostReportModal(eventId, eventTitle) {
    currentEventId = eventId;
    document.getElementById('post-report-event-id').value = eventId;
    document.getElementById('post-report-event-title').value = eventTitle;
    document.getElementById('post-report-content').value = '';
    document.getElementById('post-report-participants').value = '';
    document.getElementById('post-report-expense').value = '';
    document.getElementById('post-report-modal').style.display = 'block';
}

function closePostReportModal() {
    document.getElementById('post-report-modal').style.display = 'none';
    currentEventId = null;
}

async function savePostReport(event) {
    event.preventDefault();
    
    const eventId = document.getElementById('post-report-event-id').value;
    const report = document.getElementById('post-report-content').value;
    const participants = document.getElementById('post-report-participants').value;
    const expense = document.getElementById('post-report-expense').value;
    
    try {
        // First update the event with participants and expense
        const eventResponse = await fetch(`${API_URL}/events/${eventId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                participantsCount: participants || 0,
                actualExpense: expense || 0
            })
        });
        
        // Then save the post-event report
        const reportResponse = await fetch(`${API_URL}/events/${eventId}/post-report`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(report)
        });
        
        if (reportResponse.ok) {
            showNotification('success', 'Post-event report submitted successfully!');
            closePostReportModal();
            await loadEvents();
        } else {
            throw new Error('Failed to save report');
        }
    } catch (error) {
        console.error('Error saving post-event report:', error);
        showNotification('error', 'Failed to save report');
    }
}

