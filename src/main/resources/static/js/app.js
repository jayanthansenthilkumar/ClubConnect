const API_URL = 'http://localhost:8080/api';

let clubs = [];
let members = [];
let events = [];
let currentClubId = null;
let currentMemberId = null;
let currentEventId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadClubs();
    loadMembers();
    loadEvents();
    updateDashboardStats();
    initializeGlobalSearch();
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
    
    sidebar.classList.toggle('active');
    
    // For desktop, toggle collapsed state
    if (window.innerWidth > 1024) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        footer.classList.toggle('expanded');
    }
}

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
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('active');
    }
    
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
    
    const sectionElement = document.getElementById(section + '-section');
    if (sectionElement) {
        sectionElement.classList.add('active');
    }
    
    // Find the clicked nav item and activate it
    const clickedNavItem = event.target.closest('.nav-item');
    if (clickedNavItem) {
        clickedNavItem.classList.add('active');
    }
    
    // Load specific section data
    if (section === 'analytics') {
        updateAnalytics();
    } else if (section === 'dashboard') {
        updateDashboardStats();
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
        const response = await fetch(`${API_URL}/clubs`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        clubs = await response.json();
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
                <p>Create your first club to get started!</p>
            </div>
        `;
        return;
    }
    
    clubsToDisplay.forEach(club => {
        const card = document.createElement('div');
        card.className = 'card';
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
            <div class="card-actions">
                <button class="btn btn-edit" onclick="editClub(${club.id})">
                    <i class="ri-edit-line"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteClub(${club.id})">
                    <i class="ri-delete-bin-line"></i> Delete
                </button>
            </div>
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(club)
            });
        } else {
            response = await fetch(`${API_URL}/clubs`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(club)
            });
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
    if (!confirm('Are you sure you want to delete this club? This will also delete all associated members and events.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/clubs/${id}`, {
            method: 'DELETE'
        });
        
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
        const response = await fetch(`${API_URL}/members`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        members = await response.json();
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
                    <p>Add your first member to get started!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    members.forEach(member => {
        const club = clubs.find(c => c.id === member.club?.id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><i class="ri-user-line"></i> ${escapeHtml(member.name)}</td>
            <td><i class="ri-mail-line"></i> ${escapeHtml(member.email)}</td>
            <td>${escapeHtml(member.phone) || 'N/A'}</td>
            <td><span style="padding: 0.25rem 0.75rem; background: var(--bg-color); border-radius: 1rem; font-size: 0.85rem;">${escapeHtml(member.role) || 'Member'}</span></td>
            <td>${club ? escapeHtml(club.name) : 'N/A'}</td>
            <td>${new Date(member.joinDate).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-edit" onclick="editMember(${member.id})">
                    <i class="ri-edit-line"></i>
                </button>
                <button class="btn btn-danger" onclick="deleteMember(${member.id})">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </td>
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(member)
            });
        } else {
            response = await fetch(`${API_URL}/members/club/${clubId}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(member)
            });
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
    if (!confirm('Are you sure you want to delete this member?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/members/${id}`, {
            method: 'DELETE'
        });
        
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
        const response = await fetch(`${API_URL}/events`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        events = await response.json();
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
                <p>Schedule your first event to get started!</p>
            </div>
        `;
        return;
    }
    
    events.forEach(event => {
        const club = clubs.find(c => c.id === event.club?.id);
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <span class="event-status ${event.status}">${event.status}</span>
            <h3><i class="ri-calendar-check-line"></i> ${escapeHtml(event.title)}</h3>
            <div class="card-info">
                <p><strong><i class="ri-file-text-line"></i> Description:</strong> ${escapeHtml(event.description) || 'N/A'}</p>
                <p><strong><i class="ri-calendar-line"></i> Date:</strong> ${new Date(event.eventDate).toLocaleString()}</p>
                <p><strong><i class="ri-map-pin-line"></i> Location:</strong> ${escapeHtml(event.location) || 'N/A'}</p>
                <p><strong><i class="ri-building-line"></i> Club:</strong> ${club ? escapeHtml(club.name) : 'N/A'}</p>
            </div>
            <div class="card-actions">
                <button class="btn btn-edit" onclick="editEvent(${event.id})">
                    <i class="ri-edit-line"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteEvent(${event.id})">
                    <i class="ri-delete-bin-line"></i> Delete
                </button>
            </div>
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
        status: document.getElementById('event-status').value
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(eventData)
            });
        } else {
            response = await fetch(`${API_URL}/events/club/${clubId}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(eventData)
            });
        }
        
        if (response.ok) {
            closeEventModal();
            await loadEvents();
            showNotification('success', currentEventId ? 'Event updated successfully!' : 'Event created successfully!');
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
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/events/${id}`, {
            method: 'DELETE'
        });
        
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

// Notification System
function showNotification(type, message) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'ri-check-line' : 'ri-error-warning-line';
    const bgColor = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()">
            <i class="ri-close-line"></i>
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: calc(var(--header-height) + 1rem);
        right: 1rem;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
        display: flex;
        align-items: center;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
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
